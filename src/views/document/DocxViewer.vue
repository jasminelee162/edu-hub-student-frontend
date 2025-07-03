<template>
  <div>
    <quill-editor
        v-model="editorContent"
        :options="editorOptions"
        @text-change="onTextChange"
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
  props: ['content'],
  data() {
    return {
      editorContent: this.content,
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
      if (newVal !== this.editorContent) {
        this.editorContent = newVal
      }
    }
  },
  methods: {
    onTextChange(delta, oldDelta, source) {
      if (source === 'user') {
        this.$emit('update:content', this.editorContent)
        this.$emit('text-change', this.editorContent)
      }
    }
  }
}
</script>