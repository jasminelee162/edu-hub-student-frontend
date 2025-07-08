<template>
  <div class="template-page">
    <headerPage />
    <div class="main-container">
      <h2 class="title">选择模板新建协作文档</h2>
      <el-row :gutter="20" justify="center">
        <el-col :span="8" v-for="template in templates" :key="template.id">
          <el-card class="template-card">
            <div class="card-click-mask" @click="createFromTemplate(template.id)">
              <div class="template-name">{{ template.name }}</div>
              <p>ID: {{ template.id }}</p>
              <p>创建时间: {{ template.createAt }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import headerPage from '@/components/header/header.vue'
import { getTemplateList, createDocument } from '@/api/api'

export default {
  components: { headerPage },
  data() {
    return {
      templates: []
    }
  },
  mounted() {
    this.loadTemplates()
  },
  methods: {
    async loadTemplates() {
      const res = await getTemplateList()
      if (res.code === 1000) {
        this.templates = res.data.records
      } else {
        this.$message.error('模板加载失败')
      }
    },
    async createFromTemplate(templateId) {
      console.log("点击模板，模板ID：", templateId);
      const userId = this.$store.state.user?.id;
      if (!userId) {
        this.$message.error('请先登录');
        return;
      }

      try {
        const res = await createDocument(templateId, userId);
        console.log("创建响应：", res);

        const shareToken = res.message ;
        if (!shareToken) {
          this.$message.error('创建失败，未返回文档ID');
          return;
        }

        this.$router.push({
          path: `/documentEdit/${shareToken}`,
          query: {
            templateId: templateId,


          }
        })
      } catch (err) {
        console.error("创建失败", err);
        this.$message.error('创建请求失败');
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    }
  }
}
</script>

<style scoped>
.template-page {
  padding: 40px;
  font-family: '黑体';
  background: url('@/assets/image/index/index_back.png') no-repeat center center fixed;
  background-size: cover;
  height: 100%;
  width: 100%;
  color: #1F4E79;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 40px;
}

/* 统一卡片大小和透明风格 */
.template-card {
  cursor: pointer;
  font-family: '黑体';
  color: #1F4E79;
  background-color: rgba(255, 255, 255, 0.5) !important; /* 透明度加深 */
  border-radius: 16px !important;
  height: 180px;
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: none !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  margin-bottom: 30px; /* 增加垂直间距 */
  margin-right: 20px; /* 增加水平间距 */
}
.el-row {
  margin-left: -10px;
  margin-right: -10px;
}

.el-col {
  padding-left: 10px;
  padding-right: 10px;
}

.template-card:hover {
  background-color: rgba(255, 255, 255, 0.65) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-6px);
}

.card-click-mask {
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  user-select: none;
}

.template-name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  user-select: text;
}

p {
  margin: 2px 0;
  font-size: 14px;
  opacity: 0.85;
  user-select: text;
}
</style>