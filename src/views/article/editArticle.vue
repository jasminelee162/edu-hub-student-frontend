<template>
  <div class="addArticle">
    <headerPage></headerPage>
    <div class="addArticle-content">
        <div class="addArticle-form">
            <div class="addArticle-title">
                 编辑笔记
            </div>
            <div class="addArticle-list">
                <div class="addArticle-item">
                    <div style="margin-top:10px;margin-left:10px">标题</div>
                    <div style="margin-top:10px;margin-left:10px;margin-bottom:10px">
                        <el-input size="mini" v-model="form.title" placeholder="请输入笔记标题"></el-input>
                    </div>
                </div>
                <div class="addArticle-item">
                    <div style="margin-top:10px;margin-left:10px">摘要</div>
                    <div style="margin-top:10px;margin-left:10px;margin-bottom:10px">
                         <el-input type="textarea" rows=5 v-model="form.desc" size="mini" placeholder="请输入笔记摘要"></el-input>
                    </div>
                </div>
                <div class="addArticle-item" style="height:600px">
                    <div style="margin-top:10px;margin-left:10px">内容</div>
                    <div style="margin-top:10px;margin-left:10px;margin-bottom:10px">
                        <quill-editor style="height:450px" ref="myQuillEditor" :options="editorOption"
                        v-model="form.content"/>
                        <el-upload class="Quill-uploader" :show-file-list="false" accept="image/*" v-show="0" ref="updateUpload" :multiple="false" :action="uploadImageUrl()"
                            :on-success="handleQillSuccess">
                        </el-upload>
                    </div>
                </div>
                <div style="margin-bottom:20px">
                    <el-button @click="submit" size="mini" type="primary">提交</el-button>
                </div>
            </div>
        </div>
    </div>
    <bottomPage></bottomPage>
  </div>
</template>

<script>
  import { mixin } from '../../minix/index';
  import headerPage from "../../components/header/header"
  import bottomPage from "../../components/bottom/bottom"
  export default {
    mixins: [mixin],
    data() {
      return{
        form: {
            desc: "",
            content: "",
            title: ""
        },
        editorOption: {
          placeholder: "请输入文字内容",
          modules: { 
            toolbar: {
                container: [
                    ["bold", "italic", "underline", "strike"], 
                    ["blockquote", "code-block"], 
                    [{ header: 1 }, { header: 2 }], 
                    [{ list: "ordered" }, { list: "bullet" }], 
                    [{ script: "sub" }, { script: "super" }], 
                    [{ indent: "-1" }, { indent: "+1" }], 
                    [{ direction: "rtl" }], 
                    [{ size: ["small", false, "large", "huge"] }], 
                    [{ header: [1, 2, 3, 4, 5, 6, false] }], 
                    [{ color: [] }, { background: [] }], 
                    [{ font: [] }], [{ align: [] }], 
                    ["clean"], ["image"]
                ],
                handlers: {
                    'image': function ( value ) {
                        if ( value ) {
                            // 触发上传插件
                            document.querySelector('.Quill-uploader .el-upload__input').click()
                        } else {
                            this.quill.format( 'image', false );
                        }
                    }
                }
            },
            syntax: { 
                highlight: text => { 
                    return hljs.highlightAuto(text).value; // 这里就是代码高亮需要配置的地方 
                }
            }
          }
        },
      }
    },
    components: {
      headerPage,
      bottomPage
    },
    methods: {
        submit() {

        },
        handleQillSuccess(res){
            let _this = this;
            if(res.code == 1000){
                _this.$notify({
                    title: '上传成功',
                    type: 'success'
                });
                let imgurl = this.$store.state.configure.HOST + res.message
                let quill = this.$refs.myQuillEditor.quill
                let position = quill.getSelection().index
                quill.insertEmbed(position, 'image', imgurl)
                quill.setSelection(position + 1)
            }else{
                _this.$notify({
                    title: '上传失败',
                    type: 'error'
                });
            }
        },
    },
    created() {
     
    },
    mounted() {
      
    }
 }
</script>

<style scoped>
  @import url("../../assets/css/article/addArticle.css");
</style>