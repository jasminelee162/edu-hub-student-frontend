<template>
  <div class="assignInfo-page">
    <headerPage></headerPage>
    <div class="main-container">
      <div class="glass-card">
        <div class="section-title">
          <i class="el-icon-edit-outline icon"></i>
          {{chapter.taskName}} - {{chapter.name}} - 章节作业
        </div>

        <div class="assignInfo-state">
          {{flag ? '已提交' : '未提交'}} | 总分：{{total}}分 | 得分：{{defen}}分
        </div>

        <div v-if="homework.length">
          <div
              class="question-card fade-in"
              v-for="(item, index) in homework"
              :key="index"
          >
            <div class="question-title">
              {{index + 1}}.{{item.title}}
            </div>

            <!-- 单选题 - 查看模式 -->
            <div v-if="item.type == 0 && flag" class="question-options">
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
            </div>

            <!-- 单选题 - 作答模式 -->
            <el-radio-group v-if="item.type == 0 && !flag" v-model="item.solution" class="question-options">
              <el-radio
                  v-for="(e, s) in item.content"
                  :key="s"
                  :label="e.value"
                  class="option-item"
              >
                {{e.value}}.{{e.option}}
              </el-radio>
            </el-radio-group>

            <!-- 多选题 - 查看模式 -->
            <div v-if="item.type == 1 && flag" class="question-options">
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
            </div>

            <!-- 多选题 - 作答模式 -->
            <el-checkbox-group v-if="item.type == 1 && !flag" v-model="item.solution" class="question-options">
              <el-checkbox
                  v-for="(e, s) in item.content"
                  :key="s"
                  :label="e.value"
                  class="option-item"
              >
                {{e.value}}.{{e.option}}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 填空题/计算题 -->
            <div v-if="item.type == 2" class="text-answer-container">
              <div v-if="flag" class="submitted-answer">
                <div class="answer-line">
                  正确答案：<span class="correct-answer">{{ item.answer }}</span>
                </div>
                <div class="answer-line">
                  你的答案：<span :class="{
                    'correct-text': item.point === item.score,
                    'incorrect-text': item.point !== item.score
                  }">{{ item.solution || '未作答' }}</span>
                </div>
              </div>
              <el-input
                  v-else
                  v-model="item.solution"
                  size="mini"
                  placeholder="请输入答案"
              ></el-input>
            </div>

            <!-- 判断题 -->
            <div v-if="item.type == 3">
              <!-- 查看模式 - 只显示答案 -->
              <div v-if="flag" class="judgment-answer">

              </div>

              <!-- 作答模式 - 显示选项 -->
              <el-radio-group v-else v-model="item.solution" class="question-options">
                <el-radio label="正确" class="option-item">正确</el-radio>
                <el-radio label="错误" class="option-item">错误</el-radio>
              </el-radio-group>
            </div>

            <!-- 所有题型的解析部分 -->
            <div class="answer-tip" v-if="flag && item.type !== 2">
              正确答案：<span class="highlight">{{ item.answer }}</span>
              <div>
                你的答案：<span :class="{
                  'correct-text': item.point === item.score,
                  'incorrect-text': item.point !== item.score
                }">{{ formatStudentAnswer(item) }}</span>
              </div>
            </div>
          </div>

          <div style="margin:20px 0" v-if="!flag">
            <el-button @click="submit" type="primary">提交作业</el-button>
          </div>
        </div>
      </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>

<script>
import {getChapterById,getHomeworkStudentList,saveHomeworkStudent,getHomeworkStudentFlag} from "../../api/api"
import headerPage from "../../components/header/header"
import bottomPage from "../../components/bottom/bottom"

