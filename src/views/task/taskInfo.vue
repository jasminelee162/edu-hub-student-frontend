<template>
  <div class="taskInfo">
    <headerPage></headerPage>
    <div class="taskInfo-content">
        <div class="taskInfo-name">
            <div class="taskInfo-desc">
                <div class="taskInfo-title">{{task.name}}
                    <el-button size="mini" v-if="flag" type="warning" @click="removeFavor" icon="el-icon-star-off" circle></el-button>
                    <el-button size="mini" v-if="!flag" type="success" @click="addFavor" icon="el-icon-star-on" circle></el-button>
                </div>
                <div class="taskInfo-title1">
                    <el-tooltip class="item" effect="dark" :content="task.taskDescribe" placement="bottom">
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                    {{task.taskDescribe}}
                </div>
            </div> 
            <div class="taskInfo-list">
                <div class="taskInfo-image">
                    <div class="taskInfo-fengmian">
                        <video v-if="select" ref="videoPlayer" id="videoPlayer" :src="selectSrc" class="video-js" style="width:100%;height:100%"></video>
                        <img v-if="!select" style="width:100%;height:100%" :src="$store.state.HOST + task.image">
                    </div>
                    <div class="taskInfo-btns">
                        <div @click="addTaskStudent" title="报名课程" class="taskInfo-icon">
                            <i class="el-icon-document-checked"></i>
                        </div>
                        <div @click="toQuestion(task.id)" title="课程答疑" class="taskInfo-icon">
                            <i class="el-icon-question"></i>
                        </div>
                        <div @click="toTeacher(task.teacherId)" title="课程讲师" class="taskInfo-icon">
                            <i class="el-icon-link"></i>
                        </div>
                        <div @click="toArticle" title="课程笔记" class="taskInfo-icon">
                            <i class="el-icon-notebook-1"></i>
                        </div>
                        <div @click="toAssign()" title="章节作业" class="taskInfo-icon">
                            <i class="el-icon-news"></i>
                        </div>
                        <div @click="downloadfile" title="下载课件" class="taskInfo-icon">
                            <i class="el-icon-download"></i>
                        </div>
                        <div @click="toLearning" title="学习进度" class="taskInfo-icon">
                            <i class="el-icon-data-line"></i>
                        </div>
                    </div>
                </div>
                <div class="taskInfo-video">
                    <div @click="changeChapter(index)" class="taskInfo-video-item" v-for="(item,index) in chapter" :key="index">
                        <div :title="item.name" class="taskInfo-video-item1">{{item.name}}</div>
                        <div class="taskInfo-video-item2"><i class="el-icon-arrow-right"></i></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="taskInfo-bottom">
        <div class="taskInfo-comment">
            <div class="taskInfo-comment-font">评论：</div>
            <div class="taskInfo-comment-content">
                <el-input type="textarea" resize="none" rows="7" v-model="content" placeholder="请输入评论内容"></el-input>
                <div class="taskInfo-comment-btn">
                    <el-button @click="saveTaskComment" style="margin-top:10px" size="mini" type="success" plain>提交评论</el-button>
                </div>
            </div>
        </div>
    </div>
    <div class="taskInfo-bottom">
        <div class="taskInfo-comment">
            <div class="taskInfo-comment-font">评论列表：</div>
            <div v-if="commentList.length <= 0" style="border: 2px solid #EFF1F2;border-radius: 7px;">
                <el-empty description="课程还没有评论，快去发表评论吧！"></el-empty>
            </div>
            <div v-if="commentList.length > 0" class="taskInfo-comment-list">
                <div v-for="(item,index) in commentList" :key="index">
                    <div v-if="(index+1)%2 == 1" class="taskInfo-comment-item">
                        <div>
                            <img style="width:40px;height:40px;border-radius:50%" :src="$store.state.HOST + item.avatar">
                        </div>
                        <div style="width:80%">
                            <div class="taskInfo-comment-item1">{{item.createBy}}</div>
                            <div class="taskInfo-comment-item2"><div style="padding-top:10px;padding-bottom:10px;margin-left:10px">{{item.content}}</div></div>
                        </div>
                    </div>
                    <div v-if="(index+1)%2 == 0" class="taskInfo-comment-item-right">
                        <div style="width:60%;display:flex;flex-direction: column;align-items: flex-end;margin-right:15px">
                            <div class="taskInfo-comment-item1">{{item.createBy}}</div>
                            <div class="taskInfo-comment-item3"><div style="padding-top:10px;padding-bottom:10px;margin-left:10px">{{item.content}}</div></div>
                        </div>
                        <div>
                            <img style="width:40px;height:40px;border-radius:50%" :src="$store.state.HOST + item.avatar">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <bottomPage></bottomPage>
  </div>
</template>



