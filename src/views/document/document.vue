<!-- pages/document/select.vue -->
<template>
  <div class="document-container">
    <headerPage></headerPage>
    <div class="document-header">
      <h1>共享协作文档系统</h1>
      <el-button type="primary" @click="showJoinDialog = true">加入协作</el-button>
    </div>

    <div class="template-section">
      <h2>选择模板开始协作</h2>
      <div class="template-list">
        <div
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            @click="selectTemplate(template)"
        >
          <div class="template-preview">
            <i class="el-icon-document" style="font-size: 48px;"></i>
          </div>
          <div class="template-info">
            <h3>{{ template.name }}</h3>
            <p>{{ template.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="加入协作" :visible.sync="showJoinDialog" width="30%">
      <el-form :model="joinForm" label-width="80px">
        <el-form-item label="文档ID">
          <el-input v-model="joinForm.documentId" placeholder="请输入文档ID"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showJoinDialog = false">取消</el-button>
        <el-button type="primary" @click="joinDocument">加入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import headerPage from '@/components/header/header.vue'
import { createDocument, initDocument } from '@/api/api'

export default {
  components: { headerPage },
  data() {
    return {
      templates: [
        { id: '1', name: '空白文档', description: '从空白开始创建' },
        { id: '2', name: '实验报告模板', description: '标准实验报告格式' },
        { id: '3', name: '课程论文模板', description: '学术论文写作模板' }
      ],
      showJoinDialog: false,
      joinForm: {
        documentId: ''
      }
    }
  },
  methods: {
    selectTemplate(template) {
      createDocument(template.id, this.$store.state.user.id).then(res => {
        this.$router.push(`/editor/${res.data}`)
      })
    },
    joinDocument() {
      initDocument(this.joinForm.documentId, this.$store.state.user.id).then(() => {
        this.$router.push(`/editor/${this.joinForm.documentId}`)
        this.showJoinDialog = false
      })
    }
  }
}
</script>

<style scoped>
.document-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.template-section {
  margin-top: 30px;
}
.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.template-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.template-preview {
  width: 120px;
  height: 160px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: #409EFF;
}
.template-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}
.template-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
