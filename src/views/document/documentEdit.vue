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

export default {
  components: { headerPage, DocxViewer, PdfViewer, TextViewer },
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
      shareId: '',
      shareLink: this.$route.params.id || '',
      lastEditTime: 0,
      editorKey: 0,
    }
  },
  created() {
    this.loadVersions()
    const isCreator = !!this.$route.query.templateId
    if (isCreator) this.initDocument()
    this.initWebSocket()
  },
  beforeDestroy() {
    if (this.stompClient) this.stompClient.deactivate()
  },
  methods: {
    initWebSocket() {
      const userId = this.$store.state.user?.id;
      if (!userId) {
        console.error('无法建立WebSocket连接：未获取到用户ID');
        return;
      }
      const socket = new SockJS('http://localhost:8080/ws-doc')
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          userId: userId
        },
        debug: str => console.log('[STOMP]', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      })

      this.stompClient.onConnect = () => {
        this.stompClient.subscribe(`/topic/document/${this.documentId}`, message => {
          const binary = message.binaryBody || message.body
          const text = new TextDecoder('utf-8').decode(binary)
          this.renderedContent = text
          this.content = text
        })

        this.stompClient.subscribe(`/user/queue/init`, message => {
          console.log('📥 收到初始化内容:', message)
          const binary = message.binaryBody || message.body
          const text = new TextDecoder('utf-8').decode(binary)
          this.renderedContent = text
          this.content = text
          this.$message.success('文档初始化成功:');
        })

        this.stompClient.subscribe(`/topic/document/${this.documentId}/join`, message => {
          const users = JSON.parse(message.body)
          this.collaborators = users.map(name => ({ id: name, name, avatar: '' }))
        })

        // 发送初始化消息时必须包含userId
        this.stompClient.publish({
          destination: `/app/${this.documentId}/init`,
          headers: {
            userId: userId
          },
          body: null  // 明确传null
        });
      }

      this.stompClient.activate()
    },

    onEditorContentChange(content) {
      const now = Date.now()
      if (now - this.lastEditTime > 300) {
        this.renderedContent = content
        this.content = content
        this.sendEditMessage()
        this.lastEditTime = now
      }
    },

    sendEditMessage() {
      if (this.stompClient?.connected) {
        const userId = this.$store.state.user?.id
        const encoder = new TextEncoder()
        const binary = encoder.encode(this.content)
        // 发送编辑内容（binary 可以是 Uint8Array 或字符串）
        this.stompClient.publish({
          destination: `/app/${this.documentId}/edit`,
          headers: {
            'content-type': 'application/octet-stream',
            userId: userId  // 必须包含
          },
          body: binary
        })
      }
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
      } catch (e) {
        console.error('加载模板失败', e)
        this.$message.error('模板加载失败')
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
          confirmButtonText: '保存', cancelButtonText: '取消',
          inputPattern: /.+/, inputErrorMessage: '说明不能为空'
        })

        const res = await recordVersion(this.documentId, this.content, value)
        if (res.code === 1000) {
          this.$message.success('保存成功')
          this.loadVersions()
          this.sendEditMessage()
        } else {
          this.$message.error('保存失败: ' + (res.message || '未知错误'))
        }
      } catch (error) {
        console.error('保存出错:', error)
        this.$message.error('保存出错: ' + error.message)
      }
    },

    async rollbackVersion(versionId) {
      const userId = this.$store.state.user?.id
      if (!userId) return this.$message.error('未登录，无法恢复')
      await this.$confirm('确定恢复到此版本吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      })
      const res = await rollbackVersion(versionId, userId)
      if (res.code !== 1000) return this.$message.error(res.message || '恢复失败')

      const data = res.data
      switch (this.fileType) {
        case 'docx':
          this.currentComponent = 'DocxViewer'
          try {
            this.renderedContent = await decodeDocxBase64(data)
          } catch {
            this.renderedContent = atob(data)
          }
          this.content = this.renderedContent
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
          break
        default:
          this.$message.error('不支持的文档类型')
      }

      this.editorKey++
      this.sendEditMessage()
      this.$message.success('恢复成功')
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