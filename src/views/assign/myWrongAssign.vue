<template>
  <div class="assignInfo-page">
    <headerPage />

    <div class="main-container">
      <transition name="fade">
        <div class="glass-card">
          <div class="section-title">
            <i class="el-icon-edit-outline icon"></i> 我的错题集
          </div>

              <div v-if="data.length">
                <div
                    class="question-card fade-in"
                    v-for="(q, index) in data"
                    :key="index"
                >
                  <div class="question-title">
                    {{ index + 1 }}. {{ q.title }}
                  </div>

                  <div class="question-options">
                    <!-- 单选题 -->
                    <el-radio-group v-model="q.solution" v-if="q.type === 0">
                      <el-radio
                          v-for="(opt, i) in q.content"
                          :key="i"
                          :label="opt.value"
                      >{{ opt.value }}.{{ opt.option }}</el-radio>
                    </el-radio-group>

                    <!-- 多选题 -->
                    <el-checkbox-group v-model="q.solution" v-if="q.type === 1">
                      <el-checkbox
                          v-for="(opt, i) in q.content"
                          :key="i"
                          :label="opt.value"
                      >{{ opt.value }}.{{ opt.option }}</el-checkbox>
                    </el-checkbox-group>

                    <!-- 简答题 -->
                    <el-input
                        v-model="q.solution"
                        v-if="q.type === 2"
                        size="mini"
                        type="textarea"
                        placeholder="请输入你的答案"
                        rows="3"
                    ></el-input>

                    <!-- 判断题 -->
                    <el-radio-group v-model="q.solution" v-if="q.type === 3">
                      <el-radio label="正确">正确</el-radio>
                      <el-radio label="错误">错误</el-radio>
                    </el-radio-group>
                  </div>

                  <div class="answer-tip" v-if="q.point !== q.score">
                    正确答案：<span class="highlight">{{ q.answer }}</span>
                  </div>
                </div>
              </div>

              <div v-else class="no-data">暂无错题记录 🎉</div>

        </div>
      </transition>
    </div>

    <bottomPage />
  </div>
</template>

<script>
import { getWrongAnswers } from "@/api/api"
import headerPage from "@/components/header/header.vue"
import bottomPage from "@/components/bottom/bottom.vue"

export default {
  components: { headerPage, bottomPage },
  data() {
    return {
      data: [],
      activeNames: "0"
    }
  },
  methods: {
    query() {
      getWrongAnswers()
          .then((res) => {
            if (res.code === 1000 && Array.isArray(res.data)) {
              // 对每道题的 content 字段做 JSON.parse（如果它是字符串）
              this.data = res.data.map(q => {
                // content 确保为数组
                let parsedContent = []
                try {
                  parsedContent = typeof q.content === 'string'
                      ? JSON.parse(q.content)
                      : q.content || []
                } catch (e) {
                  parsedContent = []
                }

                // solution 确保为数组（多选题才需要这样处理）
                let parsedSolution = q.solution
                if (q.type === 1) {
                  if (typeof parsedSolution === 'string') {
                    try {
                      // 如果是字符串形式的数组，如 '["A","B"]'
                      parsedSolution = JSON.parse(parsedSolution)
                    } catch (e) {
                      // 如果是逗号分隔的，如 "A,B"
                      parsedSolution = parsedSolution.split(',')
                    }
                  } else if (!Array.isArray(parsedSolution)) {
                    parsedSolution = []
                  }
                }

                return {
                  ...q,
                  content: parsedContent,
                  solution: parsedSolution
                }
              })
            } else {
              this.$message.error("获取错题失败")
            }
          })
          .catch(() => {
            this.$message.error("服务器异常，请稍后重试")
          })
    }
  },
  mounted() {
    this.query()
  }
}
</script>

<style scoped>
.assignInfo-page {
  width: 100%;
  min-height: 100vh;
  background: url('../../assets/image/index/index_back.png') no-repeat center center;
  background-size: cover;
  padding-bottom: 30px;
}

.main-container {
  width: 75%;

  margin: 40px auto;
}

/* 卡片样式 */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* 标题 */
.section-title {
  font-size: 22px;
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

/* 问题卡片 */
.question-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 15px;
  color: #1F4E79;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 标题 */
.question-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
}

/* 选项区域 */
.question-options {
  margin-bottom: 10px;
}

/* 答案提示 */
.answer-tip {
  font-size: 14px;
  color: #ff4d4f;
}
.highlight {
  font-weight: bold;
  color: #ff7875;
}

/* scoped 版本 */
::v-deep .el-radio__input.is-checked .el-radio__inner {
  border-color: #C2E4F5;
  background-color: #C2E4F5;
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  border-color: #C2E4F5;
  background-color: #C2E4F5;
}

/* 无数据 */
.no-data {
  color: #1F4E79;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

/* 动效 */
.fade-in {
  animation: fadeIn 0.8s ease forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>