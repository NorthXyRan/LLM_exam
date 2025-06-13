<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="80%"
    top="5vh"
    :before-close="handleClose"
    class="preview-dialog"
  >
    <div class="preview-content">
      <el-scrollbar height="60vh">
        <pre class="content-display">{{ content }}</pre>
      </el-scrollbar>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="copyContent">
          <el-icon><CopyDocument /></el-icon>
          复制内容
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '文件预览' },
  content: { type: String, default: '' },
})

const emit = defineEmits(['update:visible'])

// 双向绑定 visible
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 复制内容到剪贴板
const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动选择复制')
  }
}
</script>

<style scoped>
.preview-dialog {
  --el-dialog-border-radius: 16px;
}

.preview-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.preview-content {
  padding: 0;
}

.content-display {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  background: #f8fafc;
  padding: 20px;
  margin: 0;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0 0 0;
}

.dialog-footer .el-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .content-display {
    font-size: 12px;
    padding: 16px;
  }
}
</style>