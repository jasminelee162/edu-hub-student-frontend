<template>
  <div class="test-page">
    <headerPage></headerPage>
    <div class="main-container">
      <div class="glass-card">
        <div class="section-title">
          <i class="el-icon-edit-outline icon"></i> 考试中心
        </div>

        <div class="exam-stats">
          <div class="stats-card">
            <div class="stats-title">我的考试</div>
            <div class="stats-value"><span>{{examCount}}</span> 场</div>
            <div class="stats-title">待参加考试</div>
            <div class="stats-value"><span>{{ pendingExamCount }}</span> 场</div>
          </div>

          <div class="exam-notice">
            <div class="notice-title">考前须知：</div>
            <div class="notice-content">
              <div>1、请提前进行基础设备检测，包括鼠标、键盘、显示器或其他硬件设备；</div>
              <div>2、请拔掉U盘、移动硬盘或其他与考试无关的外接设备。</div>
              <div>3、如果您使用的是移动电脑，请确保电源连接正常。</div>
              <div>4、请确保系统内未开启与考试无关的非必要软件；</div>
              <div>5、考试过程中，如非特殊要求，请勿执行任何会导致考试页面失焦的操作；</div>
              <div>6、考试过程中，如非特殊要求，请勿修改浏览器和页面的大小；</div>
              <div>7、有些考试可能会禁用复制粘贴功能。</div>
              <div>8、如果有考试开启了防作弊视频监控，请提前完成摄像头检测工作。</div>
            </div>
          </div>
        </div>

        <div class="exam-list">
          <div v-for="(item,index) in test" :key="index" class="exam-card fade-in">
            <div class="exam-header">
              <span class="exam-name">{{item.name}}</span>
              <span class="exam-status" :class="{
                'status-not-started': item.schedule === '未开始',
                'status-completed': item.schedule === '已完成'
              }">{{item.schedule}}</span>
            </div>

            <div class="exam-details">
              <div class="detail-item"><span>所属课程：</span>{{item.taskName}}</div>
              <div class="detail-item"><span>发布讲师：</span>{{item.createBy}}</div>
              <div class="detail-item"><span>考试时间：</span>{{item.totalTime}}分钟</div>
              <div class="detail-item"><span>总分：</span>{{item.totalScore}}分</div>
              <div class="detail-item"><span>参与时间：</span>{{item.startTime}}</div>
              <div class="detail-item"><span>截止时间：</span>{{item.endTime}}</div>
              <div class="detail-item"><span>成绩：</span>{{item.scoreTotal}}分</div>
            </div>

            <div class="exam-actions">
              <el-button
                  @click="toTestInfo(item.id, item.schedule)"
                  :icon="item.schedule === '未开始' ? 'el-icon-edit' : 'el-icon-view'"
                  size="mini"
                  :type="item.schedule === '未开始' ? 'primary' : 'success'">
                {{item.schedule === '未开始' ? '开始考试' : '查看详情'}}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>

<script>
import {getTestListByUser, canEnterTest} from '../../api/api'
import headerPage from "../../components/header/header"
import bottomPage from "../../components/bottom/bottom"
export default {
  data() {
    return{
      test: [],
      examCount: 0,  // 考试次数
      examCompeteCount:0 //已完成考试次数
    }
  },
  components: {
    headerPage,
    bottomPage
  },
  computed: {
    pendingExamCount() {
      return this.test.filter(item => item.schedule === '未开始').length;
    }
  },
  methods: {
    getTestListByUser() {
      getTestListByUser().then(res => {
        if (res.code == 1000) {
          this.test = res.data
          this.examCount = this.test.length
        }
      })
    },
    toTestInfo(id, schedule) {
      if (schedule === '未开始') {
        // 还未开始的考试，校验是否过期
        canEnterTest({testId: id}).then(res => {
          if (res.code === 1000) {
            this.$router.push("/testInfo?id=" + id);
          } else {
            this.$message.error(res.message || "考试已结束，无法进入试卷");
          }
        }).catch(() => {
          this.$message.error("系统错误，无法进入试卷");
        });
      } else {
        // 其他状态直接跳转
        this.$router.push("/testInfo?id=" + id);
      }
    }
  },
  created() {

  },
  mounted() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.getTestListByUser()
  }
}
</script>

<style scoped>
.test-page {
  width: 100%;
  height: 100%;
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

.exam-stats {
  display: flex;
  margin-bottom: 30px;
  gap: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  width: 200px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-title {
  font-size: 20px;
  color: #1F4E79;
  margin-bottom: 10px;
  font-weight: bold;
  margin-top: 80px;
}

.stats-value span {
  font-size: 35px;
  color: #67AEF7;
  font-weight: bold;
}

.exam-notice {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notice-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #1F4E79;
}

.notice-content {
  font-size: 14px;
  line-height: 1.6;
  color: #1F4E79;
}

.notice-content div {
  margin-bottom: 5px;
}

.exam-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.exam-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.exam-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.exam-name {
  font-weight: bold;
  font-size: 16px;
  color: #1F4E79;
}

.exam-status {
  font-size: 14px;
  padding: 3px 10px;
  border-radius: 15px;
}

.status-not-started {
  background-color: #E6F7FF;
  color: #1890FF;
}

.status-completed {
  background-color: #F6FFED;
  color: #52C41A;
}

.exam-details {
  margin-bottom: 15px;
}

.detail-item {
  font-size: 14px;
  margin-bottom: 8px;
  color: #1F4E79;
  word-break: break-word;
}

.detail-item span {
  font-weight: bold;
  margin-right: 5px;
}

.exam-actions {
  display: flex;
  justify-content: flex-end;
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

::v-deep .el-button--mini {
  padding: 7px 15px;
}
</style>