<template>
  <div class="login">
	<div class="Rectangle">

	</div>
	<div class="login-top">
		<div class="logo">
			<img style="width:200px;padding-left:100px" src="../../assets/image/logo.png">
		</div>
		<div class="btns">
			<div style="padding-right:100px;display:flex">
				<div class="toReg" @click="toRegister">
					<div>注册</div>
				</div>
				<div class="toRegTeacher" @click="toLogin">
					<div>登录</div>
				</div>
			</div>
		</div>
	</div>
	<div class="login-center">
		<div class="about">
      <div class="about-box">
			<div style="text-align:center">
        <div>&nbsp</div>
				<div class="huanying">欢迎加入智能化教育创新平台！</div>
				<div class="huanying1">教育者的使命，在于点燃智慧的火种，而科技的力量，让这火焰照亮更远的未来</div>
				<div class="huanying1">我们相信，真正的教育不仅是知识的传递，更是能力的塑造。借助技术的力量，您可以让教学更精准、更个性化，让每个学生都能在适合自己的节奏中进步</div>
				<div class="huanying1">—— 与您携手，重塑教育的未来 ——</div>
        <div>&nbsp</div>
			</div>
      </div>
		</div>
		<div class="teacherFrom">
			<div class="ruzhu-content">
				<div class="ruzhu-title">入驻信息</div>
				<el-form :model="form" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
					<el-form-item prop="userName">
						<div class="item-title">姓名：</div>
						<el-input v-model="form.userName"></el-input>
					</el-form-item>
					<el-form-item prop="password">
						<div class="item-title">密码：</div>
						<el-input type="password" v-model="form.password"></el-input>
					</el-form-item>
					<el-form-item prop="passwordNew">
						<div class="item-title">确认密码：</div>
						<el-input type="password" v-model="form.passwordNew"></el-input>
					</el-form-item>
					<el-form-item prop="loginAccount">
						<div class="item-title">登录账号：</div>
						<el-input v-model="form.loginAccount"></el-input>
					</el-form-item>
					<el-form-item prop="email">
						<div class="item-title">邮箱：</div>
						<el-input v-model="form.email"></el-input>
					</el-form-item>
					<el-form-item prop="tel">
						<div class="item-title">联系方式：</div>
						<el-input v-model="form.tel"></el-input>
					</el-form-item>
					<el-form-item prop="country">
						<div class="item-title">国家：</div>
						<el-select v-model="form.country">
							<el-option label="中国" value="中国"></el-option>
							<el-option label="日本" value="日本"></el-option>
							<el-option label="韩国" value="韩国"></el-option>
							<el-option label="美国" value="美国"></el-option>
							<el-option label="俄罗斯" value="俄罗斯"></el-option>
							<el-option label="印度" value="印度"></el-option>
							<el-option label="巴西" value="巴西"></el-option>
							<el-option label="新加坡" value="新加坡"></el-option>
							<el-option label="加拿大" value="加拿大"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item prop="country">
						<div class="item-title">性别：</div>
						<el-select v-model="form.sex">
							<el-option label="男" value="0"></el-option>
							<el-option label="女" value="1"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item prop="school">
						<div class="item-title">院校：</div>
						<el-select v-model="form.school">
							<el-option v-for="(item,index) in school" :label="item.name" :value="item.name"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item prop="major">
						<div class="item-title">专业：</div>
						<el-select v-model="form.major">
							<el-option v-for="(item,index) in major" :label="item.name" :value="item.name"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item prop="agree">
						<div class="item-title">职称：</div>
						<el-select v-model="form.agree">
							<el-option label="初级讲师" value="初级讲师"></el-option>
							<el-option label="中级讲师" value="中级讲师"></el-option>
							<el-option label="高级讲师" value="高级讲师"></el-option>
							<el-option label="副教授" value="副教授"></el-option>
							<el-option label="教授" value="教授"></el-option>
							<el-option label="院士" value="院士"></el-option>
						</el-select>
					</el-form-item>


          <el-form-item prop="birth">
            <div class="item-title">生日：</div>
            <el-date-picker
                v-model="form.birth"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="age">
            <div class="item-title">年龄：</div>
            <el-input
                v-model="form.age"
                :readonly="true">
            </el-input>
          </el-form-item>
					<el-form-item prop="workDate">
						<div class="item-title">教龄：</div>
						<el-input type="number" v-model="form.workDate"></el-input>
					</el-form-item>
					<el-form-item prop="address">
						<div class="item-title">地址：</div>
						<el-input type="textarea" rows="3" v-model="form.address"></el-input>
					</el-form-item>
					<el-form-item prop="flair">
						<div class="item-title">资质：</div>
						<el-upload
							:file-list="fileList"
							ref="upload"
							:action="uploadImageUrl()"
							accept="image/*"
							:multiple="false"
							:limit="1"
							:before-upload="beforeAvatorUpload"
							list-type="picture-card"
							:on-preview="handlePictureCardPreview"
							:on-exceed="handleExceed"
							:on-success="handleAvatorSuccess"
							:on-remove="handleRemove">
							<i class="el-icon-plus"></i>
						</el-upload>
						<el-dialog :visible.sync="dialogVisible">
							<img width="100%" :src="dialogImageUrl" alt="">
						</el-dialog>
					</el-form-item>
					<el-form-item prop="remark">
						<div class="item-title">自我介绍：</div>
						<el-input type="textarea" rows="8" v-model="form.remark"></el-input>
					</el-form-item>
				</el-form>
				<div class="ruzhu">
					<div class="ruzhu-btn" @click="toRuZhu()">
						<div>入 驻</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<bottomPage></bottomPage>
  </div>
