<template>
  <div class="index">
      <headerPage></headerPage>
      <div class="index-search">
          <div class="index-search-content">
              <div class="search-content">
                <div class="content1">开始走向成功</div>
                <div class="content2">START TO SUCCESS</div>
                <div class="content3">超过<span style="color:#20B486">5000</span>多门课程来自<span style="color:#20B486">300</span>名讲师&机构</div>
                <div class="content4">Access To <span style="color:#20B486">5000+</span> Courses from <span style="color:#20B486">300</span> Instructors & Institutions</div>
                <div class="content5">多年来，各种版本不断演变，有时是偶然的</div>
                <div class="content6">Various versions have evolved over the years, sometimes by accident,</div>
                <el-input class="searchKey" v-model="searchKey" suffix-icon="el-icon-search" placeholder="请输入想要搜索的课程名称并按回车键搜索" @change="searchTask()"></el-input>
              </div>
            </div>
          <div class="index-image">
            <img class="index-search-image" src="../../assets/image/index/index-image.png"></img>
          </div>
      </div>
      <div class="most-major">
          <div class="most-content"> 
              <div class="page-title">
                <div style="letter-spacing: 2px;">最受欢迎的专业</div>
                <div style="margin-top:10px;color:#92969B">Most <span style="color:#20B486">Popular Major</span></div>
              </div>
              <div class="major-list">
                <div class="major-item" v-for="(item,index) in major" :key="index">
                    <div class="major-name">
                        <i v-if="index == 0" style="font-size:21px" class="el-icon-medal-1"></i>
                        <i v-if="index == 1" style="font-size:21px" class="el-icon-lollipop"></i>
                        <i v-if="index == 2" style="font-size:21px" class="el-icon-milk-tea"></i>
                        <i v-if="index == 3" style="font-size:21px" class="el-icon-moon-night"></i>
                        <i v-if="index == 4" style="font-size:21px" class="el-icon-sunset"></i>
                        <i v-if="index == 5" style="font-size:21px" class="el-icon-truck"></i>
                        <i v-if="index == 6" style="font-size:21px" class="el-icon-bicycle"></i>
                        <i v-if="index == 7" style="font-size:21px" class="el-icon-timer"></i>
                        <i v-if="index == 8" style="font-size:21px" class="el-icon-mic"></i>
                        <i v-if="index == 9" style="font-size:21px" class="el-icon-cpu"></i>
                        <i v-if="index == 10" style="font-size:21px" class="el-icon-thumb"></i>
                        <i v-if="index == 11" style="font-size:21px" class="el-icon-mouse"></i>
                        <i v-if="index == 12" style="font-size:21px" class="el-icon-finished"></i>
                        <i v-if="index == 13" style="font-size:21px" class="el-icon-help"></i>
                        <i v-if="index == 14" style="font-size:21px" class="el-icon-odometer"></i>
                        <i v-if="index == 15" style="font-size:21px" class="el-icon-sugar"></i>
                        <div style="margin-left:6px;letter-spacing: 1px;">{{item.name}}</div>
                    </div>
                    <el-button @click="majorTask(item.name)" style="margin-right:6px" plain size="mini" type="success" icon="el-icon-top-right"></el-button>
                </div>
              </div>
          </div>
      </div>
      <div class="shuju">
          <div class="most-content">
              <div class="page-title">
                <div style="letter-spacing: 2px;">平台数据</div>
                <div style="margin-top:10px;color:#92969B">Our <span style="color:#20B486"> Achievement</span></div>
              </div>
              <div class="shuju-total">
                  <div class="shuju-content">
                    <div class="shuju-item">
                        <img src="../../assets/image/index/Frame 67 (7).png">
                        <div class="shuju-name">
                            <div>{{data.count1}}+</div>
                            <div>教师 Teacher</div>
                        </div>
                    </div>
                    <div class="shuju-item">
                        <img src="../../assets/image/index/Frame 67 (4).png">
                        <div class="shuju-name">
                            <div>{{data.count}}+</div>
                            <div>教程 Video</div>
                        </div>
                    </div>
                    <div class="shuju-item">
                        <img src="../../assets/image/index/Frame 67 (6).png">
                        <div class="shuju-name">
                            <div>{{data.count2}}+</div>
                            <div>学生 Student</div>
                        </div>
                    </div>
                    <div class="shuju-item">
                        <img src="../../assets/image/index/Frame 67 (5).png">
                        <div class="shuju-name">
                            <div>{{data.total}}+</div>
                            <div>用户 Users</div>
                        </div>
                    </div>
                  </div>
                  <div class="shuju-image">
                      <img style="width:50%;height:120%" src="../../assets/image/index/Group 10.png">
                  </div>
              </div>
          </div>
      </div>
      <div class="most-note">
          <div class="most-content">
              <div class="page-title">
                <div style="letter-spacing: 2px;">推荐笔记</div>
                <div style="margin-top:10px;color:#92969B">Recommended <span style="color:#20B486"> Notes</span></div>
              </div>
              <div class="note-list">
                  <div v-for="(item,index) in article" :key="index" class="note-item">
                     <div class="note-image"><img src="../../assets/image/index/Vector (1).png"></div>
                     <div class="note-user">
                         <img class="note-avatar" :src="$store.state.HOST + item.avatar">
                         <div class="note-username">
                             <div>{{item.createBy}} - {{item.createTime}}</div>
                             <div>{{item.title}}</div>
                         </div>
                     </div>
                     <div class="note-font">
                         {{item.articleDesc}}
                     </div>
                  </div>
              </div>
              <div class="task-btns">
                  <el-button @click="toArticle" size="mini" type="success" icon="el-icon-arrow-right"></el-button>
              </div>
          </div>
      </div>
      <div class="liuyan">
          <div class="most-content">
              <div class="liuyan-font">
                <div class="liuyan-image">
                  <img style="width:80%" src="../../assets/image/index/Group 12.png">
                </div>
                <div class="liuyan-content">
                    <div>
                        <div>你的任何疑问都可以留言咨询</div>
                        <div style="margin-top:20px">You can leave a message for consultation if you have any questions</div>
                        <el-button @click="toMessage" style="margin-top:20px" size="mini" icon="el-icon-question" type="success">留言咨询</el-button>
                    </div>
                </div>
              </div>
          </div>
      </div>
      <bottomPage></bottomPage>
  </div>
