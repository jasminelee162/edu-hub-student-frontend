<template>
  <div class="login">
	<div class="login-top">
		<div class="logo">
			<img style="width:200px;padding-left:100px" src="../../assets/image/logo.png">
		</div>
		<div class="btns">
			<div style="padding-right:100px;display:flex">
				<div class="toReg" @click="toRegister">
					<div>注册</div>
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
					<div>STUDY ANYWHERE </div>
					<div>WITH AI-POWERED LEARNING</div>
				</div>
				<div style=" color: #1F4E79;font-family:'黑体'">智能化在线教学平台，沉浸式学习体验</div>
				<div style="margin-top:20px; color: #1F4E79;font-family:'黑体'">
					<div>| 在虚拟实验室探索知识的边界，</div>
					<div>| 让AI为你规划高效的学习路径。</div>
				</div>
				<div style="margin-top:20px; color: #1F4E79;font-family:'黑体'">
					<div>| 最好的成长状态：独自学习时，专注而充实；</div>
					<div>| 协作实验时，默契而高效。</div>

				</div>

        <div style="margin-top:20px;color:#6427FF;font-family:'黑体'">
        <div>—— 让科技赋能每一份求知欲 ——</div>
        <div>Where Innovation Meets Education</div>
        </div>

				<div style="margin-top:30px;display:flex;justify-content: space-between">


				</div>
			</div>
		</div>
		<div class="login-form">
			<div class="jiantou1">

			</div>
			<div class="jiantou2">

			</div>
			<div class="yuan">

			</div>
      <div class="form">
        <div class="login-title">在线学习教育平台</div>

        <!-- 登录方式切换 -->
        <div class="login-type-switch">
          <span
              :class="['login-type-option', loginType === 'account' ? 'active' : '']"
              @click="loginType = 'account'"
          >
            账号密码登录
          </span>
                  <span
                      :class="['login-type-option', loginType === 'email' ? 'active' : '']"
                      @click="loginType = 'email'"
                  >
            邮箱验证码登录
          </span>
        </div>

        <!-- 账号密码登录表单 -->
        <el-form v-if="loginType === 'account'" :model="userInfo" :rules="rules" ref="ruleForm" class="demo-ruleForm" style="width: 100%;">
          <el-form-item prop="username">
            <el-input v-model="userInfo.username" placeholder="请输入用户账号" @keyup.enter.native="toLogin"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="userInfo.password" placeholder="请输入用户密码 " @keyup.enter.native="toLogin"></el-input>
          </el-form-item>
          <div class="login-btn" @click="toLogin()"><div>登 录</div></div>
        </el-form>

        <!-- 邮箱验证码登录表单 -->
        <el-form v-else :model="emailInfo" ref="emailForm" style="width: 100%;">
          <el-form-item>
            <el-input v-model="emailInfo.email" placeholder="请输入邮箱" @keyup.enter.native="toEmailLogin"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="emailInfo.code" placeholder="请输入验证码" @keyup.enter.native="toEmailLogin" style="width: 60%; margin-right: 8px;" />
            <el-button :disabled="isSending" @click="sendCode">
              {{ isSending ? countdown + 's 后重发' : '获取验证码' }}
            </el-button>
          </el-form-item>
          <div class="login-btn" @click="toEmailLogin"><div>登 录</div></div>
        </el-form>
      </div>
		</div>
	</div>
  </div>
</template>

