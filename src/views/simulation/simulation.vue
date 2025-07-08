<template>
  <div class="sandbox-entry">
    <headerPage></headerPage>
    <div class="article-page-content">
    <div class="main-container">

      <!-- 数据库实验题目列表 -->
      <div class="glass-card">
        <div class="section-title">
          <i class="el-icon-s-help icon"></i> 数据库 实验
        </div>
        <el-row :gutter="20">
          <el-col
              :span="8"
              v-for="(item, index) in questions"
              :key="item.id"
              class="fade-in"
          >
            <div class="question-card">
              <div class="title">{{ item.title }}</div>
              <div class="difficulty">难度：
                <span :class="['tag',
                  item.difficulty === 'HARD' ? 'hard' :
                  item.difficulty === 'MODERATE' ? 'medium' :
                  'easy']">
                  {{ item.difficulty }}
                </span>
              </div>
              <el-button type="primary" size="mini" @click="goToSimulation(item.id)">
                进入数据库沙箱实验
              </el-button>
            </div>
          </el-col>
        </el-row>


      </div>
      <!-- 下载实验报告按钮 -->

      <div class="floating-download">
        <a
            href="http://localhost:8080/file/test.docx"
            target="_blank"
            class="download-link"
        >
          下载实验报告
        </a>
      </div>
      <!-- 外部实验（按学科分组） -->
      <div class="glass-card" v-for="(group, subject) in groupedExperiments" :key="subject">
        <div class="section-title">
          <i class="el-icon-monitor icon"></i> {{ subject }} 实验
        </div>
        <el-row :gutter="20">
          <el-col :span="8" v-for="exp in group" :key="exp.id" class="fade-in">
            <div class="question-card">
              <div class="title">{{ exp.label }}</div>
              <el-button type="primary" size="mini" @click="openExperiment(exp.url)">
                进入实验
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 全屏 iframe 模拟器 -->
    <div v-if="fullscreenUrl" class="fullscreen-iframe">
      <div class="iframe-header">
        <el-button type="danger" size="mini" icon="el-icon-close" @click="fullscreenUrl = ''">
          关闭实验
        </el-button>
      </div>
      <iframe :src="fullscreenUrl" frameborder="0"></iframe>
    </div>

    <bottomPage />
  </div>
  </div>
</template>

<script>
import headerPage from '@/components/header/header.vue'
import bottomPage from '@/components/bottom/bottom.vue'
import { getAllQuestions, getAllExperiments } from '@/api/api'

export default {
  components: { headerPage, bottomPage },
  data() {
    return {
      questions: [],
      externalExperiments: [],
      fullscreenUrl: ''
    }
  },
  computed: {
    groupedExperiments() {
      const groups = {}
      this.externalExperiments.forEach(exp => {
        const subject = exp.subject || '其他'
        if (!groups[subject]) groups[subject] = []
        groups[subject].push(exp)
      })
      return groups
    }
  },
  methods: {
    async loadExperiments() {
      const res = await getAllExperiments()
      this.externalExperiments = res.data || []
    },
    async loadQuestions() {
      try {
        const res = await getAllQuestions()
        this.questions = res
      } catch (e) {
        this.$message.error('题目加载失败，请稍后重试')
      }
    },
    goToSimulation(id) {
      this.$router.push({ path: '/dbSimulation', query: { questionId: id } })
    },
    openExperiment(url) {
      this.fullscreenUrl = url
    },

  },
  mounted() {
    this.loadQuestions()
    this.loadExperiments()
  }
}
</script>

<style scoped>
.sandbox-entry {
  width: 100%;
  height: 100%;

  background-size: cover;
  padding-bottom: 30px;
}
.article-page-content {
  width: 100%;
  display: flex;
  font-family: '黑体';
  flex-direction: column;
  align-items: center;
  background: url('@/assets/image/index/index_back.png');
}
.main-container {
  width: 75%;
  margin: 40px auto;

}

.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1F4E79;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.icon {
  font-size: 22px;
  color: #6427FF;
  margin-right: 10px;
}

.question-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin: 10px;
  padding: 15px;
  color: #1F4E79;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: 0.3s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.difficulty {
  margin-bottom: 10px;
}

.tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.easy {
  background: #7BC67B;
}
.medium {
  background: #FFC107;
}
.hard {
  background: #FF6B6B;
}

/* 全屏 iframe 样式 */
.fullscreen-iframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.fullscreen-iframe iframe {
  flex: 1;
  border: none;
}

.iframe-header {
  background: #222;
  padding: 8px 16px;
  text-align: right;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
  z-index: 10000;
}
.floating-download {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 999;
}

.download-link {
  display: inline-block;
  background-color: #6427FF;
  color: white;
  padding: 12px 18px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.download-link:hover {
  background-color: #4b1ec2;
  transform: translateY(-2px);
}
</style>