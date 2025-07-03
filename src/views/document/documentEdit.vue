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
    <component :is="currentComponent" :content="renderedContent" />
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
              <el-button size="mini" type="primary" @click="rollbackVersion(version.id)">
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
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import headerPage from '@/components/header/header.vue'
import mammoth from 'mammoth'
import {
  initDocument,
  getAllVersions,
  rollbackVersion,
  recordVersion,
  getTemplateContent, getTemplateList
} from '@/api/api'

import DocxViewer from "@/views/document/DocxViewer.vue";
import PdfViewer from "@/views/document/PdfViewer.vue";
import TextViewer from "@/views/document/TextViewer.vue";

function decodeDocxBase64(base64) {
  const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer
  return mammoth.convertToHtml({ arrayBuffer }).then(result => result.value)
}
export default {
  components: {
    headerPage,
    quillEditor,
    DocxViewer,
    PdfViewer,
    TextViewer
  },
  data() {
    return {
      fileType: '',
      decodedContent: '',
      renderedContent: '',
      currentComponent: 'DocxViewer',
      documentId: this.$route.params.id,
      documentTitle: '未命名文档',
      content: '',
      collaborators: [],
      versions: [],
      showHistory: false,
      showShareDialog: false,
      shareLink: `${window.location.origin}/documentEdit/${this.$route.params.id}`,
      editorOptions: {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
            ['link', 'image']
          ]
        }
      }
    }
  },
  created() {
    this.initDocument()
    this.loadVersions()
    const templateId = this.$route.query.templateId
    console.log('模板ID是：', templateId)
  },
  methods: {

    async initDocument() {
      const templateId = this.$route.query.templateId

      if (!templateId) {
        this.$message.error('缺少模板 ID，无法加载文档')
        return
      }
      const res = await getTemplateContent(templateId)
      console.log("文档内容：", res)
      this.documentTitle = res.data.name || '未命名模板'

      this.fileType = res.data.fileType || 'docx'

      switch (this.fileType) {
        case 'docx':
          this.currentComponent = 'DocxViewer'
          this.renderedContent = await decodeDocxBase64(res.data.fileContent)
          break
        case 'pdf':
          this.currentComponent = 'PdfViewer'
          this.renderedContent = res.data.fileContent // base64 PDF 字符串
          break
        case 'txt':
          this.currentComponent = 'TextViewer'
          this.renderedContent = atob(res.data.fileContent) // base64 解码为纯文本
          break
        default:
          this.$message.error('不支持的文档类型')
      }
    },
    async loadVersions() {
      const res = await getAllVersions(this.documentId) //要协作id
      this.versions = res.data.map(v => ({
        ...v,
        preview: this.truncateContent(v.content)
      }))
    },
    truncateContent(content) {
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    },
    async saveDocument() {
      const { value } = await this.$prompt('请输入变更说明', '保存文档', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '说明不能为空'
      })
      await recordVersion(this.documentId, this.content, value) //要协作id
      this.$message.success('保存成功')
      this.loadVersions()
    },
    async rollbackVersion(versionId) {
      await this.$confirm('确定要恢复到此版本吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const res = await rollbackVersion(versionId)
      this.content = res.data
      this.$message.success('恢复成功')
    },
    shareDocument() {
      this.showShareDialog = true
    },
    copyLink() {
      this.$refs.shareInput.select()
      document.execCommand('copy')
      this.$message.success('链接已复制')
    },
    onEditorChange() {
      // WebSocket 实时协作逻辑
    }
  }
}
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}
.editor-toolbar {
  background: #fff;
  padding: 10px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.document-title {
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
}
.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.editor-content {
  flex: 1;
  padding: 20px;
  background: #fff;
  margin: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}
.collaborator-sidebar {
  width: 220px;
  padding: 15px;
  background: #fff;
  margin: 10px 10px 10px 0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.user-list {
  margin-top: 10px;
}
.user-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.user-name {
  margin-left: 10px;
}
.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.change-note {
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}
.version-preview {
  max-height: 100px;
  overflow: hidden;
  border: 1px solid #eee;
  padding: 5px;
  border-radius: 3px;
  background: #f9f9f9;
}
.share-link {
  padding: 10px;
}
</style>
