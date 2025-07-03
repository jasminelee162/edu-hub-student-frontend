<template>
  <div class="docx-content" v-html="content"></div>
</template>

<script>
export default {
  props: ['content']
}
</script>

<style scoped>
.docx-content {
  line-height: 1.6;
  font-size: 16px;
  color: #333;
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
}
</style>