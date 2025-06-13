<template>
  <BaseUpload
    title="Paper Management"
    upload-title="Upload Paper File"
    :icon="Document"
    card-class="paper-upload-card"
    upload-class="paper-upload"
    accept=".txt,.doc,.docx,.json"
    upload-hint="Support TXT, DOC, DOCX, JSON format"
    :status="status"
    :file-name="fileName"
    :display-text="displayText"
    :error="error"
    :disabled="false"
    @file-selected="$emit('file-selected', $event)"
    @remove="$emit('remove')"
    @preview="$emit('preview')"
  />
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
import BaseUpload from './BaseUpload.vue'

// Props - 完全来自父组件的状态
defineProps({
  status: { type: String, required: true },
  fileName: { type: String, required: true },
  displayText: { type: String, required: true },
  error: { type: String, default: '' },
})

// Emits - 只负责事件转发
defineEmits(['file-selected', 'remove', 'preview'])
</script>

<style scoped>
/* 试卷上传卡片样式 */
.paper-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 0px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.paper-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 卡片头部背景色 */
.paper-upload-card :deep(.card-header) {
  background: #e6d8c9;
}

/* 图标颜色 */
.paper-upload-card :deep(.section-icon) {
  color: #4f46e5;
}

/* 上传区域样式 */
.paper-upload-card :deep(.paper-upload .el-upload-dragger) {
  border: 2px dashed #c7d2fe;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  padding: 4px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-upload-card :deep(.paper-upload .el-upload-dragger:hover) {
  border-color: #4f46e5;
  background: #f3f4f6;
}

.paper-upload-card :deep(.upload-icon) {
  color: #4f46e5;
}
</style>