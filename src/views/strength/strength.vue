<template>
  <div class="strength-page">
    <headerPage />
    <div class="main-container">
      <!--  学科分析 -->
      <transition name="fade">
        <div class="glass-card">
          <div class="section-title">
            <i class="el-icon-data-analysis icon"></i> 薄弱学科分析
          </div>
          <el-row :gutter="20" v-if="weakList.length">
            <el-col :span="8" v-for="(item, index) in weakList" :key="index">
              <div class="weak-card fade-in">
                <div class="subject">{{ item.subject }}</div>

                  <div class="score">我的得分：
                    <span v-if="typeof item.studentScore === 'string'">
    <span v-for="(score, i) in item.studentScore.split('，')" :key="i">
      {{ parseFloat(score).toFixed(1) }}<span v-if="i < item.studentScore.split('，').length - 1">，</span>
    </span>
  </span>
                    <span v-else>
    {{ Number.isFinite(item.studentScore) ? item.studentScore.toFixed(1) : '暂无数据' }}
  </span>
                  </div>

                <div class="score">平均得分：
                  <span>{{ Number.isFinite(item.avgScore) ? item.avgScore.toFixed(1) : '暂无数据' }}</span>
                </div>
                <div class="status">状态：<span class="danger">{{ item.status }}</span></div>
              </div>
            </el-col>
          </el-row>
          <div v-else class="no-data">暂无数据</div>
        </div>
      </transition>

      <!--  AI 学习建议 -->
      <transition name="fade">
        <div class="glass-card">
          <div class="section-title">
            <i class="el-icon-magic-stick icon"></i> AI 智能学习建议
          </div>
          <div v-if="suggestion" v-html="suggestion" class="ai-text-html"></div>
          <div v-else class="no-data">正在生成建议...</div>
        </div>
      </transition>

      <!--  AI 聊天 -->
      <transition name="fade">
        <div class="glass-card chat-card">
          <div class="section-title">
            <i class="el-icon-chat-dot-round icon"></i> 与 AI 对话
          </div>
          <div class="chat-history" ref="chatContainer">
            <div
                v-for="(msg, index) in chatHistory"
                :key="index"
                :class="['chat-bubble', msg.role]"
            >
              <div class="bubble-content">
                <span class="chat-text">{{ msg.content }}</span>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <el-input
                type="textarea"
                v-model="chatKey"
                placeholder="请输入你的学习问题（如：如何高效学习数学？）"
                rows="2"
                class="chat-input"
            />
            <el-button type="primary" size="mini" @click="chatAI">发送</el-button>
          </div>
        </div>
      </transition>
    </div>
    <bottomPage />
  </div>
</template>

<script>
import headerPage from '@/components/header/header.vue'
import bottomPage from '@/components/bottom/bottom.vue'
import { getAIChat, getAISuggestion, getStudentWeakList } from '@/api/api'
import { marked } from 'marked'

