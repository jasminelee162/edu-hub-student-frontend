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
      <div class="editor-content">
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
          <div v-for="user in collaborators" :key="user.id" class="user-item">
            <el-avatar :size="36" :src="user.avatar"></el-avatar>
            <span class="user-name">{{ user.name }}</span>
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
              <span>版本 {{ versions.length - index }}</span>
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
import axios from "@/utils/request";
import { Client } from '@stomp/stompjs'
import {
  getAllVersions,
  rollbackVersion,
  recordVersion,
  getTemplateContent
} from '@/api/api'

function decodeDocxBase64(base64) {
  const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer
  return mammoth.convertToHtml({ arrayBuffer }).then(result => result.value)
}

function isBase64Html(base64) {
  const decoded = atob(base64)
  return decoded.trim().startsWith('<') && decoded.includes('</p>')
}

export default {
  components: {
    headerPage,
    DocxViewer,
    PdfViewer,
    TextViewer
  },
  data() {
    return {
      stompClient: null,
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
      shareId: '', // 保存分享 ID
      shareLink: this.$route.params.id || '', // 初始空
      lastEditTime: 0,
      editorKey: 0,
    }
  },
  created() {
    this.initDocument()
    this.loadVersions()
    this.initWebSocket()
  },
  beforeDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate()
    }
  },
  methods: {
    initWebSocket() {
      const socket = new SockJS('http://localhost:8080/ws-doc')
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: str => console.log('[STOMP]', str),
        reconnectDelay: 5000
      })

      this.stompClient.onConnect = () => {
        this.stompClient.subscribe(`/topic/document/${this.documentId}`, message => {
          const msg = JSON.parse(message.body)
          if (msg.username !== this.username) {
            this.renderedContent = msg.content
            this.content = msg.content
            this.loadVersions() // 新增：同步刷新版本列表
          }
        })
      }

      this.stompClient.activate()
    },

    onEditorContentChange(content) {
      const now = Date.now()
      if (now - this.lastEditTime > 300) {
        // 更新两个内容变量以确保一致性
        this.renderedContent = content
        this.content = content
        this.sendEditMessage()
        this.lastEditTime = now
      }
    },

    sendEditMessage() {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.publish({
          destination: `/app/${this.documentId}/edit`,
          body: JSON.stringify({
            documentId: this.documentId,
            content: this.content,
            username: this.username
          })
        })
      }
    },

    async initDocument() {
      this.documentTitle = '未命名文档'
      this.fileType = 'docx'
      this.currentComponent = 'DocxViewer'

      try {
        // 优先读取版本记录
        const versionRes = await getAllVersions(this.documentId)

        const versions = versionRes.data || []
        console.log("版本：",versionRes)
        const latest = versions.length > 1 ? versions[versions.length - 1] : null
        const templateId = this.$route.query.templateId
        if (!templateId) {
          this.$message.error('缺少模板 ID')
          return
        }

        const res = await getTemplateContent(templateId)
        this.documentTitle = res.data.name || '未命名模板'
        this.fileType = res.data.fileType || 'docx'

        if (latest && latest.documentId) {
          // 使用最近一次保存的内容
          const res = await rollbackVersion(latest.documentId)
          console.log("使用最近一次保存的内容",res)


          switch (this.fileType) {
            case 'docx':
              this.currentComponent = 'DocxViewer'
              try {
                // 尝试用 mammoth 解析
                const html = await decodeDocxBase64(res.data)
                this.renderedContent = html
                this.content = html
              } catch (e) {
                // 如果不是 docx zip 格式，那就直接当 HTML Base64 解码
                this.renderedContent = atob(res.data)
                this.content = this.renderedContent
              }

              break
            case 'pdf':
              this.currentComponent = 'PdfViewer'
              this.renderedContent = res.data
              this.content = res.data
              break
            case 'txt':
              this.currentComponent = 'TextViewer'
              this.renderedContent = atob(res.data)
              this.content = this.renderedContent
              break
            default:
              this.$message.error('不支持的文档类型')
          }

        } else {
          // 如果没有版本记录，才从模板加载
          console.log("从模板加载")
          const res = await getTemplateContent(templateId)
          console.log("从模板加载",res)
          switch (this.fileType) {
            case 'docx':
              this.currentComponent = 'DocxViewer'
              this.renderedContent = await decodeDocxBase64(res.data.fileContent)
              this.content = this.renderedContent
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
              break
            default:
              this.$message.error('不支持的文档类型')
          }
        }
      } catch (e) {
        console.error('文档初始化失败', e)
        this.$message.error('文档加载失败')
      }
    },

    async loadVersions() {
      const res = await getAllVersions(this.documentId)

      this.versions = res.data.map(v => ({
        ...v,
        preview: (v.content || '').substring(0, 100) + '...'
      }))
    },

    async saveDocument() {
      try {
        const { value } = await this.$prompt('请输入变更说明', '保存文档', {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '说明不能为空'
        })

        // 确保使用最新的content
        const contentToSave = this.content

        console.log('准备保存的内容:', contentToSave) // 调试日志

        const res = await recordVersion(this.documentId, contentToSave, value)

        if (res.code === 1000) {
          this.$message.success('保存成功')

          this.loadVersions()
          this.sendEditMessage()
        } else {
          this.$message.error('保存失败: ' + (res.message || '未知错误'))
        }
      } catch (error) {
        console.error('保存出错:', error)
        this.$message.error('保存过程中出错: ' + error.message)
      }
    },

    async rollbackVersion(versionId) {
      const userId = this.$store.state.user?.id;
      if (!userId) {
        this.$message.error('未登录，无法恢复版本');
        return;
      }

      await this.$confirm('确定要恢复到此版本吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 传两个参数：versionId 和 userId
      const res = await rollbackVersion(versionId, userId);
      console.log("保存信息:"+ versionId +","+ userId)
      if (res.code !== 1000) {
        this.$message.error(res.message || '恢复失败');
        return;
      }

      console.log("恢复到选择版本", res)

      const data = res.data;
      switch (this.fileType) {
        case 'docx':
          this.currentComponent = 'DocxViewer';
          try {
            const html = await decodeDocxBase64(data);
            this.renderedContent = html;
            this.content = html;
          } catch (e) {
            this.renderedContent = atob(data);
            this.content = this.renderedContent;
          }
          break;
        case 'pdf':
          this.currentComponent = 'PdfViewer';
          this.renderedContent = data;
          this.content = data;
          break;
        case 'txt':
          this.currentComponent = 'TextViewer';
          this.renderedContent = atob(data);
          this.content = this.renderedContent;
          break;
        default:
          this.$message.error('不支持的文档类型');
      }

      this.editorKey++;
      this.sendEditMessage();
      this.$message.success('恢复成功');
    },

    shareDocument() {
      this.showShareDialog = true
    },

    copyLink() {
      this.$refs.shareInput.select()
      document.execCommand('copy')
      this.$message.success('链接已复制')
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