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
                <div v-if="q.type === 0">
                  <div
                      v-for="(opt, i) in q.content"
                      :key="i"
                      class="option-item"
                  >
                    <span :class="{
                      'correct-answer': opt.value === q.answer,
                      'neutral-option': opt.value !== q.answer
                    }">
                      {{ opt.value }}.{{ opt.option }}
                    </span>
                  </div>
                </div>

                <!-- 多选题 -->
                <div v-if="q.type === 1">
                  <div
                      v-for="(opt, i) in q.content"
                      :key="i"
                      class="option-item"
                  >
                    <span :class="{
                      'correct-answer': q.answer.includes(opt.value),
                      'neutral-option': !q.answer.includes(opt.value)
                    }">
                      {{ opt.value }}.{{ opt.option }}
                    </span>
                  </div>
                </div>
              </div>



              <div class="answer-tip" v-if="q.point !== q.score">
                <div>
                  正确答案：<span class="highlight">{{ q.answer }}</span>
                </div>
                <div>
                  你的答案：<span class="student-answer">{{ formatStudentAnswer(q) }}</span>
                </div>
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
    formatStudentAnswer(q) {
      if (!q.solution) return '未作答';

      try {
        // 第一步：解析最外层的JSON数组
        const outerArray = JSON.parse(q.solution);

        // 第二步：处理数组中的每个元素（可能是字符串形式的JSON）
        const result = outerArray.map(item => {
          try {
            // 尝试解析内部可能存在的JSON字符串
            const parsed = JSON.parse(item.replace(/\\"/g, '"'));
            return Array.isArray(parsed) ? parsed.join('') : parsed;
          } catch {
            // 如果不是JSON，直接返回原始值
            return item.replace(/[\\"\[\]]/g, '');
          }
        }).filter(Boolean).join(',');

        return result || '未作答';
      } catch (e) {
        // 如果解析失败，尝试直接清理字符串
        return q.solution.replace(/[\\"\[\]]/g, '') || '未作答';
      }
    },
    query() {
      getWrongAnswers()
          .then((res) => {
            if (res.code === 1000 && Array.isArray(res.data)) {
              this.data = res.data.map(q => {
                let parsedContent = []
                try {
                  parsedContent = typeof q.content === 'string'
                      ? JSON.parse(q.content)
                      : q.content || []
                } catch (e) {
                  parsedContent = []
                }

                let parsedSolution = q.solution
                if (q.type === 1) {
                  if (typeof parsedSolution === 'string') {
                    try {
                      parsedSolution = JSON.parse(parsedSolution)
                    } catch (e) {
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
              }).filter(q => q.point !== q.score) // Only show wrong answers
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
.neutral-option {
  color: #666; /* 深灰色 */
}
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
  word-break: break-word;
}

/* 选项区域 */
.question-options {
  margin-bottom: 10px;
}

.option-item {
  display: block;
  margin: 8px 0;
  word-break: break-word;
}

.text-answer-container {
  margin-top: 10px;
}

.student-answer {
  color: #ff4d4f;
  margin-bottom: 8px;
}

.correct-answer {
  color: #52c41a;
  font-weight: bold;
}

/* 答案提示 */
.answer-tip {
  font-size: 14px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
}
.highlight {
  font-weight: bold;
  color: #52c41a;
}

.student-answer {
  color: #ff4d4f;
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

::v-deep .el-radio.is-disabled .el-radio__inner,
::v-deep .el-checkbox.is-disabled .el-checkbox__inner,
::v-deep .el-textarea.is-disabled .el-textarea__inner {
  cursor: not-allowed;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
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
/* 选项容器样式 */
.question-options {
  margin-bottom: 10px;
  width: 100%; /* 确保宽度固定 */
}

/* 每个选项样式 */
.option-item {
  display: block;
  margin: 8px 0;
  word-break: break-all; /* 允许在任意字符间断行 */
  white-space: normal; /* 允许文字换行 */
  padding-right: 15px; /* 留出右边距 */
}

/* 单选/多选框标签样式 */
::v-deep .el-radio__label,
::v-deep .el-checkbox__label {
  white-space: normal !important; /* 强制允许换行 */
  display: inline-block; /* 保持与选框对齐 */
  width: calc(100% - 20px); /* 扣除选框宽度 */
  vertical-align: top; /* 顶部对齐 */
}
</style>