export default {
  components: { headerPage, bottomPage },
  data() {
    return {
      //userId: this.$store?.state?.userId || JSON.parse(localStorage.getItem("user_info") || "{}").id,
      weakList: [],
      suggestion: '',
      chatKey: '',
      chatResp: '',
      chatHistory: []
    }
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    loadWeakList() {
      getStudentWeakList().then(res => {
        console.log("薄弱科目返回：", res)

        if (res.code === 1000) {
          this.weakList = res.data
        }
        console.log('字段校验：', this.weakList.map(item => ({
          subject: item.subject,
          studentScore: item.studentScore,
          avgScore: item.avgScore,
          status: item.status
        })))
      })
    },

    loadSuggestion() {

      const id =
          this.$store?.state?.userId || JSON.parse(localStorage.getItem("user_info") || "{}").id;

      if (!id) {
        this.suggestion = "未获取到用户ID，无法生成建议"
        return;
      }
      console.log("当前用户 ID：", id)
      getAISuggestion(id).then(res => {
        console.log("原始响应:", res.message);

        if (res.code === 1000) {
          // 确保message存在且为字符串
          const mdContent = res.message || "暂无建议内容";

          // 方案1：使用v-html直接渲染（简单但需注意XSS风险）
          this.suggestion = mdContent;

          // 方案2：使用marked解析（推荐）
          import('marked').then(({ marked }) => {
            this.suggestion = marked.parse(mdContent);
          }).catch(() => {
            this.suggestion = mdContent; // 降级为原始文本
          });
          console.log("处理后内容:", this.suggestion);
        }
      }).catch(err => {
        this.suggestion = "服务繁忙，请稍后刷新页面"; // 更友好的错误提示
      });
    },
    chatAI() {
      if (!this.chatKey.trim()) {
        this.$message.warning('请输入提问内容')
        return
      }
      const userMsg = this.chatKey.trim()
      this.chatHistory.push({ role: 'user', content: userMsg })
      this.chatKey = ''
      this.scrollToBottom()

      getAIChat({ key: userMsg }).then(res => {
        if (res.code === 1000) {
          this.chatHistory.push({ role: 'ai', content: res.message })
        } else {
          this.chatHistory.push({ role: 'ai', content: 'AI 暂时无法回答，请稍后再试。' })
        }
        this.scrollToBottom()
      }).catch(() => {
        this.chatHistory.push({ role: 'ai', content: 'AI 服务出错，请稍后再试。' })
        this.scrollToBottom()
      })
    }
  },
  mounted() {
    this.loadWeakList()
    this.loadSuggestion()

  }
}
</script>

<style scoped>
/* 页面背景 */
.strength-page {
  width: 100%;
  min-height: 100vh;
  background: url('../../assets/image/index/index_back.png') no-repeat center center;
  background-size: cover;
  padding-bottom: 30px;
}

/* 容器 */
.main-container {
  width: 75%;
  margin: 40px auto;
}

/* 模糊卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* 标题样式 */
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

/* 薄弱卡片 */
.weak-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 15px;
  color: #1F4E79;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.subject {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.score {
  margin-bottom: 5px;
}
.status {
  margin-top: 10px;
}
.danger {
  color: #6427FF;
  font-weight: bold;
}

/* AI 建议文字 */
.ai-text {
  color: #1F4E79;
  white-space: pre-line;
  line-height: 1.8;
}

/* AI 聊天回复 */
.chat-response {
  margin-top: 15px;
  padding: 15px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #1F4E79;
  white-space: pre-line;
}

/* 暂无数据 */
.no-data {
  color: #1F4E79;
  text-align: center;
  padding: 20px;
}
.ai-text-html {
  color: #1F4E79;
  line-height: 1.8;
}
.ai-text-html h3 {
  font-size: 18px;
  color: #00ffff;
}
.ai-text-html strong {
  color: #ffd700;
}
.ai-text-html ul {
  padding-left: 20px;
}
/* 淡入动效 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.fade-in {
  animation: fadeIn 0.8s ease forwards;
}

.chat-card {
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
  padding: 10px;
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}

.chat-bubble {
  display: flex;
  margin-bottom: 10px;
}

.chat-bubble.ai {
  justify-content: flex-start;
}

.chat-bubble.user {
  justify-content: flex-end;
}

.bubble-content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;
  animation: fadeIn 0.5s ease;
}

.chat-bubble.ai .bubble-content {
  background: linear-gradient(145deg, #FCDDDD, #eae8fe);
  color: #1f4e79;
  border-top-left-radius: 0;
}

.chat-bubble.user .bubble-content {
  background: linear-gradient(145deg, #c2e4f5, #eae8fe);
  color: #1f4e79;
  border-top-right-radius: 0;
}

.chat-input-area {
  display: flex;
  flex-direction: column;
}

.chat-input {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  margin-bottom: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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