</template>

<script>
import { getSchoolList, getMajorList, register } from '../../api/api'
import bottomPage from "../../components/bottom/login-bottom"
import { mixin } from '../../minix/index';

export default {
  mixins: [mixin],
  data() {
    return {
      userInfo: {
        username: "",
        password: ""
      },
      school: [],
      major: [],
      dialogImageUrl: '',
      dialogVisible: false,
      form: {
        userName: "",
        password: "",
        passwordNew: "",
        loginAccount: "",
        email: "",
        tel: "",
        sex: "0",
        country: "",
        school: "",
        major: "",
        agree: "",
        age: "",
        birth: "",
        flair: "",
        address: "",
        workDate: "",
        remark: "",
        userType: 1,
        status: 1,
      },
      fileList: [],
      rules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' }
        ],
        passwordNew: [
          { required: true, message: '请输入确认密码', trigger: 'blur' }
        ],
        loginAccount: [
          { required: true, message: '请输入登录账号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ],
        tel: [
          { required: true, message: '请输入联系方式', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        country: [
          { required: true, message: '请选择国家', trigger: 'blur' }
        ],
        school: [
          { required: true, message: '请选择院校', trigger: 'blur' }
        ],
        major: [
          { required: true, message: '请选择专业', trigger: 'blur' }
        ],
        agree: [
          { required: true, message: '请选择职称', trigger: 'blur' }
        ],
        age: [
          { required: true, message: '年龄不能为空', trigger: 'blur' }
        ],
        birth: [
          { required: true, message: '请输入出生日期', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        workDate: [
          { required: true, message: '请输入教龄', trigger: 'blur' }
        ],
        flair: [
          { required: true, message: '请上传教学资质', trigger: 'blur' },
        ],
        remark: [
          { required: true, message: '请输入自我介绍', trigger: 'blur' }
        ],
      }
    }
  },
  components: {
    bottomPage
  },
  methods: {
    // 计算年龄方法
    calculateAge(birthDate) {
      if (!birthDate) {
        this.form.age = "";
        return;
      }

      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      // 如果生日还没过，年龄减1
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      this.form.age = age;
    },

    handleAvatorSuccess(res) {
      let _this = this;
      if(res.code == 1000){
        _this.$message({
          type: 'success',
          message: '上传成功!'
        });
        this.fileList.push({url:this.$store.state.HOST + res.message})
        this.form.flair = res.message
      }else{
        _this.$notify.error({
          title: '错误',
          message: res.message
        });
      }
    },

    handleRemove(file, fileList) {
      this.form.flair = ""
      this.fileList = []
    },

    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    getSchoolList() {
      getSchoolList().then(res=> {
        if(res.code == 1000) {
          this.school = res.data
        } else {
          this.$notify.error({
            title: '错误',
            message: res.message
          });
        }
      })
    },

    getMajorList() {
      getMajorList().then(res => {
        if(res.code == 1000) {
          this.major = res.data
        } else {
          this.$notify.error({
            title: '错误',
            message: res.message
          });
        }
      })
    },

    toRegister() {
      this.$router.push("/register")
    },

    toLogin() {
      this.$router.push("/login")
    },

    toRuZhu() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          if (this.form.passwordNew != this.form.password) {
            this.$message({
              message: '两次输入的密码不一致！',
              type: 'warning'
            });
            return;
          }
          if (this.fileList.length <= 0) {
            this.$message({
              message: '请上传教学资质！',
              type: 'warning'
            });
            return;
          }
          register(this.form).then(res => {
            if(res.code == 1000) {
              this.$message({
                message: '入驻成功,请等待平台审核',
                type: 'success'
              });
              var that = this
              setTimeout(function() {
                that.$router.push("/login")
              },500)
            } else {
              this.$message.error(res.message);
            }
          })
        } else {
          return false;
        }
      });
    }
  },
  watch: {
    // 监听生日字段变化
    'form.birth': {
      handler(newVal) {
        this.calculateAge(newVal);
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    // 初始化代码
  },
  mounted() {
    this.getSchoolList()
    this.getMajorList()
  }
}
</script>

<style scoped>
  .login {
	  position: relative;
	  width: 100%;
	  height: 100%;
	  background-color: #FCFCFC;
  }
  .login-top {
	  width: 100%;
	  height: 100px;
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  justify-content: space-between;
  }
  .logo {
	  width: 55%;
	  text-align: center;
	  height: 100%;
	  display: flex;
	  align-items: center;
  }
  .btns {
	  width: 45%;
	  display: flex;
	  background-color: #ffffff;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: flex-end;
  }
  .toReg {
	  width: 130px;
	  height: 40px;
	  border:1px solid #1F4E79;
	  font-family: '黑体';
	  cursor: pointer;
	  display: flex;
	  justify-content: center;
	  align-items: center;
    color:#1F4E79;
  }
  .toRegTeacher {
	  margin-left: 20px;
	  width: 130px;
	  height: 40px;
	  border:1px solid #1F4E79;
	  font-family: '黑体';
	  cursor: pointer;
	  display: flex;
	  justify-content: center;
	  align-items: center;
    color:#1F4E79;
  }
  .login-bottom {
	  width: 100%;
	  height: 250px;
	  background-color: #262543;
	  display: flex;
  }
  .login-content {
	  width: 55%;
	  height: 100%;
	  display: flex;
	  flex-direction: column;
  }
  .login-form {
	  position: relative;
	  display: flex;
	  justify-content: center;
	  width: 45%;
	  height: 100%;
	  background-color: #ffffff;
  }
  .title {
	  font-weight: '黑体';
	  font-size: 55px;
	  font-weight: bold;
  }
  .jiantou1 {
	  position: absolute;
	  left: 10px;
	  top: 20px;
  }
  .jiantou2 {
	  position: absolute;
	  left: 10px;
	  bottom: 100px;
  }
  .yuan {
	  position: absolute;
	  right: 10px;
	  bottom: 200px;
  }
  .form {
	  width: 50%;
	  height: 70%;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: space-around;
  }
  .login-title {
	  font-size: 50px;
	  font-weight: bold;
	  height: 40%;
	  display: flex;
	  align-items: center;

  }
  .login-btn {
	  width: 130px;
	  height: 40px;
	  border:1px solid #6427FF;
	  background-color: #6427FF;
	  color: #ffffff;
	  font-size: 18px;
	  font-family: '黑体';
	  cursor: pointer;
	  display: flex;
	  justify-content: center;
	  align-items: center;
  }
  .bottom-one {
	  width: 34%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: column;
  }
  .bottom-two {
	  width: 22%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: column;
  }
  .bottom-three {
	  width: 22%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: column;
  }
  .bottom-four {
	  width: 22%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: column;
  }
  .one-1 {
	  font-size: 40px;
	  font-weight: bold;
	  color: #ffffff;
  }
  .one-2 {
	  margin-top: 15px;
	  font-size: 18px;
	  color: #ffffff;
	  font-family: '黑体';
  }
  .two-2 {
	  margin-top: 15px;
	  font-size: 25px;
	  color: #ffffff;
	  font-weight: bold;
  }
  .two-3 {
	  margin-top: 15px;
	  font-size: 18px;
	  color: #ffffff;
	  font-family: '黑体';
  }
  .about {
	  width: 100%;
	  height: 400px;
    background-image: url('../../assets/image/index/index_back.png');
	  display: flex;
	  align-items: center;
	  justify-content: center;
  }
  .about-box {
    background-color: rgba(255, 255, 255, 0.2);      /* 半透明背景 */
    border: 1px solid rgba(255, 255, 255, 0.4);      /* 半透明白色边框 */
    border-radius: 12px;
    padding: 30px 40px;
    backdrop-filter: blur(6px);                     /* 毛玻璃模糊效果 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);      /* 阴影更立体 */
    color: #1F4E79;                         /* 深色字体更清晰 */
  }
  .huanying {
	  font-size: 50px;
	  color: #1F4E79;
	  font-weight: bold;
	  margin-bottom: 40px;
  }
  .huanying1 {
	  font-size: 20px;
	  color: #1F4E79;
	  font-family: '黑体';
  }
  .Rectangle {
	  position: absolute;
	  left: -10px;
	  top: 80%;
  }
  .teacherFrom {
	  width: 100%;
	  background-image: url('../../assets/image/index/index_back.png');
	  display: flex;
	  justify-content: center;
  }
  .ruzhu-content {
	  width: 60%;
  }
  .ruzhu-title {
	  text-align: center;
	  color: black;
	  margin-top: 140px;
	  margin-bottom: 50px;
	  font-size: 50px;
	  font-weight: bold;
    color:#6427FF;
  }
  .item-title {
	  font-family: '黑体';
	  font-size: 20px;
    color: #1F4E79;
  }
  .ruzhu {
	  display: flex;
	  justify-content: center;
	  margin-top: 80px;
  }
  .ruzhu-btn {
	  margin-bottom: 80px;
	  width: 130px;
	  height: 40px;
	  border:1px solid #6427FF;
	  background-color: #6427FF;
	  color: #ffffff;
	  font-size: 18px;
	  font-family: '黑体';
	  cursor: pointer;
	  display: flex;
	  justify-content: center;
	  align-items: center;
  }
</style>