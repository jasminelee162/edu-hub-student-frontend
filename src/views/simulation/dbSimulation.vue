<template>
  <div class="sandbox-page">
    <headerPage />
    <div class="main-container">
      <div class="glass-card" v-if="currentQuestion">
        <div class="section-title">
          <i class="el-icon-document"></i> {{ title }}
        </div>
        <div class="question-description" v-html="description"></div>

        <el-input
            type="textarea"
            v-model="sqlText"
            :rows="6"
            placeholder="请输入 SQL 语句，如：SELECT * FROM users;"
        />

        <el-button type="primary" style="margin-top: 10px;
    height: 50px;
    width: 130px;
    background-color: #D6EFFB !important;
    border-color: #86C5E0 !important;
    color: #1F4E79 !important;
    border-radius: 6px !important;
    padding: 5px 12px;
    font-weight: bold;
    transition: 0.2s ease;" @click="runSQL">
          执行查询
        </el-button>

        <div class="sql-result" v-if="sqlMessage">
          <div class="result-title">
            <el-tag :type="sqlSuccess ? 'success' : 'danger'">{{ sqlMessage }}</el-tag>
          </div>

          <el-table
              v-if="sqlSuccess && sqlResult.length"
              :data="sqlResult"
              border
              style="margin-top: 10px"
          >
            <el-table-column
                v-for="(col, index) in resultColumns"
                :key="index"
                :prop="col"
                :label="col"
            />
          </el-table>
        </div>
      </div>

      <div v-else class="no-data">请选择一个题目</div>
    </div>
    <bottomPage />
  </div>
</template>

<script>
import headerPage from '@/components/header/header.vue'
import bottomPage from '@/components/bottom/bottom.vue'
import {
  getTitle,
  getDescription,
  executeQuery
} from '@/api/api'

export default {
  components: { headerPage, bottomPage },
  data() {
    return {
      currentQuestion: null,
      title: '',
      description: '',
      sqlText: '',
      sqlResult: [],
      resultColumns: [],
      sqlMessage: '',
      sqlSuccess: false,
      userStamp: ''
    }
  },
  watch: {
    '$route.query.questionId': {
      handler(newVal) {
        if (newVal) {
          this.loadQuestion(newVal)
          console.log("题目id：" + newVal);
        }
      },
      immediate: true
    }
  },
  created() {
    this.userStamp = 'user-' + Math.random().toString(36).substr(2, 10)
  },
  methods: {
    async loadQuestion(id) {
      this.currentQuestion = id
      try {
        const [titleRes, descRes] = await Promise.all([
          getTitle(id),
          getDescription(id)
        ])
        this.title = titleRes.message || ''
        this.description = descRes.message || ''
        this.sqlText = ''
        this.sqlResult = []
        this.resultColumns = []
        this.sqlMessage = ''
        this.sqlSuccess = false
      } catch (error) {
        this.$message.error('加载题目信息失败')
      }
    },
    async runSQL() {
      if (!this.sqlText.trim()) {
        this.$message.warning('请输入 SQL 语句')
        return
      }

      try {
        const payload = {
          questionId: this.currentQuestion,
          request: this.sqlText,
          userStamp: this.userStamp
        }

        const res = await executeQuery(payload)

        this.sqlSuccess = res.code === 1000
        this.sqlMessage = res.message || (this.sqlSuccess ? '执行成功' : '执行失败')

        if (this.sqlSuccess && Array.isArray(res.data)) {
          this.sqlResult = res.data
          this.resultColumns = res.data.length ? Object.keys(res.data[0]) : []
        } else {
          this.sqlResult = []
          this.resultColumns = []
        }
      } catch (e) {
        this.sqlSuccess = false
        this.sqlMessage = '执行失败，请稍后重试'
        this.sqlResult = []
        this.resultColumns = []
      }
    }
  }
}
</script>

<style scoped>
.no-data {
  text-align: center;
  color: #666;
  margin: 40px 0;
  font-size: 16px;
}
.sandbox-page {
  width: 100%;
  min-height: 100vh;
  background: url('../../assets/image/index/index_back.png') center center no-repeat;
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
  transition: all 0.3s ease;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1F4E79;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
.question-description {
  color: #1f4e79;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 20px;
}
.sql-result {
  margin-top: 15px;
}
.result-title {
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}
</style>