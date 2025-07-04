<template>
  <div>
    <quill-editor
        ref="editor"
        v-model="localContent"
        :options="editorOptions"
        @change="onEditorChange"
        style="height: 600px; background: #fff; border-radius: 6px;"
    />
  </div>
</template>

<script>
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
  components: { quillEditor },
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      localContent: this.content,
      editorOptions: {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
            ['link', 'image']
          ]
        }
      }
    }
  },
  watch: {
    content(newVal) {
      // 只有当外部传入的内容与当前内容不同时才更新
      if (newVal !== this.localContent) {
        this.localContent = newVal
      }
    }
  },
  methods: {
    onEditorChange() {
      // 只发射text-change事件，携带当前内容
      this.$emit('text-change', this.localContent)
    }
  }
}
</script>