<template>
  <div class="teacherInfo">
    <headerPage></headerPage>
    <div class="teacherInfo-content">
        <div class="teacherInfo-name">
            <div class="teacherInfo-desc">
                <div class="teacherInfo-title">{{teacher.userName}}</div>
                <div class="teacherInfo-title1">
                    <el-tooltip class="item" effect="dark" :content="teacher.remark" placement="bottom">
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                    {{teacher.remark}}
                </div>
            </div>
            <div class="teacherInfo-list">
                <div class="teacherInfo-image">
                    <div class="teacherInfo-fengmian">
                        <img style="width:100%;height:100%" :src="$store.state.HOST + teacher.avatar">
                    </div>
                </div>
                <div class="teacherInfo-video">
                    <div class="teacherInfo-title2">课程列表：</div>
                    <div @click="toTask(item.id)" class="teacherInfo-video-item" v-for="(item,index) in task" :key="index">
                        <div :title="item.name" class="teacherInfo-video-item1">{{item.name}}</div>
                        <div class="teacherInfo-video-item2"><i class="el-icon-arrow-right"></i></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>

<script>
  import {getUserById,getTaskByTeacher} from '../../api/api'
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom"
  export default {
    data() {
      return{
        teacherId: "",
        teacher: {},
        task: [],
        commentList: []
      }
    },
    components: {
      headerPage,
      bottomPage,
    },
    methods: {
      toTask(id) {
        this.$router.push("/taskInfo?id=" + id)
      }
    },
    created() {

    },
    mounted() {
      var teacherId = this.$route.query.id
      if (teacherId) {
        this.teacherId = teacherId
      }
      getUserById({id:this.teacherId}).then(res => {
        if (res.code == 1000) {
          this.teacher = res.data
        }
      })
      getTaskByTeacher({id:this.teacherId}).then(res => {
        if (res.code == 1000) {
          this.task = res.data
        }
      })
    }
 }
</script>

<style scoped>
  @import url("../../assets/css/teacher/teacherInfo.css");
    /* 新增样式 */
  .teacherInfo-title1 {
    display: flex;
    align-items: center;
    margin-top: 8px;
  }

  .remark-text {
    white-space: normal;
    word-break: break-word;
    margin-left: 5px;
    line-height: 1.5;
  }

  .el-icon-info {
    cursor: pointer;
    color: #909399;
    margin-right: 5px;
  }

  .el-icon-info:hover {
    color: #409EFF;
  }
</style>