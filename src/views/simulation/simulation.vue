<template>
  <div class="sandbox-entry">
    <headerPage />
    <div class="main-container">
      <div class="glass-card">
        <div class="section-title">
          <i class="el-icon-s-help icon"></i> 数据库实验题目列表
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
    </div>
    <bottomPage />
  </div>
</template>

<script>
import headerPage from '@/components/header/header.vue'
import bottomPage from '@/components/bottom/bottom.vue'
import { getAllQuestions } from '@/api/api'

export default {
  components: { headerPage, bottomPage },
  data() {
    return {
      questions: []
    }
  },
  methods: {
    async loadQuestions() {
      try {
        const res = await getAllQuestions();
        // 这里res是数组，直接赋值
        this.questions = res;

      } catch (e) {
        this.$message.error('题目加载失败，请稍后重试');
      }
    },
    goToSimulation(id) {
      this.$router.push({ path: '/dbSimulation', query: { questionId: id } })
    }
  },
  mounted() {
    this.loadQuestions()
  }
}
</script>
<style scoped>
.sandbox-entry {
  width: 100%;
  min-height: 100vh;
  background: url('@/assets/image/index/index_back.png') no-repeat center center;
  background-size: cover;
  padding-bottom: 30px;
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
</style>