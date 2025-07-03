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
        this.templates = res.data
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
            templateId: templateId
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
  background: url('@/assets/image/index/index_back.png') no-repeat;
  background-size: cover;
  min-height: 100vh;
}
.main-container {
  max-width: 1200px;
  margin: 0 auto;
}
.title {
  text-align: center;
  font-size: 28px;
  color: #1F4E79;
  margin-bottom: 30px;
}
.template-card {
  transition: 0.3s;
  cursor: pointer;
  font-family: '黑体';
  color: #1F4E79;
}
.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.template-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>