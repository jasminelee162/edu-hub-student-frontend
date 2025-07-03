<template>
  <pre class="text-content">{{ content }}</pre>
</template>

<script>
export default {
  props: ['content']
}
</script>

<style scoped>
.text-content {
  white-space: pre-wrap;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
  font-size: 15px;
  font-family: 'Courier New', Courier, monospace;
  color: #444;
}
</style>