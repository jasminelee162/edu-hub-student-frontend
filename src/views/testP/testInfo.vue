<template>
  <div class="testInfo-page" :class="flag ? 'view-mode' : 'exam-mode'">
    <headerPage></headerPage>
    <div class="main-container">
      <div class="glass-card">
        <!-- 标题和时间显示部分保持不变 -->

        <div class="test-page-num" v-if="!flag">
          <div class="test-page-num1">剩余时间</div>
          <div class="test-page-num2">{{hr+'小时'+min+'分'+sec+'秒'}}</div>
        </div>
        <!-- 题目列表 -->
        <div class="question-list">
          <div v-for="(item, index) in assign" :key="index" class="question-card fade-in">
            <div class="question-header">
              <div class="question-title">{{index + 1}}.{{item.title}}</div>
              <div v-if="flag" class="question-score">({{item.point}}/{{item.score}}分)</div>
            </div>

            <div class="question-content">
              <!-- 单选题部分 -->
              <div v-if="item.type == 0">
                <el-radio-group v-model="item.solution" v-if="!flag">
                  <el-radio
                      v-for="(e, s) in item.content"
                      :key="s"
                      :label="e.value"
                      class="option-item"
                  >
                    {{e.value}}.{{e.option}}
                  </el-radio>
                </el-radio-group>
                <div v-else class="question-options">
                  <div
                      v-for="(e, s) in item.content"
                      :key="s"
                      class="option-item"
                      :class="{
          'correct-answer': e.value === item.answer,
          'student-correct': e.value === item.solution && e.value === item.answer,
          'student-incorrect': e.value === item.solution && e.value !== item.answer
        }"
                  >
                    {{e.value}}.{{e.option}}
                  </div>
                  <div class="answer-result">
                    <div class="correct-answer-line">正确答案：<span class="highlight">{{ item.answer }}</span></div>
                    <div class="student-answer-line">
                      你的答案：<span :class="{
          'student-answer': true,
          'text-danger': item.point < item.score,
          'text-success': item.point === item.score
        }">{{ item.solution || '未作答' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 多选题部分 -->
              <div v-if="item.type == 1">
                <el-checkbox-group v-model="item.solution" v-if="!flag">
                  <el-checkbox
                      v-for="(e, s) in item.content"
                      :key="s"
                      :label="e.value"
                      class="option-item"
                  >
                    {{e.value}}.{{e.option}}
                  </el-checkbox>
                </el-checkbox-group>
                <div v-else class="question-options">
                  <div
                      v-for="(e, s) in item.content"
                      :key="s"
                      class="option-item"
                      :class="{
          'correct-answer': item.answer.includes(e.value),
          'student-correct': item.solution.includes(e.value) && item.answer.includes(e.value),
          'student-incorrect': item.solution.includes(e.value) && !item.answer.includes(e.value)
        }"
                  >
                    {{e.value}}.{{e.option}}
                  </div>
                  <div class="answer-result">
                    <div class="correct-answer-line">正确答案：<span class="highlight">{{ item.answer }}</span></div>
                    <div class="student-answer-line">
                      你的答案：<span :class="{
          'student-answer': true,
          'text-danger': item.point < item.score,
          'text-success': item.point === item.score
        }">{{ formatStudentAnswer(item) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 填空题 -->
              <div v-if="item.type == 2">
                <el-input v-if="!flag" v-model="item.solution" placeholder="请输入答案"></el-input>
                <div v-else class="answer-result">
                  <div class="correct-answer-line">正确答案：<span>{{item.answer}}</span></div>
                  <div class="student-answer-line">
                    你的答案：<span :class="{
                      'student-answer': true,
                      'text-danger': item.point < item.score,
                      'text-success': item.point === item.score
                    }">{{item.solution || '未作答'}}</span>
                  </div>
                </div>
              </div>

              <!-- 判断题 -->
              <div v-if="item.type == 3">
                <el-radio-group v-model="item.solution" v-if="!flag">
                  <el-radio label="正确">正确</el-radio>
                  <el-radio label="错误">错误</el-radio>
                </el-radio-group>
                <div v-else class="answer-result">
                  <div class="correct-answer-line">正确答案：<span>{{item.answer}}</span></div>
                  <div class="student-answer-line">
                    你的答案：<span :class="{
                      'student-answer': true,
                      'text-danger': item.point < item.score,
                      'text-success': item.point === item.score
                    }">{{item.solution || '未作答'}}</span>
                  </div>
                </div>
              </div>

              <!-- 问答题和计算题 -->
              <div v-if="item.type == 4 || item.type == 5">
                <el-input
                    v-if="!flag"
                    type="textarea"
                    :rows="item.type == 4 ? 4 : 6"
                    v-model="item.solution"
                    :placeholder="item.type == 4 ? '请输入答案' : '请输入解题过程和答案'">
                </el-input>
                <div v-else class="answer-result">
                  <div class="correct-answer-line">参考答案：<span>{{item.answer}}</span></div>
                  <div class="student-answer-line">
                    你的答案：<span :class="{
                      'student-answer': true,
                      'text-danger': item.point < item.score,
                      'text-success': item.point === item.score
                    }">{{item.solution || '未作答'}}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="exam-actions" v-if="!flag">
        <el-button @click="submit" size="medium" type="primary">提交试卷</el-button>
      </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>


