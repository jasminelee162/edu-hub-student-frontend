<template>
  <div class="editor-container">
    <headerPage />
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <span class="document-title">{{ documentTitle }}</span>
        <el-tag type="success" v-if="collaborators.length > 0">
          协作中: {{ collaborators.length }} 人在线
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button size="small" @click="showHistory = true">
            <i class="el-icon-time"></i> 历史版本
          </el-button>
          <el-button size="small" @click="saveDocument">
            <i class="el-icon-finished"></i> 保存
          </el-button>
          <el-button size="small" @click="shareDocument">
            <i class="el-icon-share"></i> 分享
          </el-button>
        </el-button-group>
      </div>
    </div>
    <div class="editor-main">
      <div class="editor-content" >
        <component
            :is="currentComponent"
            :key="editorKey"
            :content="renderedContent"
            @text-change="onEditorContentChange"
        />
      </div>
      <div class="collaborator-sidebar">
        <h3>协作成员</h3>
        <div class="user-list">
          <div v-for="(user, index) in collaborators" :key="index" class="user-item">
            <el-avatar :size="36" :src="user.avatar || ''" icon="el-icon-user" />
            <span class="user-name">{{ user.userName }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="历史版本" :visible.sync="showHistory" width="60%">
      <el-timeline>
        <el-timeline-item
            v-for="(version, index) in versions"
            :key="version.id"
            :timestamp="version.time"
            placement="top"
        >
          <el-card>
            <div class="version-header">
              <span>版本 {{ index + 1 }}</span>
              <el-button size="mini" type="primary" @click="rollbackVersion(version.documentId)">
                恢复到此版本
              </el-button>
            </div>
            <div class="version-content">
              <p class="change-note">{{ version.changeNote }}</p>
              <div class="version-preview" v-html="version.preview"></div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <el-dialog title="分享文档" :visible.sync="showShareDialog" width="30%">
      <div class="share-link">
        <p>复制以下链接分享给其他人:</p>
        <el-input
            v-model="shareLink"
            readonly
            ref="shareInput"
            @focus="$refs.shareInput.select()"
        >
          <el-button slot="append" icon="el-icon-document-copy" @click="copyLink"></el-button>
        </el-input>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import headerPage from '@/components/header/header.vue'
import DocxViewer from '@/views/document/DocxViewer.vue'
import PdfViewer from '@/views/document/PdfViewer.vue'
import TextViewer from '@/views/document/TextViewer.vue'
import mammoth from 'mammoth'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import {
  getAllVersions,
  rollbackVersion,
  recordVersion,
  getTemplateContent
} from '@/api/api'
import axios  from "axios";
import {Container} from "element-ui";
import {log} from "video.js";

function decodeBase64ToUtf8(base64) {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(byteArray)
}

export async function decodeDocxBase64(base64) {
  try {
    const binary = atob(base64)
    const isZipFile = binary.startsWith('PK')

    if (isZipFile) {
      const arrayBuffer = Uint8Array.from(binary, c => c.charCodeAt(0)).buffer
      const result = await mammoth.convertToHtml({ arrayBuffer })
      return result.value
    } else {
      // 非docx：按UTF-8解码为HTML
      return decodeBase64ToUtf8(base64)
    }
  } catch (e) {
    console.error('解码失败', e)
    return '<p>文档解析失败</p>'
  }
}

export default {
  components: {headerPage, DocxViewer, PdfViewer, TextViewer},
  data() {
    return {
      // 新增：记录自身发送的内容（用于过滤）
      lastSentContent: '',
      // 新增：客户端唯一标识（区分自己和他人消息）
      clientId: Math.random().toString(36).slice(2, 10),
      // 新增：标记是否正在处理远程消息（防止触发本地发送）
      isProcessingRemote: false,

      websocket: null, // 保存WebSocket实例
      username: '用户' + Math.floor(Math.random() * 1000),
      fileType: '',
      renderedContent: '',
      currentComponent: 'DocxViewer',
      documentId: this.$route.params.id,
      documentTitle: '未命名文档',
      content: '',
      collaborators: [],
      versions: [],
      showHistory: false,
      showShareDialog: false,
      shareId: '',
      shareLink: this.$route.params.id || '',
      lastEditTime: 0,
      editorKey: 0,
      previousMessage: '',
      debounceTimer: null,
      lastContentLength: 0,
      lastSendTime: 0,
      minSendInterval: 300, // 最小发送间隔(ms)
      maxSendBuffer: 1000,  // 最大发送缓冲区大小(字符)
      isSending: false,
      pendingContent: null,
      sendQueue: [],
      //6
      saveContent: '',
      //6
      flag: false,
      //
      rollBackContent: '',
      //
      flag1: false
    }
  },
  //6
  async mounted() {
    this.versionInterval = setInterval(() => {
      this.loadVersions();
      this.initMembers();
    }, 1000); // 每5秒拉一次
  },
  //6
  created() {
    const userId = this.$store.state.user?.id;
    const isCreator = this.$route.query.templateId
    const exitTimeStr = localStorage.getItem(userId);
    console.log("iiiiiiiiiiiiii"+isCreator)
    console.log("yyyyyyyyyyyyyy"+exitTimeStr)
    if (!exitTimeStr) {
      console.log("没有存储退出时间");
      if (isCreator!==undefined) {
        this.initDocument()
        this.initWebSocket()
        this.initMembers()
      }else {
        this.initContent()
        this.initWebSocket()
        this.initMembers()
      }
    } else {
      const exitTime = new Date(exitTimeStr);
      const nowTime = new Date();
      if (isNaN(exitTime.getTime())) {
        console.log("存储的时间格式无效");
        return;
      }
      const timeDiffMs = Math.abs(nowTime.getTime() - exitTime.getTime());
      const isWithin1s = timeDiffMs <= 1000;
      if (isWithin1s) {
        this.initWebSocket()
        this.initMembers()
        this.initContent()
      } else {
        console.log("woshidyx")
        localStorage.removeItem(userId);
        if (isCreator!==undefined) {
          console.log("ababababab")
          this.initDocument()
          this.initWebSocket()
          this.initMembers()
        }else {
          console.log("mimimimii")
          this.initContent()
          this.initWebSocket()
          this.initMembers()
        }
      }
    }


  },
  beforeDestroy() {
    clearInterval(this.versionInterval);
    this.closeWebSocket()
  },
  methods: {
    async initMembers() {
      const token = localStorage.getItem('user_token')
      const mamRes = await axios.get('http://localhost:8080/members', {
        params: {documentId: this.documentId},
        headers: {
          'x_access_token': token
        }
      })
      try {
        // 后端发送的应该是 JSON 字符串，需要先解析
        const members = mamRes.data.data.data
        if (Array.isArray(members)) {
          this.collaborators = members
          console.log('当前成员：', this.collaborators)
        } else {
          console.warn('成员数据格式异常', members)
        }
      } catch (e) {
        console.error('解析协作成员失败：', e, mamRes.data.data.data)
      }
    },
    async initContent() {
      const token = localStorage.getItem('user_token')
      const res = await axios.get('http://localhost:8080/documentInit', {
        params: {documentId: this.documentId},
        headers: {
          'x_access_token': token
        }
      })
      const resFromInit = res.data.data.data
      const base64 = resFromInit.content
      const fileTypeInit = resFromInit.fileType
      // 判断文档类型进行初始化
      if (fileTypeInit === 'docx') {
        this.currentComponent = 'DocxViewer'
        const contentInit=await decodeDocxBase64(base64)
        const separatorIndex = contentInit.indexOf('|||');
        const content = contentInit.substring(separatorIndex + 3);
        this.renderedContent =content
        console.log("docx处理",contentInit)
      } else if (fileTypeInit === 'txt') {
        this.currentComponent = 'TextViewer'
        const contentInit=atob(base64)
        const separatorIndex = contentInit.indexOf('|||');
        const content = contentInit.substring(separatorIndex + 3);
        this.renderedContent =content

      } else if (fileTypeInit === 'pdf') {
        this.currentComponent = 'PdfViewer'
        this.renderedContent = base64 // pdf base64
      }
      this.content = this.renderedContent
      this.documentTitle = resFromInit.title
      console.log("不是创建者：", resFromInit)
      console.log("fileTypeInit:", fileTypeInit)
    },
    initWebSocket() {
      const sid = this.documentId
      const userId = this.$store.state.user?.id;

      // 判断浏览器是否支持 WebSocket
      if ('WebSocket' in window) {
        this.websocket = new WebSocket(`ws://localhost:8080/api/websocket/sharedText/${sid}?userId=${userId}`)
      } else if ('SockJS' in window) {
        this.websocket = new SockJS(`http://localhost:8080/api/websocket/sharedText/${sid}?userId=${userId}`)
      } else {
        this.$message.error('当前浏览器不支持WebSocket和SockJS')
        return
      }

      // 使用箭头函数保持this指向组件实例
      this.websocket.onopen = () => {
        console.log('WebSocket连接成功')
      }

      this.websocket.onmessage = (event) => {
        try {
          console.log("poooooooooooooooo")
          // 1. 解析JSON数据（后端返回的WebSocketResult对象）
          const result = event.data;
          console.log("result:"+result)
          const number = result.charAt(0);
          const data = result.slice(1);
          // 2. 根据number字段区分消息类型
          switch (number) {
            case '1':
              this.initMembers()
              // 处理成员加入信息（number=1）
              //this.handleMemberJoin(data);
              break;
            case '2':
              // 处理普通信息（number=2）
              console.log("nananananannanaanna")
              // 拆分clientId和内容（按|||分割）
              const separatorIndex = data.indexOf('|||');
              if (separatorIndex === -1) {
                // 无效格式，直接视为他人消息（兼容旧消息）
                this.processRemoteContent(data);
                return;
              }

              // 提取clientId和内容
              const senderClientId = data.substring(0, separatorIndex);
              const content = data.substring(separatorIndex + 3);
              //6
              this.saveContent = result.slice(1).substring(separatorIndex + 3);
              console.log("aaaaaaaaaaaaaaa" + this.saveContent);

              // 过滤自身发送的消息
              if (senderClientId === this.clientId) {
                console.log("忽略自身发送的消息");
                return;
              }
              // 处理他人消息
              this.processRemoteContent(content);
              this.updateTextBox(content)
              break;
            default:
              console.warn("未知消息类型", result.number);
          }
        } catch (error) {
          console.error("解析WebSocket消息失败", error);
        }
      }


      this.websocket.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
      }

      this.websocket.onclose = (event) => {
        console.log('WebSocket连接关闭')
        console.log('WebSocket连接关闭，状态码：', event.code);
        console.log('关闭原因：', event.reason);
        //6
        localStorage.setItem(userId, new Date().toString());

      }

      // 窗口关闭时确保关闭 WebSocket 连接
      window.addEventListener('beforeunload', this.closeWebSocket)

      // 使用Vue的nextTick确保DOM已渲染
      this.$nextTick(() => {
        if (this.$refs.editorContent) {
          // 使用箭头函数和组件方法
          this.$refs.editorContent.$el.addEventListener('input', this.handleInput)
          console.log('editorContent ref:', this.$refs.editorContent); // 检查ref类型

        }
      })
    },
    onEditorContentChange(content) {
      // 1. 远程消息导致的更新，直接忽略（防止循环）
      if (this.isProcessingRemote) {
        console.log("忽略远程更新触发的发送");
        return;
      }

      // 2. 内容和上次发送的完全一致，不发送
      if (content === this.lastSentContent) {
        console.log("内容未变化，不发送");
        return;
      }

      const currentLength = content.length;
      const lengthDiff = Math.abs(currentLength - this.lastContentLength);
      this.lastContentLength = currentLength;
      const timeSinceLastSend = Date.now() - this.lastSendTime;

      // 策略1：大段变更立即发送（保留）
      if (lengthDiff > 50) {
        console.log("大变更立即发送", lengthDiff);
        this.sendEditMessage(content);
        return;
      }

      // 策略2：频繁小幅变更合并（优化：队列延迟更长）
      if (timeSinceLastSend < this.minSendInterval) {
        console.log("频繁变更加入队列");
        this.queueMessage(content);
        return;
      }

      // 策略3：动态防抖（优化：长按/快速输入时防抖更强）
      const debounceTime = this.calculateDebounceTime(content, lengthDiff);
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.sendEditMessage(content);
      }, debounceTime);
    },

    // 计算防抖时间（针对性优化长按场景）
    calculateDebounceTime(content, lengthDiff) {
      // 基础时间：内容越长，防抖越短（确保大内容及时发送）
      let baseTime = Math.min(content.length / 15, 500);
      // 长按/微小变更（长度变化<5）时，延长防抖
      if (lengthDiff < 5) {
        baseTime *= 2; // 微小变更防抖加倍
      }
      // 快速输入时再延长
      const typingSpeed = this.calculateTypingSpeed();
      const speedFactor = typingSpeed > 8 ? 1.5 : 1; // 降低触发阈值，更容易进入强防抖
      // 最终防抖时间：最短400ms（比之前更长，减少高频发送）
      return Math.max(400, baseTime * speedFactor);
    },

    // 计算输入速度（长按判定优化）
    calculateTypingSpeed() {
      // 记录最近5次输入时间
      if (!this.typingHistory) this.typingHistory = [];
      this.typingHistory.push(Date.now());
      if (this.typingHistory.length > 5) this.typingHistory.shift();

      // 长按/连续输入时，时间间隔短→判定为快速输入
      if (this.typingHistory.length >= 4) {
        const totalInterval = this.typingHistory[4] - this.typingHistory[0];
        const avgInterval = totalInterval / 4; // 平均间隔
        // 平均间隔<200ms→判定为长按/快速输入，返回高值触发强防抖
        return avgInterval < 200 ? 15 : 5;
      }
      return 5; // 正常输入
    },

    // 队列消息（只保留最新内容）
    queueMessage(content) {
      // 过滤和上一条相同的内容
      if (this.sendQueue.length > 0 && this.sendQueue[this.sendQueue.length - 1] === content) {
        return;
      }
      this.sendQueue.push(content);
      // 只保留最后1条（彻底避免队列堆积）
      if (this.sendQueue.length > 1) {
        this.sendQueue = [this.sendQueue[this.sendQueue.length - 1]];
      }
      if (!this.isSending) {
        this.processSendQueue();
      }
    },

    // 处理队列（延迟更长，合并长按输入）
    processSendQueue() {
      if (this.sendQueue.length === 0) {
        this.isSending = false;
        return;
      }
      this.isSending = true;
      // 延迟500ms发送（给长按输入足够的合并时间）
      setTimeout(() => {
        const content = this.sendQueue.pop();
        this.sendQueue = [];
        this.sendEditMessage(content);
      }, 500);
    },

    // 发送消息（用分隔符标记clientId，不使用JSON）
    sendEditMessage(content) {
      this.lastSendTime = Date.now();
      this.lastSentContent = content; // 记录自身发送的内容
      this.pendingContent = content;
      this.saveContent=content;
      //6
      if (this.flag === true) {
        console.log("行不行啊：" + this.saveContent)
        content = this.content;
        this.saveContent=this.content
        console.log("真实够了：" + this.content)
        this.flag = false;
      }
      //6
      if (this.flag1 === true) {
        content = this.rollBackContent;
        console.log("rorororororororororoback"+content)
        this.flag1 = false;
      }
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        // 格式：clientId|||实际内容（用|||作为分隔符，避免和内容冲突）
        const message = `${this.clientId}|||${content}`;
        console.log("mmmmmmmmmmmmmmmmm:" + message)
        console.log("nnnnnnnnnnnnnnnnn:" + this.saveContent);
        this.websocket.send(message);
        console.log("发送消息:", message);
      }

      this.isSending = false;
      if (this.sendQueue.length > 0) {
        this.processSendQueue();
      }
    },

    // 处理远程内容（标记远程更新，避免触发本地发送）
    processRemoteContent(content) {
      this.isProcessingRemote = true; // 标记为远程更新
      this.updateTextBox(content);
      this.isProcessingRemote = false; // 处理完重置
    },

    // 更新本地内容（保持原有逻辑）
    updateTextBox(content) {
      if (content !== this.previousMessage) {
        this.content = content;
        this.previousMessage = content;
        this.renderedContent = content;
        this.saveContent=content;
      }
    },
    handleMemberJoin(content) {
      this.collaborators = content.split('#');
    },
    async initDocument() {
      const templateId = this.$route.query.templateId
      if (!templateId) return
      try {
        const res = await getTemplateContent(templateId)
        this.documentTitle = res.data.name || '未命名模板'
        this.fileType = res.data.fileType || 'docx'

        switch (this.fileType) {
          case 'docx':
            this.currentComponent = 'DocxViewer'
            this.renderedContent = await decodeDocxBase64(res.data.fileContent)
            this.content = this.renderedContent
            this.saveContent = this.content
            break
          case 'pdf':
            this.currentComponent = 'PdfViewer'
            this.renderedContent = res.data.fileContent
            this.content = res.data.fileContent
            break
          case 'txt':
            this.currentComponent = 'TextViewer'
            this.renderedContent = atob(res.data.fileContent)
            this.content = this.renderedContent
            this.saveContent = this.content
            break
          default:
            this.$message.error('不支持的文档类型')
        }
      } catch (e) {
        console.error('加载模板失败', e)
        this.$message.error('模板加载失败')
      }
    }

    ,

    closeWebSocket() {
      if (this.websocket) {
        this.websocket.close()
        window.removeEventListener('beforeunload', this.closeWebSocket)
      }
    },

    // 其他已有方法保持不变...
    shareDocument() {
      this.showShareDialog = true
    },
    copyLink() {
      this.$refs.shareInput.select()
      document.execCommand('copy')
      this.$message.success('链接已复制')
    },
    async saveDocument() {
      try {
        const {value} = await this.$prompt('请输入变更说明', '保存文档', {
          confirmButtonText: '保存', cancelButtonText: '取消',
          inputPattern: /.+/, inputErrorMessage: '说明不能为空'
        })

        //6
        const res = await recordVersion(this.documentId, this.saveContent, value)
        console.log("保存的内容111111111111111111111：" + this.saveContent);
        //6
        this.content = this.saveContent;
        if (res.code === 1000) {
          this.$message.success('保存成功')
          console.log("ppppppppppppppppppppppppppppp")
          console.log("这时候的saveContent" + this.saveContent);
          console.log("这时候的content" + this.content);
          //6
          this.flag = true
          this.loadVersions()
          this.sendEditMessage()
        } else {
          this.$message.error('保存失败: ' + (res.message || '未知错误'))
        }
      } catch (error) {
        if (error === 'cancel') {
          // 用户点击了“取消”，不提示错误
          console.log('用户取消了保存')
          return
        }
        console.error('保存出错:', error)
        this.$message.error('保存出错: ' + (error.message || '未知错误'))
      }

    }, async loadVersions() {
      const res = await getAllVersions(this.documentId)
      this.versions = res.data.map(v => ({
        ...v,
        preview: (v.content || '').substring(0, 100) + '...'
      }))
    }, async rollbackVersion(versionId) {
      const userId = this.$store.state.user?.id
      if (!userId) return this.$message.error('未登录，无法恢复')
      await this.$confirm('确定恢复到此版本吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      })
      const res = await rollbackVersion(versionId, userId)
      if (res.code !== 1000) return this.$message.error(res.message || '恢复失败')
      //6
      this.flag1 = true;
      const data = res.data
      this.fileType='docx'
      switch (this.fileType) {
        case 'docx':
          this.currentComponent = 'DocxViewer'
          try {
            this.renderedContent = await decodeDocxBase64(data)
          } catch {
            this.renderedContent = atob(data)
          }
          this.content = this.renderedContent
          this.rollBackContent = this.renderedContent
          break
        case 'pdf':
          this.currentComponent = 'PdfViewer'
          this.renderedContent = data
          this.content = data
          break
        case 'txt':
          this.currentComponent = 'TextViewer'
          this.renderedContent = atob(data)
          this.content = this.renderedContent
          this.rollBackContent = this.renderedContent
          break
        default:
          this.$message.error('不支持的文档类型')
      }

      this.editorKey++
      this.sendEditMessage()
      this.$message.success('恢复成功')
    }


  }

}
</script>

