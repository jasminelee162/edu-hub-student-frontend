<template>
  <div class="pdf-wrapper">
    <iframe
        :src="pdfSrc"
        class="pdf-frame"
    ></iframe>
  </div>
</template>

<script>
export default {
  props: ['content'],
  computed: {
    pdfSrc() {
      return `data:application/pdf;base64,${this.content}`
    }
  }
}
</script>

<style scoped>
.pdf-wrapper {
  width: 100%;
  height: 90vh;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}
</style>