<script>
  import {login,getUser,sendEmailCode, loginWithEmail} from '../../api/api'
  import bottomPage from "../../components/bottom/login-bottom"

  export default {
	data() {
	  return{
		userInfo: {
			username: "",
			password: "",

		},
      loginType: 'account', // 切换登录方式

      emailInfo: {
        email: '',
        code: ''
      },
      isSending: false,
      countdown: 60,
      timer: null,
		rules: {
          username: [
            { required: true, message: '请输入用户账号', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入用户密码', trigger: 'blur' }
          ],
        }
	  }
	},
	components: {
        bottomPage
	},
	methods: {
    sendCode() {
      if (!this.emailInfo.email) {
        this.$message.warning('请输入邮箱')
        return
      }
      this.countdown = 60
      this.isSending = true
      sendEmailCode(this.emailInfo.email).then(() => {
        this.$message.success('验证码发送成功')


        this.timer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(this.timer)
            this.isSending = false
          }
        }, 1000)
      }).catch(() => {
        this.$message.error('验证码发送失败')
      })
    },

    toEmailLogin() {
      const { email, code } = this.emailInfo
      if (!email || !code) {
        this.$message.warning('请填写邮箱和验证码')
        return
      }

      loginWithEmail(email, code).then(res => {
        if (res.code === 1000) {
          this.$message.success('登录成功')
          const token = res.data.token

          // 1. 设置 token
          localStorage.setItem('user_token', token)

          // 2. 获取用户信息
          this.getUserInfo().then(() => {
            // 3. 跳转
            this.$router.push('/')
          })

        } else {
          this.$message.error(res.message)
        }
      }).catch(() => {
        this.$message.error('登录失败')
      })
    },
		toRegister() {
			this.$router.push("/register")
		},
		toTeacherRegister() {
			this.$router.push("/teacherRegister")
		},
		toLogin() {
			this.$refs["ruleForm"].validate((valid) => {
				if (valid) {
					var params = {
						username: this.userInfo.username,
						password: this.userInfo.password
					}
					login(params).then(res => {
						if(res.code == 1000) {
							this.$message({
								message: '登录成功',
								type: 'success'
							});
							var that = this
							var token = res.data.token

              window.localStorage.setItem("user_token",token)
							this.getUserInfo()
							setTimeout(function() {
								that.$router.push("/")
							},500)
						} else {
							this.$message.error(res.message);
						}
					})
				} else {
					return false;
				}
			});
		},
    getUserInfo() {
      return getUser().then(res => {
        if (res.code === 1000) {
          const userData = res.data
          this.$store.commit('SET_USER', userData)
          localStorage.setItem("user_info", JSON.stringify(res.data))
        }
      })
    }
	},
	created() {

	},
	mounted() {

	}
 }

</script>

<style scoped>
  .login-type-switch {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 16px;
    font-family: '黑体', sans-serif;
  }

  .login-type-option {
    padding: 8px 20px;
    border: 1px solid #6427FF;
    color: #1F4E79;
    border-radius: 20px;
    margin: 0 8px;
    cursor: pointer;
    font-size: 14px;
    background-color: #F3EEFF;
    transition: all 0.3s ease;
  }

  .login-type-option:hover {
    background-color: #F3EEFF;
    color: #123B5C;
  }

  .login-type-option.active {
    background-color: #6427FF;
    color: #fff;
    border-color: #6427FF;
    font-weight: bold;
  }
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
	  width: 30%;
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
  .login-center {
    background-image: url('../../assets/image/index/index_back.png');
	  width: 100%;
	  height: 75%;
	  display: flex;
	  flex-direction: row;
		padding-top: 130px;
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

  }
  .title {
	  font-size: 55px;
	  font-weight: bold;
    color: #1F4E79;
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
	  font-size: 40px;
	  font-weight: bold;
	  height: 40%;
	  display: flex;
	  align-items: center;
    color:#6427FF;
  }
  .login-btn {
    width: 130px;
    height: 40px;
    border: 1px solid #6427FF;
    background-color: #6427FF;
    color: #ffffff;
    font-size: 18px;
    font-family: '黑体';
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    /* 添加这行让按钮居中 */
    margin: 0 auto;
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
	  width: 25%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: column;
  }
  .bottom-three {
	  width: 25%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: column;
  }
  .bottom-four {
	  width: 25%;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  flex-direction: column;
  }
  .one-1 {
	  font-size: 20px;
	  font-weight: bold;
	  color: #ffffff;
  }
  .one-2 {
	  margin-top: 15px;
	  font-size: 15px;
	  color: #ffffff;
	  font-family: '黑体';
  }
  .two-2 {
	  margin-top: 15px;
	  font-size: 20px;
	  color: #ffffff;
	  font-weight: bold;
  }
  .two-3 {
	  margin-top: 15px;
	  font-size: 15px;
	  color: #ffffff;
	  font-family: '黑体';
  }


</style>