export default {
  data() {
    return{
      chapterId: "",
      chapter: {},
      homework: [],
      total: 0,
      defen: 0,
      flag: false
    }
  },
  components: {
    headerPage,
    bottomPage
  },
  methods: {
    toggleMultiSelect(item, value) {
      const index = item.solution.indexOf(value);
      if (index === -1) {
        item.solution.push(value);
      } else {
        item.solution.splice(index, 1);
      }
    },
    formatStudentAnswer(item) {
      if (item.type === 1) { // 多选题
        return Array.isArray(item.solution) ? item.solution.join(',') : item.solution || '未作答'
      }
      return item.solution || '未作答'
    },
    getChapterById() {
      getChapterById({id:this.chapterId}).then(res => {
        if(res.code == 1000) {
          this.chapter = res.data
        }
      })
    },
    getHomeworkStudentList() {
      var param = {
        chapterId: this.chapterId
      }
      getHomeworkStudentList(param).then(res => {
        if (res.code == 1000) {
          this.homework = res.data
          for(let i = 0;i<this.homework.length;i++) {
            var item = this.homework[i]
            this.total = this.total + item.score
            this.defen = this.defen + item.point
            if (item.type == "0" || item.type == "1") {
              if (item.content) {
                item.content = JSON.parse(item.content)
              }
              if(item.type == 1) {
                if(item.solution) {
                  item.solution = item.solution.split(",")
                } else {
                  item.solution = []
                }
              }
            }
          }
        }
      })
    },
    submit() {
      this.$confirm('确定要提交作业内容吗？','提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for(let i = 0;i<this.homework.length;i++) {
          var item = this.homework[i]
          if(item.type == 1) {
            item.solution = item.solution.join(",")
          }
        }
        var param = {
          homework: this.homework
        }
        saveHomeworkStudent(param).then(res => {
          if (res.code == 1000) {
            this.$message({
              type: 'success',
              message: '提交成功!'
            });
            this.$router.push("/taskInfo?id="+this.chapter.taskId)
          }
        })
      }).catch(() => {});
    },
    getHomeworkStudentFlag() {
      getHomeworkStudentFlag({id:this.chapterId}).then(res => {
        if(res.code == 1000) {
          this.flag = true
        } else {
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
    var chapterId = this.$route.query.id
    if (chapterId) {
      this.chapterId = chapterId
    }
    this.getChapterById()
    this.getHomeworkStudentList()
    this.getHomeworkStudentFlag()
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
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
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
.question-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 15px;
  color: #1F4E79;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.question-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  word-break: break-word;
}
.question-options {
  margin-bottom: 10px;
}
.option-item {
  display: block;
  margin: 8px 0;
  word-break: break-word;
}
.correct-text {
  color: #1F4E79;
  font-weight: bold;
}
.student-answer {
  color: #1F4E79;
}
.incorrect-text {
  font-weight:bold;
  color: #ff4d4f;
}
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
.assignInfo-state {
  margin-bottom: 20px;
  color: #1F4E79;
  font-weight: bold;
}

/* 选项样式优化 */
::v-deep .el-radio__label,
::v-deep .el-checkbox__label {
  white-space: normal !important;
  display: inline-block;
  width: calc(100% - 20px);
  vertical-align: top;
}

.option-item {
  padding: 8px 12px;
  margin: 6px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}


/* 选中状态（未提交时） */
::v-deep .el-radio.is-checked .el-radio__label,
::v-deep .el-checkbox.is-checked .el-checkbox__label {
  color: #1F4E79;
  font-weight: bold;
}

/* 禁用状态（已提交时） */
.question-options[disabled] .option-item {
  cursor: default;
}

/* 单选/多选框样式 */
::v-deep .el-radio__input.is-checked .el-radio__inner {
  border-color: #1F4E79;
  background-color: #1F4E79;
}

::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  border-color: #1F4E79;
  background-color: #1F4E79;
}

/* Correct answer styling (green and bold) */
.correct-answer {
  color: #1F4E79;
  font-weight: bold;
}

/* Student's correct answer (black) */
.student-correct {
  color: black;
}

/* Student's incorrect answer (red) */
.student-incorrect {
  color: #ff4d4f;
}

/* Answer tip styling */
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

/* Text answer styling */
.text-answer-container {
  margin-top: 10px;
  font-size: 14px; /* Match other question text size */
}



.correct-text {
  color: #1F4E79; /* Black for correct answers */
  font-weight: normal; /* No bold for regular text */
}

.incorrect-text {
  color: #ff4d4f; /* Red for incorrect answers */
}

.correct-answer {
  color: #52c41a; /* Green for correct answers */
  font-weight: bold; /* Bold for correct answers */
}

/* Make sure input field matches too */
::v-deep .el-input__inner {
  font-size: 14px;
}
</style>