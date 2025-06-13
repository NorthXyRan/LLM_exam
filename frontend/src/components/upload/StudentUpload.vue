<template>
  <BaseUpload
    title="Student Papers"
    upload-title="Upload Student Answers"
    :icon="User"
    card-class="student-upload-card"
    upload-class="student-upload"
    accept=".json"
    upload-hint="Support JSON format with all student answers"
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
import { User } from '@element-plus/icons-vue'
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
/* 学生答案上传卡片样式 */
.student-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 0px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.student-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 卡片头部背景色 */
.student-upload-card :deep(.card-header) {
  background: #ABD7FB;
}


/* 上传区域样式 */
.student-upload-card :deep(.student-upload .el-upload-dragger) {
  border: 2px dashed #c4b5fd;
  border-radius: 12px;
  background: #faf5ff;
  transition: all 0.3s ease;
  padding: 4px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-upload-card :deep(.student-upload .el-upload-dragger:hover) {
  border-color: #7c3aed;
  background: #f3f4f6;
}

.student-upload-card :deep(.upload-icon) {
  color: #7c3aed;
}
</style>