</template>

<script>
  import {getApeMajorList,getIndexAchievement,getIndexArticleList} from '../../api/api' 
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom" 
  export default {
    data() {
      return{
        searchKey: "",
        major: [],
        data: {
            count: 0,
            count1: 0,
            count2: 0,
            total: 0
        },
        article: [],
      }
    },
    components: {
		headerPage,
        bottomPage
	},
    methods: {
        searchTask() {
            if (this.searchKey) {
                this.$router.push("/task?name=" + this.searchKey)
            }
        },
        majorTask(major) {
            this.$router.push("/task?major=" + major)
        },
        toArticle() {
            this.$router.push("/article")
        },
        toMessage() {
            this.$router.push("/message")
        },
        getApeMajorList() {
			getApeMajorList().then(res => {
                if(res.code == 1000) {
                    var major = res.data
                    this.major = major.splice(0,16)
                } else {
                    this.$notify.error({
                    title: '错误',
                    message: res.message
                    });
                }
			})
        },
        getIndexAchievement() {
            getIndexAchievement().then(res => {
                if(res.code == 1000) {
                    this.data = res.data
                } else {
                    this.$notify.error({
                    title: '错误',
                    message: res.message
                    });
                }
            })
        },
        getIndexArticleList() {
            getIndexArticleList().then(res => {
                if(res.code == 1000) {
                    this.article = res.data
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
      this.getApeMajorList()
      this.getIndexAchievement()
      this.getIndexArticleList()
    }
 }
</script>

<style scoped>
  @import url("../../assets/css/index/index.css");
</style>