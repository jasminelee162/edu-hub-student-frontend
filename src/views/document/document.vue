<template>
  <div class="document-page">
    <headerPage />

    <div class="document-page-actions">
      <div class="document-page-title">协作功能入口</div>

      <div class="document-page-buttons">
        <el-button icon="el-icon-link" size="medium" type="primary" plain @click="showJoinDialog = true">加入协作</el-button>

        <el-upload
            action=""
            :http-request="uploadTemplateFile"
            :auto-upload="true"
            :show-file-list="false"
        >
          <el-button icon="el-icon-upload" size="medium" type="success" plain>上传模板</el-button>
        </el-upload>

        <el-button icon="el-icon-document" size="medium" type="info" plain @click="goToTemplate">
          从模板新建协作
        </el-button>
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
import axios from 'axios'


export default {
  components: {
    headerPage,

  },
  data() {
    return {
      showJoinDialog: false,
      joinForm: {
        documentId: ''
      }
    }
  },
  methods: {
    uploadTemplateFile(upload) {
      const formData = new FormData();
      formData.append('file', upload.file);
      const token = window.localStorage.getItem('user_token')

      axios.post('http://localhost:8080/template/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x_access_token': token
        }
      }).then(res => {
        if (res.data?.code === 1000) {
          this.$message.success('上传成功');
        } else {
          this.$message.error('上传失败：' + (res.data?.message || '未知错误'));
        }
      }).catch(() => {
        this.$message.error('上传请求出错');
      });
    },
    goToTemplate() {
      this.$router.push('/templateList')
    },
    joinDocument() {
      const userId = this.$store.state.user?.id
      if (!userId) return this.$message.error('请先登录')
      initDocument(this.joinForm.documentId, userId).then(() => {
        this.$router.push(`/documentEdit/${this.joinForm.documentId}`)
        this.showJoinDialog = false
      })
    }
  }
}
</script>

<style scoped>
.document-page {
  width: 100%;
  background: url('../../assets/image/index/index_back.png');
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.document-page-actions {
  margin-top: 80px;
  width: 70%;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.document-page-title {
  font-size: 28px;
  font-weight: bold;
  color: #1F4E79;
  margin-bottom: 30px;
  font-family: '黑体';
}

.document-page-buttons {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.document-page-buttons .el-button {
  min-width: 400px;
  font-size: 16px;
  height: 400px;
  border-radius: 10px;
  font-family: '黑体';
}
</style>