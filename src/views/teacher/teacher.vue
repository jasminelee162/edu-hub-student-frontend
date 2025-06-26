<template>
  <div class="teacher"> 
    <headerPage></headerPage>
    <div class="teacher-page-content">
        <div class="teacher-page-search">
            <div style="width:40%;font-family:'黑体';display:flex;align-items:center;margin-top:15px;margin-left:10px;margin-bottom:10px">
                <div>教师名称：</div>
                <div>
                  <el-input size="mini" v-model="search.userName" placeholder="请输入教师名称"></el-input>
                </div>
            </div>
            <div class="teacher-page-btns">
                <el-button icon="el-icon-search" size="mini" type="primary" plain @click="searchPage()">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" type="warning" plain @click="refresh()">重置</el-button>
            </div>
            <div style="margin-left:10px;margin-bottom:20px;font-family:'黑体';width:100%;display:flex;flex-wrap: wrap;">
              <span style="margin-right:10px">学校：</span>
              <span class="task-search-type" @click="searchSchool(item.name)" v-for="(item,index) in school" :key="index">{{item.name}}</span>
            </div>
        </div>
        <div class="teacher-page-title">
            教师列表
        </div>
        <div class="teacher-page-list">
            <div @click="toTeacherInfo(item.id)" v-for="(item,index) in tableData" :key="index" class="teacher-page-item">
                <img style="width:100%;height:80%" :src="$store.state.HOST + item.avatar">
                <div class="teacher-page-name">
                    <div style="margin-left:10px">{{item.userName}}</div>
                    <div style="margin-right:10px"><i class="el-icon-news"></i>{{item.school}}</div>
                </div>
            </div>
        </div>
        <div class="teacher-page-fenye">
            <el-pagination
            background
            :page-size="search.pageSize"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :total="total">
            </el-pagination>
        </div>
        <div class="teacher-bottom-image">
            <img style="width:100%" src="../../assets/image/17.png">
        </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>

<script> 
  import {getUserPage,getApeSchoolList} from '../../api/api' 
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom"
  export default {
    data() {
      return{
        search: {
            userName: "",
            userType: 1,
            school: "",
            pageSize: 12,
            pageNumber: 1
        },
        tableData: [],
        school: [],
        total: 0
      }
    },
    components: {
      headerPage,
      bottomPage
    },
    methods: {
        searchPage() {
          this.search.pageNumber = 1
          this.query()
        },
        searchSchool(name) {
          this.search.pageNumber = 1
          this.search.school = name
          this.query()
        },
        query() {
          getUserPage(this.search).then(res => {
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
        refresh() {
          this.search = {
            userName: "",
            userType: 1,
            school: "",
            pageSize: 12,
            pageNumber: 1
          },
          this.query()
        },
        handleCurrentChange(val) {
          this.search.pageNumber = val
          this.query()
        },
        toTeacherInfo(id) {
          this.$router.push("/teacherInfo?id=" + id)
        },
        getApeSchoolList() {
          getApeSchoolList().then(res => {
              if(res.code == 1000) {
                  this.school = res.data
              } else {
                  this.$notify.error({
                  title: '错误',
                  message: res.message
                  });
              }
          })
        }
    },
    created() {
     
    },
    mounted() {
      this.getApeSchoolList()
      this.query()
    }
 }
</script>

<style scoped>
  @import url("../../assets/css/teacher/teacher.css");
</style>