<template>
  <div class="feedback-panel">
    <!-- 标题区域 - 始终显示，内容根据状态切换 -->
    <div class="feedback-header">
      <div v-if="!selectedHighlight" class="header-title">
        <h3>给分理由</h3>
      </div>
      <div v-else class="header-tag">
        <span class="tag-label">标记类型：</span>
        <el-tag :type="getTagType(selectedHighlight.type)" size="small">
          {{ getTypeLabel(selectedHighlight.type) }}
        </el-tag>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="feedback-content">
      <!-- 给分理由区域 -->
      <div class="reason-area">
        <!-- 输入框模式 -->
        <el-input
          v-if="isEditing"
          v-model="editableReason"
          type="textarea"
          placeholder="请输入给分理由..."
          resize="none"
          class="reason-textarea"
        />
        
        <!-- 显示模式 -->
        <div v-else class="reason-display">
          <div class="reason-content-text">
            {{ displayReason }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button @click="modifyReason">
        修改
      </el-button>
      <el-button
        type="success"
        @click="saveReason"
        :disabled="!editableReason.trim()"
      >
        保存
      </el-button>
      <el-button
        type="primary"
        @click="submitReason"
        :disabled="!editableReason.trim()"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

interface HighlightData {
  text: string
  type: 'correct' | 'wrong' | 'unclear' | 'redundant'
  reason?: string
  aiReason?: string
}

interface Props {
  selectedHighlight?: HighlightData | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedHighlight: null
})

const emits = defineEmits<{
  (e: 'modifyReason', data: HighlightData): void
  (e: 'saveReason', data: { highlight: HighlightData, reason: string }): void
  (e: 'submitReason', data: { highlight: HighlightData, reason: string }): void
}>()

// 可编辑的理由文本
const editableReason = ref('')
// 是否处于编辑模式
const isEditing = ref(false)

// 显示的理由内容
const displayReason = computed(() => {
  if (props.selectedHighlight && editableReason.value) {
    return editableReason.value
  }
  return '选择左侧文本查看 AI 给分理由，或点击修改按钮手动输入...'
})

// 监听选中的高亮变化
watch(() => props.selectedHighlight, (newHighlight) => {
  editableReason.value = newHighlight?.aiReason || ''
  isEditing.value = false
}, { immediate: true })

// 类型映射
const TYPE_CONFIG = {
  correct: { tag: 'success', label: '正确' },
  wrong: { tag: 'danger', label: '错误' },
  unclear: { tag: 'warning', label: '模糊' },
  redundant: { tag: 'info', label: '冗余' }
} as const

// 获取标签类型
const getTagType = (type: string) => {
  return TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]?.tag || 'default'
}

// 获取类型标签
const getTypeLabel = (type: string) => {
  return TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]?.label || type
}

// 修改理由
const modifyReason = () => {
  isEditing.value = true
  if (props.selectedHighlight) {
    emits('modifyReason', props.selectedHighlight)
  }
  ElMessage.info('现在可以编辑理由内容')
}

// 保存理由
const saveReason = () => {
  if (!editableReason.value.trim()) {
    ElMessage.warning('请输入理由内容')
    return
  }
  
  isEditing.value = false
  
  if (props.selectedHighlight) {
    emits('saveReason', {
      highlight: props.selectedHighlight,
      reason: editableReason.value.trim()
    })
  }
  ElMessage.success('理由已保存')
}

// 提交理由
const submitReason = () => {
  if (!editableReason.value.trim()) {
    ElMessage.warning('请输入理由内容')
    return
  }
  if (props.selectedHighlight) {
    emits('submitReason', {
      highlight: props.selectedHighlight,
      reason: editableReason.value.trim()
    })
    ElMessage.success('理由已提交')
  }
}

defineExpose({
  setReason: (text: string) => {
    editableReason.value = text
  },
  clearReason: () => {
    editableReason.value = ''
  }
})
</script>

<style scoped>
.feedback-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* === 头部标题样式 === */
.feedback-header {
  padding: 16px 20px;
  background: #F5F5F5;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #E5E5E5;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  text-align: center;
}

.header-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  white-space: nowrap;
}

/* === 内容区域 === */
.feedback-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #FFFFFF;
}

/* === 给分理由区域 === */
.reason-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 理由显示模式 */
.reason-display {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reason-content-text {
  flex: 1;
  padding: 16px 0;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 输入框模式 */
.reason-textarea {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reason-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #E5E5E5;
  background: #FFFFFF;
  transition: all 0.2s ease;
  line-height: 1.6;
  flex: 1;
  resize: none;
  color: rgba(0, 0, 0, 0.87);
}

.reason-textarea :deep(.el-textarea__inner:focus) {
  border-color: #007AFF;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.reason-textarea :deep(.el-textarea__inner:hover) {
  border-color: #007AFF;
}

/* === 操作按钮 === */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #F5F5F5;

  border-radius: 0 0 12px 12px;
  border-top: 1px solid #E5E5E5;
}

.action-buttons .el-button {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-buttons .el-button--primary {
  background: #007AFF;
  border-color: #007AFF;
  color: #FFFFFF;
}

.action-buttons .el-button--primary:hover:not(.is-disabled) {
  background: #0056B3;
  border-color: #0056B3;
  transform: translateY(-1px);
}

.action-buttons .el-button--default {
  background: #E5E5E5;
  border-color: #E5E5E5;
  color: rgba(0, 0, 0, 0.6);
}

.action-buttons .el-button--default:hover {
  background: #D1D1D1;
  border-color: #D1D1D1;
  transform: translateY(-1px);
}

.action-buttons .el-button--success {
  background: #4CD964;
  border-color: #4CD964;
  color: #FFFFFF;
}

.action-buttons .el-button--success:hover:not(.is-disabled) {
  background: #3AC85A;
  border-color: #3AC85A;
  transform: translateY(-1px);
}

/* === 标签样式重写 === */
.feedback-panel :deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
}

.feedback-panel :deep(.el-tag--success) {
  background: rgba(76, 217, 100, 0.1);
  border-color: #4CD964;
  color: #4CD964;
}

.feedback-panel :deep(.el-tag--danger) {
  background: rgba(255, 59, 48, 0.1);
  border-color: #FF3B30;
  color: #FF3B30;
}

.feedback-panel :deep(.el-tag--warning) {
  background: rgba(255, 149, 0, 0.1);
  border-color: #FF9500;
  color: #FF9500;
}

.feedback-panel :deep(.el-tag--info) {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.3);
  color: rgba(0, 0, 0, 0.6);
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .feedback-header {
    padding: 12px 16px;
    margin: -12px -12px 0;
  }
  
  .header-title h3 {
    font-size: 14px;
  }
  
  .tag-label {
    font-size: 12px;
  }
  
  .feedback-content {
    padding: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    padding: 12px;
    margin: 0 -12px -12px;
    gap: 8px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    justify-content: center;
  }
}
</style>