<style>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: url('@/assets/image/index/index_back.png') no-repeat center center;
  background-size: cover;
  font-family: '黑体', sans-serif;
  color: #1F4E79;
}

.editor-toolbar {
  background: url('@/assets/image/index/index_back.png') no-repeat center center;
  padding: 12px 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  font-size: 18px;
}

.document-title {
  font-weight: 700;
  font-size: 20px;
  color: #1F4E79;
  margin-right: 12px;
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px 24px;
  gap: 20px;
  background-color: rgba(255, 255, 255, 0.9);
}

.editor-content {
  flex: 1;
  background: url('@/assets/image/index/index_back.png') no-repeat center center;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  font-size: 16px;
  color: #333;
  min-height: 0; /* 防止过高撑破布局 */
}

.collaborator-sidebar {
  width: 250px;
  background: url('@/assets/image/index/index_back.png') no-repeat center center;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.collaborator-sidebar h3 {
  font-weight: 700;
  color: #1F4E79;
  margin-bottom: 16px;
  font-size: 18px;
  border-bottom: 2px solid #C8BFFF;
  padding-bottom: 6px;
}

.user-list {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.user-name {
  margin-left: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.change-note {
  font-weight: 700;
  color: #7A49FF;
  margin-bottom: 12px;
  font-size: 14px;
}

.version-preview {
  max-height: 110px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  background: #fafafa;
  font-size: 14px;
  color: #555;
  white-space: pre-wrap;
}

.share-link {
  padding: 12px;
  font-size: 15px;
  color: #1F4E79;
}

.el-dialog__footer .el-button {
  min-width: 110px;
  font-weight: 700;
  border-radius: 8px;
}

.el-dialog__footer .el-button--primary {
  background-color: #C8BFFF;
  border-color: #C8BFFF;
  color: white;
}

.el-dialog__footer .el-button--primary:hover {
  background-color: #B29EFF;
  border-color: #B29EFF;
}

.el-button-group .el-button {
  font-weight: 600;
  font-size: 14px;
  color: #1F4E79;
  border-radius: 8px;
  padding: 6px 14px;
}

.el-button-group .el-button:hover {
  background-color: #B29EFF !important;
  color: white !important;
}

/* 图标间距调整 */
.el-button i {
  margin-right: 6px;
}
/* 保存提示框统一样式 */
.el-message-box {
  border-radius: 16px;
  font-family: '黑体', sans-serif;
  background-color: #f0f4ff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  min-width: 400px;
}

.el-message-box__header {
  background-color: #f0f4ff;
  border-bottom: 1px solid #f0f4ff;
  color: #1F4E79;
  font-weight: 700;
  font-size: 20px;
  padding: 18px 24px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.el-message-box__content {
  padding: 24px;
  font-size: 16px;
  color: #444;
}

.el-message-box {
  border-radius: 16px !important;
  font-family: '黑体', sans-serif !important;
  background-color: #f0f4ff !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

/* 按钮容器 */
.el-message-box__btns {
  padding: 18px 24px !important;
  display: flex !important;
  justify-content: flex-end !important;
  gap: 12px !important;
}

/* 确认按钮 */
.el-message-box__btn--confirm {
  background-color: #C8BFFF !important;
  border-color: #C8BFFF !important;
  color: white !important;
  min-width: 100px !important;
  font-weight: bold !important;
  border-radius: 8px !important;
}

/* 取消按钮 */
.el-message-box__btn--cancel {
  color: #1F4E79 !important;
  background: transparent !important;
  border: none !important;
  min-width: 100px !important;
  font-weight: bold !important;
}

/* 悬停状态 */
.el-message-box__btn--confirm:hover {
  background-color: #B29EFF !important;
  border-color: #B29EFF !important;
}
</style>