<template>
  <el-dialog
    v-model="dialogVisible"
    :title="previewTitle"
    width="70%"
    :before-close="handleClose"
    class="upload-preview-dialog"
  >
    <div class="preview-content">
      <div class="preview-header">
        <div class="file-info">
          <el-icon class="file-icon"><document /></el-icon>
          <span class="file-name">{{ fileName }}</span>
          <el-tag :type="getTagType()" size="small">{{ dataType }}</el-tag>
        </div>
        <el-button size="small" @click="copyToClipboard" :icon="CopyDocument"> 复制JSON </el-button>
      </div>

      <div class="json-container">
        <pre class="json-content">{{ formattedJson }}</pre>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { CopyDocument, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

// =============================================================================
// Props & Emits
// =============================================================================
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  fileName: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  dataType: {
    type: String,
    default: '', // 'paper', 'answer', 'student'
  },
})

const emit = defineEmits(['update:visible'])

// =============================================================================
// 响应式状态
// =============================================================================
const dialogVisible = ref(false)

// =============================================================================
// 计算属性
// =============================================================================
const previewTitle = computed(() => {
  const titleMap = {
    paper: '试卷预览',
    answer: '参考答案预览',
    student: '学生答案预览',
  }
  return titleMap[props.dataType] || 'JSON预览'
})

const formattedJson = computed(() => {
  if (!props.content) return '暂无数据'

  try {
    const jsonObj = JSON.parse(props.content)
    return JSON.stringify(jsonObj, null, 2)
  } catch (error) {
    return props.content // 如果不是有效JSON，显示原始内容
  }
})

// =============================================================================
// 方法
// =============================================================================
const getTagType = () => {
  const typeMap = {
    paper: 'primary',
    answer: 'success',
    student: 'warning',
  }
  return typeMap[props.dataType] || 'info'
}

const handleClose = () => {
  emit('update:visible', false)
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动选择复制')
  }
}

// =============================================================================
// 监听器
// =============================================================================
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
  },
  { immediate: true },
)

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})
</script>

<style scoped>
.upload-preview-dialog {
  --el-dialog-border-radius: 12px;
}

.upload-preview-dialog :deep(.el-dialog__body) {
  padding: 16px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #409eff;
  font-size: 16px;
}

.file-name {
  font-weight: 600;
  color: #303133;
}

.json-container {
  flex: 1;
  overflow: auto;
  max-height: 50vh;
}

.json-content {
  margin: 0;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #2c3e50;
  overflow-x: auto;
  white-space: pre;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-preview-dialog {
    --el-dialog-width: 95%;
  }

  .preview-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .json-content {
    font-size: 11px;
  }
}
</style>
