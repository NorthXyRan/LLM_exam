<template>
  <BaseUpload
    title="Reference Answer"
    upload-title="Upload Answer File"
    :icon="DocumentChecked"
    card-class="answer-upload-card"
    upload-class="answer-upload"
    accept=".txt,.doc,.docx,.json"
    upload-hint="Support TXT, DOC, DOCX, JSON format"
    :status="status"
    :file-name="fileName"
    :display-text="displayText"
    :error="error"
    :disabled="disabled"
    @file-selected="$emit('file-selected', $event)"
    @remove="$emit('remove')"
    @preview="$emit('preview')"
  />
</template>

<script setup>
import { DocumentChecked } from '@element-plus/icons-vue'
import BaseUpload from './BaseUpload.vue'

// Props - 完全来自父组件的状态
defineProps({
  status: { type: String, required: true },
  fileName: { type: String, required: true },
  displayText: { type: String, required: true },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

// Emits - 只负责事件转发
defineEmits(['file-selected', 'remove', 'preview'])
</script>

<style scoped>
/* 答案上传卡片样式 */
.answer-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  border: 0px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.answer-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 卡片头部背景色 */
.answer-upload-card :deep(.card-header) {
  background: #D2E0AA;
}

/* 上传区域样式 */
.answer-upload-card :deep(.answer-upload .el-upload-dragger) {
  border: 2px dashed #a5f3fc;
  border-radius: 12px;
  background: #f0fdfa;
  transition: all 0.3s ease;
  padding: 4px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-upload-card :deep(.answer-upload .el-upload-dragger:hover) {
  border-color: #0891b2;
  background: #ecfdf5;
}

.answer-upload-card :deep(.upload-icon) {
  color: #0891b2;
}
</style>