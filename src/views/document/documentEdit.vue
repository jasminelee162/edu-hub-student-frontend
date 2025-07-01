<template>
  <div class="editor-container">
    <headerPage></headerPage>
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <span class="document-title">{{ documentTitle }}</span>
        <el-tag type="success" v-if="collaborators.length > 0">
          协作中: {{ collaborators.length }}人在线
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
        <quill-editor
            v-model="content"
            ref="editor"
            :options="editorOptions"
            @change="onEditorChange"
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
            <div slot="header" class="version-header">
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
import {
  initDocument,
  getAllVersions,
  rollbackVersion,
  recordVersion
} from '@/api/api'

export default {
  components: { headerPage, quillEditor },
  data() {
    return {
      documentId: this.$route.params.id,
      documentTitle: '未命名文档',
      content: '',
      collaborators: [],
      versions: [],
      showHistory: false,
      showShareDialog: false,
      shareLink: `${window.location.origin}/editor/${this.$route.params.id}`,
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
  },
  methods: {
    async initDocument() {
      const res = await initDocument(this.documentId, this.$store.state.user.id)
      this.content = res.data.content
      this.documentTitle = res.data.title || '未命名文档'
    },
    async loadVersions() {
      const res = await getAllVersions(this.documentId)
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
      await recordVersion(this.documentId, this.content, value)
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
      // 此处用于WebSocket实时同步逻辑
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
</style>