<script>
import {getTestItemByTestId,saveTestStudent,getTestUserState} from '../../api/api'
import headerPage from "../../components/header/header"
import bottomPage from "../../components/bottom/bottom"
export default {
  data() {
    return{
      id: "",
      assign: [],
      test: {},
      total: 0,
      hr: "",
      min: "",
      sec: "",
      end: "",
      timeOut: null,
      five: false,
      ten: false,
      flag: false,
      defen: 0,
      totalTime:0
    }
  },
  components: {
    headerPage,
    bottomPage
  },
  methods: {
    formatStudentAnswer(item) {
      if (item.type === 1) { // 多选题
        return Array.isArray(item.solution) ? item.solution.join(', ') : item.solution || '未作答'
      }
      return item.solution || '未作答'
    },
    submit() {
      this.$confirm('确定要提交考试内容吗？','交卷提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.saveTestStudent()
      }).catch(() => {});
    },
    submitEnd() {
      this.$message({
        message: '考试已结束，系统自动提交...',
        type: 'success'
      });
      this.saveTestStudent()
    },
    saveTestStudent() {
      for(let i = 0;i<this.assign.length;i++) {
        var item = this.assign[i]
        if(item.type == 1) {
          item.solution = item.solution.join(",")
        }
      }
      var param = {
        list: this.assign
      }
      saveTestStudent(param).then(res => {
        if (res.code == 1000) {
          this.$message({
            type: 'success',
            message: '交卷成功!'
          });
          this.$router.push("/test")
        } else {
          this.$message({
            type: 'warning',
            message: res.message
          });
        }
      })
    },
    countdown () {
      const now = Date.parse(new Date())
      const msec = this.end - now

      if(msec <= (10 * 60 * 1000)) {
        if(!this.ten) {
          this.$message('考试时间还剩十分钟');
          this.ten = true
        }
      }

      if(msec <= (5 * 60 * 1000)) {
        if(!this.five) {
          this.$message('考试时间还剩五分钟');
          this.five = true
        }
      }

      if(msec<=0) {
        this.submitEnd()
      };

      let day = parseInt(msec / 1000 / 60 / 60 / 24)
      let hr = parseInt(msec / 1000 / 60 / 60 % 24)
      let min = parseInt(msec / 1000 / 60 % 60)
      let sec = parseInt(msec / 1000 % 60)
      this.hr = hr > 9 ? hr : '0' + hr
      this.min = min > 9 ? min : '0' + min
      this.sec = sec > 9 ? sec : '0' + sec
      const that = this
      if(min>=0 && sec>=0){
        this.timeOut = setTimeout(function () {
          that.countdown()
        }, 1000)
      }
    },
    getTestItemByTestId() {
      getTestItemByTestId({ id: this.id }).then(res => {
        if (res.code == 1000) {
          this.assign = res.data.testItem
          this.test = res.data.test
          this.totalTime = res.data.totalTime || 120 // 使用后端返回的totalTime，如果没有则默认120分钟

          // 设置考试结束时间（当前时间 + totalTime分钟）
          this.end = Date.parse(new Date()) + this.totalTime * 60 * 1000

          // 如果考试未完成，开始倒计时
          if (!this.flag) {
            this.countdown()
          }

          for (let i = 0; i < this.assign.length; i++) {
            var item = this.assign[i]
            this.total += item.score
            this.defen += item.point
            if (item.type == "0" || item.type == "1") {
              if (item.content) {
                item.content = JSON.parse(item.content)
              }
              if (item.type == 1) {
                if (item.solution) {
                  item.solution = JSON.parse(item.solution.replace(/\\\"/g, '"'))
                } else {
                  item.solution = []
                }
              }
            }
          }
        }
      })
    },
    getTestUserState() {
      getTestUserState({id:this.id}).then(res => {
        if (res.code == 1000) {
          this.flag = true
        } else {
          this.countdown()
          this.flag = false
        }
      })
    }
  },
  mounted() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.end = Date.parse(new Date()) + 120 * 60 * 1000
    var id = this.$route.query.id
    if (id) {
      this.id = id
    }
    this.getTestUserState()
    this.getTestItemByTestId()
  },
  destroyed() {
    clearTimeout(this.timeOut)
  }
}
</script>

