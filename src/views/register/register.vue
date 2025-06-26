<template>
  <div class="login">
	<div class="login-top">
		<div class="logo">
			<img style="width:100px;padding-left:100px" src="../../assets/image/logo.png">
		</div>
		<div class="btns">
			<div style="padding-right:100px;display:flex">
				<div class="toReg" @click="toLogin">
					<div>登陆</div>
				</div>
				<div class="toRegTeacher" @click="toTeacherRegister">
					<div>教师入驻</div>
				</div>
			</div>
		</div>
	</div>
	<div class="login-center">
		<div class="login-content">
			<div style="padding-left: 100px;">
				<div class="title">
					<div>STUDY FROM</div>
					<div>HOME WITH EXPERT</div>
				</div>
				<div style="color:#181818;font-family:'黑体'">在线学习教育平台，一个在家就能学习的平台</div>
				<div style="margin-top:20px;color:#181818;font-family:'黑体'">
					<div>| 我们都得经历一段努力闭嘴不抱怨的时光，</div>
					<div>| 才能熠熠生辉，才能去更酷的地方，成为更酷的人。</div>
				</div>
				<div style="margin-top:20px;color:#181818;font-family:'黑体'">
					<div>| 最好的生活状态：一个人时，安静而丰盛</div>
					<div>| ；两个人是，温暖而踏实。</div>
				</div>
				<div style="margin-top:30px;display:flex;justify-content: space-between">
					<img style="width:20%" src="../../assets/image/login_image.png">
					<img style="width:25%;padding-right:30px" src="../../assets/image/login-jiantou.png">
				</div>
			</div>
		</div>
		<div class="login-form">
			<div class="jiantou1">
				<img src="../../assets/image/jiantou1.png">
			</div>
			<div class="jiantou2">
				<img src="../../assets/image/jiantou2.png">
			</div>
			<div class="yuan">
				<img src="../../assets/image/yuan.png">
			</div>
			<div class="form">
				<div class="login-title">在线学习教育平台</div>
				<div style="width:100%">
					<el-form style="width:100%" :model="userInfo" :rules="rules" ref="ruleForm" class="demo-ruleForm">
						<el-form-item  prop="userName">
							<el-input v-model="userInfo.userName" placeholder="请输入用户名"></el-input>
						</el-form-item>
						<el-form-item  prop="userName">
							<el-input v-model="userInfo.loginAccount" placeholder="请输入用户账号"></el-input>
						</el-form-item>
						<el-form-item  prop="password">
							<el-input type="password" v-model="userInfo.password" placeholder="请输入用户密码"></el-input>
						</el-form-item>
                        <el-form-item  prop="passwordNew">
							<el-input type="password" v-model="userInfo.passwordNew" placeholder="请输入确认密码"></el-input>
						</el-form-item>
					</el-form>
				</div>
				<div class="login-btn" @click="toRegister()">
					<div>注 册</div>
				</div>
			</div>
		</div>
	</div>
	<bottomPage></bottomPage>
  </div>
</template>

<script>
  import {register} from '../../api/api'
  import bottomPage from "../../components/bottom/login-bottom"
  export default {
	data() {
	  return{
		userInfo: {
			userName: "",
			password: "",
			passwordNew: "",
			loginAccount: "",
			userType: 2
		},
		rules: {
          userName: [
            { required: true, message: '请输入名', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入用户密码', trigger: 'blur' }
		  ],
		  passwordNew: [
            { required: true, message: '请输入确认密码', trigger: 'blur' }
		  ],
		  loginAccount: [
            { required: true, message: '请输入用户账号', trigger: 'blur' }
		  ],
        }
	  }
	},
	components: {
        bottomPage
	},
	methods: {
		toLogin() {
			this.$router.push("/login")
		},
		toTeacherRegister() {
			this.$router.push("/teacherRegister")
		},
		toRegister() {
			this.$refs["ruleForm"].validate((valid) => {
				if (valid) {
					if (this.userInfo.password != this.userInfo.passwordNew) {
						this.$message({
							message: '两次输入的密码不一致！',
							type: 'warning'
						});
						return;
					}
					register(this.userInfo).then(res => {
						if(res.code == 1000) {
							this.$message({
								message: '注册成功',
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
	created() {

	},
	mounted() {

	}
 }
</script>

<style scoped>
  .login {
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
	  border:1px solid #474747;
	  font-family: '黑体';
	  cursor: pointer;
	  display: flex;
	  justify-content: center;
	  align-items: center;
  }
  .toRegTeacher {
	  margin-left: 20px;
	  width: 130px;
	  height: 40px;
	  border:1px solid #474747;
	  font-family: '黑体';
	  cursor: pointer;
	  display: flex;
	  justify-content: center;
	  align-items: center;
  }
  .login-center {
	  width: 100%;
	  height: 75%;
	  display: flex;
	  flex-direction: row;
	  background-image: url('../../assets/image/index/index_back.png');
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
	  background-image: url('../../assets/image/index/index_back.png');
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
	  height: 83%;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: space-around;
  }
  .login-title {
	  font-size: 45px;
	  font-weight: bold;
	  height: 30%;
	  display: flex;
	  align-items: center;
  }
  .login-btn {
	  width: 130px;
	  height: 40px;
	  border:1px solid #FF5202;
	  background-color: #FF5202;
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
  .vertify {
      display: flex;
      align-items: center;
  }
</style>
