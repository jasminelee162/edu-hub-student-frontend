<template>
  <div class="articleInfo">
      <headerPage></headerPage>
      <div class="articleInfo-content">
          <div class="articleInfo-title">
              <div>
                  <div class="articleInfo-title1">{{article.title}}</div>
                  <div class="articleInfo-title2">{{article.createBy}} - {{article.createTime}}</div>
              </div>
              <div  class="favor-btn-group">
                <el-button v-if="article.favor == 1" type="warning" @click="removeFavor" icon="el-icon-star-off" circle></el-button>
                <el-button v-if="article.favor == 0" type="success" @click="addFavor" icon="el-icon-star-on" circle></el-button>
                <el-button v-if="article.createBy == user.userName" @click="editArticle(article.id)" type="success" icon="el-icon-edit" circle></el-button>
              </div>
          </div>
          <div class="articleInfo-desc">
              <div class="articleInfo-desc1">
                  <span style="font-weight:bold">摘要：</span>{{article.articleDesc}}
              </div>
              <div class="articleInfo-desc2">
                  <span style="font-weight:bold">正文：</span>
                  <div v-html="article.content">
                  </div>
              </div>
          </div>
      </div>
      <div class="articleInfo-bottom">
        <div class="articleInfo-comment">
            <div class="articleInfo-comment-font">评论：</div>
            <div class="articleInfo-comment-content">
                <el-input type="textarea" resize="none" rows="7" v-model="content" placeholder="请输入评论内容"></el-input>
                <div class="articleInfo-comment-btn">
                    <el-button @click="saveArticleComment" style="margin-top:10px" size="mini" type="success" plain>提交评论</el-button>
                </div>
            </div>
        </div>
      </div>
      <div class="articleInfo-bottom">
        <div class="articleInfo-comment">
            <div class="articleInfo-comment-font">评论列表：</div>
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
  import {saveArticleFavor,removeArticleFavor,getArticleById,saveArticleComment,getArticleCommentByArticleId} from '../../api/api'
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom"
  export default {
    data() {
      return{
        user: {},
        articleId: "",
        article: {},
        content: "",
        commentList: []
      }
    },
    components: {
      headerPage,
      bottomPage
    },
    methods: {
      removeFavor() {
        var param = {
          articleId: this.articleId,
          userId: this.user.id
        }
        removeArticleFavor(param).then(res => {
          if(res.code == 1000) {
            this.$message({
              type: 'success',
              message: '取消收藏成功!'
            });
            this.getArticleById()
          }
        })
      },
      addFavor() {
        var param = {
          articleId: this.articleId,
          userId: this.user.id
        }
        saveArticleFavor(param).then(res => {
          if(res.code == 1000) {
            this.$message({
              type: 'success',
              message: '收藏成功!'
            });
            this.getArticleById()
          }
        })
      },
      editArticle(noteId) {

        this.$router.push(`/editArticle?id=${noteId}`)
      },
      saveArticleComment() {
        var param = {
          taskId: this.articleId,
          content: this.content
        }
        saveArticleComment(param).then(res => {
          if (res.code == 1000) {
            this.$message({
              type: 'success',
              message: '评论成功!'
            });
            this.content = ""
            this.getArticleCommentByArticleId()
          }
        })
      },
      getArticleCommentByArticleId() {
        getArticleCommentByArticleId({id:this.articleId}).then(res => {
          if (res.code == 1000) {
            this.commentList = res.data
          }
        })
      },
      getArticleById() {
        getArticleById({id: this.articleId}).then(res => {
          console.log("文章内容：",res.data)
          if(res.code == 1000) {
            this.article = res.data
            this.article.title = res.data.title
            this.article.desc = res.data.articleDesc
            this.article.content = res.data.content
          }else {
            this.$message.error(res.message)
          }
        }) 
      },

    },
    created() {
     
    },
    mounted() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      var articleId = this.$route.query.id
      if (articleId) {
        this.articleId = articleId
      }
      this.getArticleById()
      this.getArticleCommentByArticleId()
      this.user = JSON.parse(window.localStorage.getItem("user_info"))

    }
 }
</script>

<style scoped>
  @import url("../../assets/css/article/articleInfo.css");
  ::v-deep img {
    max-width: 100% !important;
  }
</style>