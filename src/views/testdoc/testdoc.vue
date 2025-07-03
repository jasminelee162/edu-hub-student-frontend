<template>
  <div>
    <el-upload
        :http-request="uploadFile"
        :auto-upload="true"
        :show-file-list="true"
    >
      <el-button type="primary">上传文件</el-button>
    </el-upload>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  methods: {
    uploadFile(param) {
      const formData = new FormData()
      formData.append('file', param.file)  // 关键字段必须是 'file'

      axios.post('http://localhost:8080/template/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => {
        console.log('返回结果', res)
      }).catch(err => {
        console.error('上传失败', err)
      })
    }
  }
}
</script>