<script>
  import {saveTaskFavor,removeTaskFavor,getTaskFavorById,saveChapterVideo,getHomeworkByChapterId,getTaskById,saveTaskStudent,getTaskStudent,getChapterByTaskId,saveTaskComment,getTaskCommentListByTaskId} from "../../api/api"
  import videojs from 'video.js'
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom"
  export default {
    data() {
      return{
        user: {},
        taskId: "",
        state: 2,
        task: {},
        chapter: [],
        selectChapter: "",
        selectSrc: "",
        select: false,
        commentList: [],
        content: "",
        player: null,
        options: {
          autoplay: true,
          controls: true,
          sources: [
          ]
        },
        favor: {},
        flag: false,
      }
    },
    components: {
      headerPage,
      bottomPage
    },
    methods: {
        removeFavor() {
            removeTaskFavor({ids:this.favor.id}).then(res => {
                if (res.code == 1000) {
                    this.$message({
                        type: 'success',
                        message: '取消收藏成功'
                    });
                    this.getTaskFavorById()
                }
            })
        },
        addFavor() {
            var param = {
                taskId: this.taskId,
                userId: this.user.id
            }
            saveTaskFavor(param).then(res => {
                if (res.code == 1000) {
                    this.$message({
                        type: 'success',
                        message: '收藏成功'
                    });
                    this.getTaskFavorById()
                }
            })
        },
        getTaskFavorById() {
            getTaskFavorById({taskId: this.taskId,userId:this.user.id}).then(res => {
                if (res.code == 1000) {
                    this.favor = res.data
                    this.flag = true
                } else {
                    this.favor = {}
                    this.flag = false
                }
            })
        },
        getTaskCommentListByTaskId() {
            getTaskCommentListByTaskId({id:this.taskId}).then(res => {
                if (res.code == 1000) {
                    this.commentList = res.data
                }
            })
        },
        toQuestion(id) {
            if (this.state != 0) {
                this.$message({
                    type: 'warning',
                    message: '报名课程通过后才能进行答疑'
                });
                return
            }
            this.$router.push("/question?id=" + id)
        },
        saveTaskComment() {
            if (this.state != 0) {
                this.$message({
                    type: 'warning',
                    message: '报名课程通过后才能发表评论'
                });
                return
            }
            var param = {
                content: this.content,
                taskId: this.taskId
            }
            saveTaskComment(param).then(res => {
                if (res.code == 1000) {
                    this.$message({
                        type: 'success',
                        message: '评论成功'
                    });
                    this.content = ""
                    this.getTaskCommentListByTaskId()
                }
            })
        },
        toTeacher(id) {
            this.$router.push("/teacherInfo?id=" + id)
        },
        toArticle() {
            this.$router.push("/article?name="+this.task.name)
        },
        toLearning() {
            if (this.state != 0) {
                this.$message({
                    type: 'warning',
                    message: '请先报名课程'
                });
                return
            }
            this.$router.push("/rateOfLearning?id="+this.task.id)
        },
        downloadfile() {
            if (this.state != 0) {
                this.$message({
                    type: 'warning',
                    message: '报名课程通过后才能下载课件'
                });
                return
            }
            if (this.selectChapter == "") {
                this.$message({
                    type: 'warning',
                    message: '请先选择章节再下载课件'
                });
                return
            } 
            if (this.selectChapter.courseware) {
                window.location.href = this.$store.state.HOST + this.selectChapter.courseware
            } else {
                this.$message({
                    type: 'warning',
                    message: '该章节暂无课件'
                });
                return
            }
        },
        changeChapter(index) {
            if (this.state != 0) {
                this.$message({
                    type: 'warning',
                    message: '报名课程通过后才能观看视频'
                });
                return
            }
            this.select = false
            this.selectChapter = this.chapter[index]
            var that = this
            // this.options.sources[0] = {
            //     src: this.$store.state.HOST + this.selectChapter.video,
            // }
            this.selectSrc = this.$store.state.HOST + this.selectChapter.video
            this.select = true
            if (this.player == null) {
                setTimeout(function() {
                    that.player = videojs("videoPlayer", that.options, function onPlayerReady() {})
                    that.player.on("ended", () => {
                        var param = {
                            chapterId: that.selectChapter.id,
                        }
                        saveChapterVideo(param)
                    });
                },2000)
            }
            
        },
        addTaskStudent() {
            if (this.state == 0) {
                this.$message({
                    type: 'success',
                    message: '报名已通过无需重复操作'
                });
            } else if(this.state == 1) {
                this.$message({
                    type: 'success',
                    message: '已存在报名记录，请耐心等待教师通过！'
                });
            } else {
                var param = {
                    taskId: this.taskId
                }
                saveTaskStudent(param).then(res => {
                    if (res.code == 1000) {
                        this.$message({
                            type: 'success',
                            message: '报名成功，请等待教师通过!'
                        });
                        getTaskStudent({id:this.taskId}).then(res => {
                            if (res.code == 1000) {
                                this.state = res.data
                            }
                        })
                    }
                }) 
            }
        },
        toAssign() {
            if (this.state != 0) {
                this.$message({
                    type: 'warning',
                    message: '报名课程通过后才能完成作业'
                });
                return
            }
            if (this.selectChapter == "") {
                this.$message({
                    type: 'warning',
                    message: '请先选择课程章节!'
                });
                return
            }
            getHomeworkByChapterId({id:this.selectChapter.id}).then(res => {
                if (res.code == 1000) {
                    this.$router.push("/assignInfo?id="+ this.selectChapter.id)
                } else {
                    this.$message({
                        type: 'warning',
                        message: '该章节暂未发布作业!'
                    });
                }
            })
        }
    },
    created() {
     
    },
    mounted() {
      window.scrollTo({
         top: 0,
         behavior: 'smooth'
      });
      this.user = JSON.parse(window.localStorage.getItem("user_info"))
      var that = this
      this.taskId = this.$route.query.id
      getTaskById({id:this.taskId}).then(res => {
          if (res.code == 1000) {
            this.task = res.data
          }
      })
      getTaskStudent({id:this.taskId}).then(res => {
          if (res.code == 1000) {
            this.state = res.data
          }
      })
      getChapterByTaskId({id: this.taskId}).then(res => {
          if (res.code == 1000) {
            this.chapter = res.data
          }
      })
      this.getTaskCommentListByTaskId()
      this.getTaskFavorById()
    },
    beforeDestroy() {
      if (this.player) {
        this.player.dispose()
      }
    }
 }
</script>

<style scoped>
  @import url("../../assets/css/task/taskInfo.css");
</style>