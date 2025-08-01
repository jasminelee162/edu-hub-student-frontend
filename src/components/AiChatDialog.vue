<template>
  <div>
    <!-- 拖动小球 -->
    <div
        class="chat-ball"
        ref="chatBall"
        @mousedown="startDrag"
        @click="toggleChat"
    >
      💬
    </div>

    <!-- 弹出聊天窗 -->
    <transition name="fade">
      <div
          v-if="showDialog"
          class="chat-popup"
          :style="{ left: popupLeft + 'px', top: popupTop + 'px' }"
      >
        <div class="popup-arrow"></div>
        <div class="chat-body">
          <div class="chat-title">AI 学习助手</div>
          <div class="chat-history" ref="chatContainer">
            <div
                v-for="(msg, index) in chatHistory"
                :key="index"
                :class="['chat-bubble', msg.role]"
            >
              <div
                  class="bubble-content markdown-html"
                  v-if="msg.role === 'ai' && index === chatHistory.length - 1 && isTyping"
              >
                <div v-html="typedText"></div>
                <span class="typing-cursor">|</span>
              </div>

              <div
                  class="bubble-content markdown-html"
                  v-else-if="msg.role === 'ai'"
                  v-html="msg.content"
              ></div>

              <div
                  class="bubble-content"
                  v-else
              >
                {{ msg.content }}
              </div>
            </div>
          </div>
          <el-input
              type="textarea"
              v-model="chatKey"
              placeholder="请输入你的问题，Enter 发送"
              rows="2"
              class="chat-input"
              :disabled="isAIThinking"
              @keydown.native="handleKeyDown"
          />
          <div>&nbsp</div>
          <el-button type="primary" size="mini" @click="chatAI"  :loading="isAIThinking"
                     :disabled="isAIThinking || !chatKey.trim()">{{ isAIThinking ? '思考中...' : '发送' }}</el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getAIChat } from '@/api/api'
import { marked } from 'marked'
export default {
  data() {
    return {
      showDialog: false,
      chatKey: '',
      chatHistory: [],
      popupLeft: 100,
      popupTop: 420,
      typedText: '',
      isAIThinking: false,
      isTyping: false
    }
  },
  methods: {
    toggleChat() {
      this.showDialog = !this.showDialog
      this.$nextTick(this.scrollToBottom)
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    handleKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.chatAI()
      }
    },
    async chatAI() {


      const msg = this.chatKey.trim()
      if (!msg) return
      this.chatHistory.push({ role: 'user', content: msg })
      this.chatKey = ''
      this.isAIThinking = true
      this.scrollToBottom()

      try {
        const res = await getAIChat({ key: msg })
        const content = res.code === 1000 ? res.message : 'AI 无法响应'

        // 插入空内容，用于打字机渲染
        const aiMsg = { role: 'ai', content: '' }
        this.chatHistory.push(aiMsg)
        this.typedText = ''
        this.isTyping = true
        await this.typeText(res.message || 'AI 暂时没有回答', aiMsg)
        // 替换最后一条为完整内容（防止切换页面内容丢失）
        //this.chatHistory[this.chatHistory.length - 1].content = content
        this.isTyping = false
      } catch (e) {
        this.chatHistory.push({ role: 'ai', content: 'AI 服务异常' })
      } finally {
        this.isAIThinking = false
        this.scrollToBottom()
      }
    },
    async typeText(text, aiMsg) {
      let raw = ''
      this.typedText = ''

      for (let i = 0; i <= text.length; i++) {
        raw = text.slice(0, i)
        this.typedText = marked.parse(raw)
        aiMsg.content = this.typedText
        await new Promise(resolve => setTimeout(resolve, 20))
        this.scrollToBottom()
      }
    },
    startDrag(e) {
      const ball = this.$refs.chatBall
      const startX = e.clientX - ball.offsetLeft
      const startY = e.clientY - ball.offsetTop
      const move = (e) => {
        let x = e.clientX - startX
        let y = e.clientY - startY
        x = Math.max(0, Math.min(window.innerWidth - 50, x))
        y = Math.max(0, Math.min(window.innerHeight - 50, y))
        ball.style.left = x + 'px'
        ball.style.top = y + 'px'
        this.popupLeft = x + 10
        this.popupTop = y + 80
      }
      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    }
  }
}
</script>
<style scoped>
.markdown-html h1, .markdown-html h2, .markdown-html h3 {
  color: #1F4E79;
  margin: 12px 0;
}
.markdown-html p {
  margin: 6px 0;
}
.markdown-html code {
  background: rgba(100, 39, 255, 0.1);
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}
.markdown-html pre {
  background: rgba(100, 39, 255, 0.05);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
.chat-ball {
  position: fixed;
  left: 100px;
  top: 150px;
  width: 50px;
  height: 50px;
  background: linear-gradient(to bottom right, #c2e4f5, #eae8fe);
  border-radius: 50%;
  color: #1f4e79;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  z-index: 9999;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  user-select: none;
  transition: transform 0.2s ease;
}
.chat-ball:hover {
  transform: scale(1.05);
}

.chat-popup {
  position: fixed;
  width: 360px;
  z-index: 9998;
  transition: all 0.2s ease;
}
@keyframes popup {
  from {
    opacity: 0;
    transform: scale(0.8);
  } to {
      opacity: 1;
      transform: scale(1);
    }
}
.popup-arrow {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #ffffff;
  position: absolute;
  top: -10px;
  left: 25px; /* 与小球中心对齐 */
}

.chat-body {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}
.chat-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1f4e79;
}

.chat-history {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: rgba(242, 243, 255, 0.4);
  border-radius: 10px;
  margin-bottom: 10px;
}
.chat-bubble {
  display: flex;
  margin-bottom: 6px;
}
.chat-bubble.user {
  justify-content: flex-end;
}
.chat-bubble.ai {
  justify-content: flex-start;
}
.bubble-content, .markdown-html {
  /* 原 bubble-content 样式 */
  background: #fcdddd;
  color: #1f4e79;
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 70%;
  word-break: break-word;
  white-space: pre-wrap;
  animation: fadeIn 0.3s ease;
}
.chat-bubble.ai .bubble-content {
  background: #c2e4f5;
}
.chat-input {
  margin-top: 5px;
}

</style>