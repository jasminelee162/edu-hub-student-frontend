<template>
  <div class="notice">
    <headerPage></headerPage>
    <div class="notice-page-content">
        <div class="notice-page-title">
            作业列表
        </div>
        <div class="notice-page-list">
            <div @click="toAssignInfo(item.chapterId)" v-for="(item,index) in data" class="notice-page-item">
                <div style="margin-left:20px">
                    {{index + 1}}. {{item.taskName + ' - ' + item.chapterName +' - 章节作业'}} 
                </div>
                <div style="margin-right:20px">
                    <i class="el-icon-bell"></i>
                </div>
            </div>
        </div>
        <div class="notice-page-bottom">

        </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>

<script>
  import {getMyHomework} from "../../api/api"
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom"
  export default {
    data() {
      return{
        data: []
      }
    },
    components: {
      headerPage,
      bottomPage
    },
    methods: {
        query() {
          getMyHomework().then(res => {
            if(res.code == 1000) {
              console.log("作业数据：", res)
              this.data = res.data
            }
          })
        },
        toAssignInfo(id) {
            this.$router.push("/assignInfo?id="+id)
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
</style>