<style scoped>
.testInfo-page {
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

.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

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

.exam-status-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.status-item {
  font-size: 16px;
  color: #1F4E79;
}

.highlight {
  color: #52c41a;
  font-weight: bold;
}

.danger {
  color: black;
  font-weight: bold;
}

.time {
  color: #1890ff;
  font-weight: bold;
}

.question-list {
  margin-top: 20px;
}

.question-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-title {
  font-weight: bold;
  font-size: 16px;
  color: #1F4E79;
  flex: 1;
  word-break: break-word;
}

.question-score {
  font-size: 14px;
  color: #1F4E79;
  font-weight: bold;
}

.option-group {
  margin-top: 15px;
}

.option-item {
  margin-bottom: 10px;
  font-size: 14px;
  color: #1F4E79;
  word-break: break-word;
}

.correct-answer {
  color: #52c41a;
  font-weight: bold;
}

/*.wrong-answer {
  color: #ff4d4f;
  font-weight: bold;
  text-decoration: line-through;
}*/

.neutral-option {
  color: #666;
}

.text-answer, .judge-answer {
  margin-top: 15px;
  font-size: 14px;
  color: #1F4E79;
}

.answer-result {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.correct-answer-line {
  margin-bottom: 5px;
}

.correct-answer-line span {
  color: #52c41a;
  font-weight: bold;
}


.student-answer {
  font-weight: bold;
}

.text-danger {
  color: red; /* 如果不是满分，显示为红色 */
}

.text-black {
  color: black; /* 如果是满分，显示为黑色 */
}

.answer-analysis {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
}

.analysis-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #1F4E79;
}

.analysis-content {
  font-size: 14px;
  color: #1F4E79;
  line-height: 1.6;
}

.exam-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

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

/* 禁用所有交互元素 */
::v-deep .el-radio__input,
::v-deep .el-checkbox__input,
::v-deep .el-input__inner,
::v-deep .el-textarea__inner {
  pointer-events: none !important;
  cursor: not-allowed !important;
}

::v-deep .el-radio__input.is-checked .el-radio__inner {
  border-color: #52c41a;
  background-color: #52c41a;
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  border-color: #52c41a;
  background-color: #52c41a;
}

::v-deep .el-radio__label,
::v-deep .el-checkbox__label {
  color: inherit !important;
}


/* 填空题样式 */
.text-answer {
  margin-top: 10px;
  width: 100%;
}

/* 问答题和计算题样式 */
.essay-answer,
.calculation-answer {
  margin-top: 10px;
  width: 100%;
}

/* 判断题选项样式 */
.judge-options {
  margin-top: 10px;
}

/* 考试模式下启用交互元素 */
.exam-mode ::v-deep .el-radio__input,
.exam-mode ::v-deep .el-checkbox__input,
.exam-mode ::v-deep .el-input__inner,
.exam-mode ::v-deep .el-textarea__inner {
  pointer-events: auto !important;
  cursor: pointer !important;
}

.exam-mode ::v-deep .el-input__inner {
  cursor: text !important;
  background-color: #fff !important;
}

/* 查看模式下正确答案样式 */
.view-mode .correct-answer {
  color: #52c41a;
  font-weight: bold;
}

/* 查看模式下错误答案样式 */
.view-mode .wrong-answer {
  color: #ff4d4f;
  font-weight: bold;
  text-decoration: line-through;
}

/* 查看模式下中性选项样式 */
.view-mode .neutral-option {
  color: #666;
}

/* 查看模式下学生答案正确样式 */
.view-mode .text-success {
  color: #52c41a;
  font-weight: bold;
}

/* 查看模式下学生答案错误样式 */
.view-mode .text-danger {
  color: #ff4d4f;
  font-weight: bold;
}

/* 确保查看模式下禁用所有交互元素 */
.view-mode ::v-deep .el-radio__input,
.view-mode ::v-deep .el-checkbox__input,
.view-mode ::v-deep .el-input__inner,
.view-mode ::v-deep .el-textarea__inner {
  pointer-events: none !important;
  cursor: not-allowed !important;
  background-color: transparent !important;
  border-color: transparent !important;
  color: inherit !important;
  padding-left: 0 !important;
}

.view-mode ::v-deep .el-radio,
.view-mode ::v-deep .el-checkbox {
  margin-right: 10px;
}

.view-mode ::v-deep .el-radio__label,
.view-mode ::v-deep .el-checkbox__label {
  padding-left: 5px !important;
}

/* 添加答案对比样式 */
.answer-comparison {
  display: inline-block;
  margin-left: 10px;
  font-size: 12px;
}
.correct-mark {
  color: #52c41a;
}
.your-mark {
  color: #1890ff;
}
.wrong-answer {
  color: #ff4d4f;
  text-decoration: line-through;
}
</style>