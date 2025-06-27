<template>
  <div class="notice">
    <headerPage></headerPage>
    <div class="notice-page-content">

          <el-dialog
              class="notice-dialog"
              title="公告详情"
              :visible.sync="dialogVisible"
              width="600px"
              :before-close="handleClose"
              center
          >
            <div v-html="notice.content" class="notice-dialog-content"></div>
          </el-dialog>

        <div class="notice-page-title">
            公告列表
        </div>
        <div class="notice-page-list">
            <div v-for="(item,index) in tableData" :key="index" class="notice-page-item">
                <div @click="getNoticeInfo(index)" style="margin-left:20px">
                    {{index + 1}}. {{item.title}}
                </div>
                <div style="margin-right:20px">
                    <i class="el-icon-bell"></i>
                </div>
            </div>
        </div>
        <div class="notice-page-fenye">
            <el-pagination
            background
            :page-size="pageSize"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :total="total">
            </el-pagination>
        </div>
        <div class="notice-page-bottom">

        </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>

<script>
  import {getAccountPage} from '../../api/api' 
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom"
  export default {
    data() {
      return{
        pageSize: 10,
        pageNumber: 1,
        tableData: [],
        total: 0,
        notice: {},
        dialogVisible: false  // 控制弹窗是否显示
      }
    },
    components: {
      headerPage,
      bottomPage
    },
    methods: {
        getNoticeInfo(index) {
          this.notice = this.tableData[index]
          this.dialogVisible = true
        },
      handleClose() {
        this.dialogVisible = false
        this.notice = {}
      },
        query() {
          var param = {
            pageSize: this.pageSize,
            pageNumber: this.pageNumber,
          }
          getAccountPage(param).then(res => {
            if(res.code == 1000) {
              this.tableData = res.data.records
              this.total = res.data.total
            } else {
              this.$notify.error({
                title: '错误',
                message: res.message
              });
            }
          })
        },
        handleCurrentChange(val) {
          this.pageNumber = val
          this.query()
        }
    },
    created() {
     
    },
    mounted() {
      this.query()
    }
 }
</script>

<style scoped>
  @import url("../../assets/css/notice/notice.css");

    /* 弹窗整体 */
  ::v-deep .notice-dialog .el-dialog {
    border-radius: 12px;
    background-color: #F4FAFF; /* 淡蓝卡片背景 */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }

  /* 标题样式 */
  ::v-deep .notice-dialog .el-dialog__title {
    color: #1F4E79;
    font-weight: bold;
    font-size: 36px;
  }

  /* 关闭按钮样式 */
  ::v-deep .notice-dialog .el-dialog__headerbtn .el-dialog__close {
    color: #1F4E79;
    font-size: 25px;
  }

  /* 正文内容区域 */
  .notice-dialog-content {
    font-size: 16px;
    color: #1F4E79;
    line-height: 1.8;
    word-break: break-word;
    padding: 10px 4px;
  }
  ::v-deep .notice-dialog .el-dialog {
    transition: all 0.3s ease;
    transform: scale(1);
  }
</style>