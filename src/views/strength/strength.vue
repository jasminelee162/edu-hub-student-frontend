<template>
  <div class="strength-page">
    <headerPage />
    <div class="main-container">
      <!-- 学科分析 -->
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

      <!-- AI 学习建议 -->
      <transition name="fade">
        <div class="glass-card">
          <div class="section-title">
            <i class="el-icon-magic-stick icon"></i> AI 智能学习建议
          </div>
          <div v-if="formattedSuggestion" class="ai-text-html">
            <div v-html="formattedSuggestion"></div>
            <span v-if="isTyping" class="typing-cursor">|</span>
          </div>
          <div v-else class="no-data">
            <div class="loading-spinner">
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
            </div>
            <div>正在生成学习建议...</div>
          </div>
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

            <!-- AI思考中的加载状态 -->
            <div v-if="isAIThinking" class="chat-bubble ai">
              <div class="bubble-content">
                <div class="ai-thinking">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="thinking-text">AI正在思考中...</span>
                </div>
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
                :disabled="isAIThinking"
            />
            <el-button
                type="primary"
                size="mini"
                @click="chatAI"
                :loading="isAIThinking"
                :disabled="isAIThinking || !chatKey.trim()"
            >
              {{ isAIThinking ? '思考中...' : '发送' }}
            </el-button>
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
      weakList: [],
      suggestion: '',
      formattedSuggestion: '',
      chatKey: '',
      chatHistory: [],
      isAIThinking: false,
      isSuggestionLoading: true,
      isTyping: false
    }
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    async loadWeakList() {
      const res = await getStudentWeakList()
      if (res.code === 1000) {
        this.weakList = res.data
        console.log('字段校验：', this.weakList.map(item => ({
          subject: item.subject,
          studentScore: item.studentScore,
          avgScore: item.avgScore,
          status: item.status
        })))
      }
    },
    async loadSuggestion() {
      this.isSuggestionLoading = true
      const id = this.$store?.state?.userId || JSON.parse(localStorage.getItem("user_info") || "{}").id
      if (!id) {
        this.suggestion = "未获取到用户ID，无法生成建议"
        this.formattedSuggestion = this.suggestion
        this.isSuggestionLoading = false
        return
      }
      try {
        const res = await getAISuggestion(id)
        if (res.code === 1000) {
          await this.typeParsedSuggestion(res.message || "暂无建议内容");
          this.suggestion = res.message || "暂无建议内容";
          console.log("建议：",res.message)
        }
      } catch (error) {
        this.suggestion = "服务繁忙，请稍后刷新页面"
        this.formattedSuggestion = this.suggestion
      } finally {
        this.isSuggestionLoading = false
      }
    },
    async typeParsedSuggestion(text) {
      this.formattedSuggestion = ""
      this.isTyping = true

      let raw = "" // 原始 Markdown
      for (let i = 0; i < text.length; i++) {
        raw += text[i]
        this.formattedSuggestion = marked.parse(raw)
        await new Promise(resolve => setTimeout(resolve, 15))

        this.$nextTick(() => {
          const container = this.$el.querySelector('.ai-text-html')
          if (container) container.scrollTop = container.scrollHeight
        })
      }

      this.isTyping = false
    },
    async chatAI() {
      if (!this.chatKey.trim()) return

      const userMsg = this.chatKey.trim()
      this.chatHistory.push({ role: 'user', content: userMsg })
      this.chatKey = ''
      this.isAIThinking = true
      this.scrollToBottom()

      try {
        const res = await getAIChat({ key: userMsg })
        if (res.code === 1000) {
          this.chatHistory.push({ role: 'ai', content: res.message })
        } else {
          this.chatHistory.push({ role: 'ai', content: 'AI 暂时无法回答，请稍后再试。' })
        }
      } catch (error) {
        this.chatHistory.push({ role: 'ai', content: 'AI 服务出错，请稍后再试。' })
      } finally {
        this.isAIThinking = false
        this.scrollToBottom()
      }
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
.typing-cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: #6427FF;
  font-weight: bold;
}
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

/* AI 建议文字样式 */
/* 确保容器有良好的显示效果 */
.ai-text-html {
  min-height: 150px;
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  line-height: 1.6;
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: #6427FF;
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.ai-text-html >>> h1,
.ai-text-html >>> h2,
.ai-text-html >>> h3 {
  color: #1F4E79;
  margin: 15px 0 10px;
}
.ai-text-html >>> h1 {
  font-size: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
.ai-text-html >>> h2 {
  font-size: 18px;
}
.ai-text-html >>> h3 {
  font-size: 16px;
}
.ai-text-html >>> strong {
  color: #6427FF;
  font-weight: bold;
}
.ai-text-html >>> ul,
.ai-text-html >>> ol {
  padding-left: 20px;
  margin: 10px 0;
}
.ai-text-html >>> li {
  margin-bottom: 5px;
}
.ai-text-html >>> blockquote {
  border-left: 3px solid #6427FF;
  padding-left: 15px;
  margin: 10px 0;
  color: #666;
}
.ai-text-html >>> code {
  background: rgba(100, 39, 255, 0.1);
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}
.ai-text-html >>> pre {
  background: rgba(100, 39, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}
.ai-text-html >>> pre code {
  background: none;
  padding: 0;
}

/* 暂无数据 */
.no-data {
  color: #1F4E79;
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* 加载动画 */
.loading-spinner {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.spinner-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #6427FF;
  opacity: 0.4;
  animation: bounce 1.2s infinite ease-in-out;
}
.spinner-dot:nth-child(1) {
  animation-delay: 0s;
}
.spinner-dot:nth-child(2) {
  animation-delay: 0.2s;
}
.spinner-dot:nth-child(3) {
  animation-delay: 0.4s;
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

/* 聊天区域 */
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

/* AI思考中状态 */
.ai-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  height: 20px;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6427FF;
  margin: 0 2px;
  opacity: 0.4;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.thinking-text {
  color: #1F4E79;
  font-size: 14px;
}

/* 动画 */
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

@keyframes typing {
  0%, 100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* 禁用状态样式 */
.chat-input.is-disabled ::v-deep .el-textarea__inner {
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
}
</style>