<template>
  <div class="document-page">
    <headerPage />

    <div class="document-page-actions">
      <div class="document-page-title">协作入口</div>

      <div class="document-page-buttons">
        <!-- 加入协作 -->
        <el-button icon="el-icon-link" size="medium" type="primary" plain @click="showJoinDialog = true">
          <div class="button-content">
            <img src="@/assets/icons/join.png" alt="加入协作" />
            <div>加入协作</div>
          </div>
        </el-button>

        <!-- 上传模板 -->
        <el-upload
            action=""
            :http-request="uploadTemplateFile"
            :auto-upload="true"
            :show-file-list="false"
        >
          <el-button icon="el-icon-upload" size="medium" type="success" plain>
            <div class="button-content">
              <img src="@/assets/icons/upload.png" alt="上传模板" />
              <div>上传模板</div>
            </div>
          </el-button>
        </el-upload>

        <!-- 从模板新建 -->
        <el-button icon="el-icon-document" size="medium" type="info" plain @click="goToTemplate">
          <div class="button-content">
            <img src="@/assets/icons/template.png" alt="新建协作" />
            <div>从模板新建协作</div>
          </div>
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
      const documentId = this.joinForm.documentId.trim()
      const userId = this.$store.state.user?.id
      if (!userId) {
        this.$message.error('请先登录')
        return
      }

      const socket = new SockJS('http://localhost:8080/ws-doc')
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: str => console.log('[STOMP]', str),
        onConnect: () => {
          // 👇重点：这里使用 WebSocket 发送 init 消息
          this.stompClient.publish({
            destination: `/app/${documentId}/init`,
            body: JSON.stringify({ userId })
          })

          this.$message.success('加入协作成功')
          this.showJoinDialog = false
          this.$router.push(`/documentEdit/${documentId}`)
        }
      })

      this.stompClient.activate()
    }
  }
}
</script>

<style>
/* 鼠标悬停时按钮背景色加深 */

.el-button--success:hover {
  background-color: #C0AEFF !important;
  color: white !important;
}


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
  min-width: 300px;
  font-size: 16px;
  height: 400px;
  border-radius: 10px;
  font-family: '黑体';
}
.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
  font-family: "黑体";
  color: #1F4E79;
}

.button-content img {
  width: 160px;
  height: 160px;
  margin-bottom: 12px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.el-button:hover .button-content img {
  transform: scale(1.05);
}
.el-dialog {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  background-color: #fefeff;
  font-family: '黑体';
}

.el-dialog__header {
  background-color: #f0f4ff;
  border-bottom: 1px solid #ddd;
  font-size: 20px;
  font-weight: bold;
  color: #1F4E79;
  padding: 16px 20px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.el-dialog__body {
  padding: 20px;
  font-size: 16px;
  color: #333;
}

.el-dialog__footer {
  padding: 15px 20px;
  text-align: right;
}

.el-dialog__footer .el-button {
  min-width: 100px;
  font-weight: bold;
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
.el-input__inner {
  border-radius: 8px;
}
.el-dialog {
  border-radius: 16px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
  background-color: #fefeff !important;
  font-family: '黑体' !important;
}

.el-dialog__header {
  background-color: #f0f4ff !important;
  border-bottom: 1px solid #ddd !important;
  font-size: 20px !important;
  font-weight: bold !important;
  color: #1F4E79 !important;
  padding: 16px 20px !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
}

.el-dialog__body {
  padding: 20px !important;
  font-size: 16px !important;
  color: #333 !important;
}

.el-dialog__footer {
  padding: 15px 20px !important;
  text-align: right !important;
}

.el-dialog__footer .el-button {
  min-width: 100px !important;
  font-weight: bold !important;
}

.el-dialog__footer .el-button--primary {
  background-color: #C8BFFF !important;
  border-color: #C8BFFF !important;
  color: white !important;
}

.el-dialog__footer .el-button--primary:hover {
  background-color: #B29EFF !important;
  border-color: #B29EFF !important;
}

.el-input__inner {
  border-radius: 8px !important;
}
</style>