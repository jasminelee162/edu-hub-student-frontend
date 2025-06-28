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
                <div class="score">我的得分：<span>{{ item.studentScore }}</span></div>
                <div class="score">平均得分：<span>{{ item.avgScore }}</span></div>
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

      <!-- 🤖 AI 聊天 -->
      <transition name="fade">
        <div class="glass-card">
          <div class="section-title">
            <i class="el-icon-chat-dot-round icon"></i> 与 AI 对话
          </div>
          <el-input
              type="textarea"
              v-model="chatKey"
              placeholder="请输入你的学习问题（如：如何高效学习数学？）"
              rows="3"
          />
          <el-button type="primary" size="mini" @click="chatAI" style="margin-top: 10px">发送</el-button>
          <div v-if="chatResp" class="chat-response fade-in">{{ chatResp }}</div>
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
      chatKey: '',
      chatResp: ''
    }
  },
  methods: {
    loadWeakList() {
      getStudentWeakList().then(res => {
        console.log("薄弱科目返回：", res)
        if (res.code === 1000) {
          this.weakList = res.message
        }
      })
    },

    loadSuggestion() {


      getAISuggestion(this.userId).then(res => {
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
      getAIChat({ key: this.chatKey }).then(res => {
        console.log("AI 对话返回：", res)
        if (res.code === 1000) {
          this.chatResp = res.message
        }
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
  color: #ff4d4f;
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
  color: #ffffff;
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