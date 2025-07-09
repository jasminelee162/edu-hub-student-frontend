<template>
  <div class="bottom">
          <div class="bottom-one">
              <div style="width:50%">
                <div style="color:#FFC27A;font-size:25px;font-weight:bold">
                  <span style="color:#6427FF">在线学习教育平台</span>
                </div>
                <div style="margin-top:10px;font-weight:bold">关于我们</div>

                <div style="color:#6D737A;margin-top:10px">Email:csu@csu.edu.cn</div>

              </div>
          </div>
          <div class="bottom-two">
              <div style="font-weight:bold">菜单</div>
              <div style="font-weight:bold">Menu</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:30px" @click="toPage(0)">主页</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(1)">课程</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(2)">教师</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(3)">考试</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(4)">笔记</div>
          </div>
          <div class="bottom-three">
              <div style="font-weight:bold">菜单</div>
              <div style="font-weight:bold">Menu</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:30px" @click="toPage(5)">公告</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(6)">留言</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(7)">关于</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(8)">个人中心</div>
              <div style="cursor: pointer;color:#6D737A;margin-top:15px" @click="toPage(9)">错题集</div>
          </div>
          <div class="bottom-four">
              <div style="width:50%">
                <div style="font-size:15px;font-weight:bold">
                  联系方式
                </div>
                <div style="font-size:15px;font-weight:bold">
                  contact information
                </div>
                <div style="color:#6D737A;margin-top:10px">邮箱: csu@csu.edu.cn</div>
                <div style="color:#6D737A;margin-top:10px">QQ: csu</div>
                <div style="color:#6D737A;margin-top:10px">微信: csu</div>
                <div style="color:#6D737A;margin-top:10px">微博: csu@csu.edu.cn</div>
                <div style="color:#6D737A;margin-top:10px">电话: 12345678998</div>
              </div>
          </div>
      </div>
</template>

<script>

  export default {
    data() {
      return{

      }
    },
    methods: {
        toPage(index) {
          if (index == 0) {
            this.$router.push("/")
          } else if (index == 1) {
            this.$router.push("/task")
          } else if (index == 2) {
            this.$router.push("/teacher")
          } else if (index == 3) {
            this.$router.push("/test")
          } else if (index == 4) {
            this.$router.push("/article")
          } else if (index == 5) {
            this.$router.push("/notice")
          } else if (index == 6) {
            this.$router.push("/message")
          } else if (index == 7) {
            this.$router.push("/about")
          } else if (index == 8) {
            this.$router.push("/center")
          } else if (index == 9) {
            this.$router.push("/myWrongAssign")
          }
        }
    },
    created() {

    },
    mounted() {

    }
 }
</script>

<style  scoped>
  .bottom {
    width: 100%;
    height: 45%;
    background-image: url('../../assets/image/index/index_back.png');
    display: flex;
}
.bottom-one,.bottom-four {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 30%;
    height: 100%;
    font-family: '黑体';
    font-size: 14px;
}
.bottom-two,.bottom-three {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 20%;
    height: 100%;
    font-family: '黑体';
    font-size: 14px;
}
</style>
