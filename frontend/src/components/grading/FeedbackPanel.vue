<template>
  <div class="feedback-panel">
    <!-- 标题区域 - 只在无选中文本时显示 -->
    <div class="feedback-header" v-if="!selectedHighlight">
      <h3>给分理由</h3>
    </div>
    
    <!-- 内容区域 -->
    <div class="feedback-content">
      <!-- 选中文本显示 -->
      <div class="selected-text-display" v-if="selectedHighlight">
        <div class="highlight-type">
          <span class="label">标记类型：</span>
          <el-tag :type="getTagType(selectedHighlight.type)" size="small">
            {{ getTypeLabel(selectedHighlight.type) }}
          </el-tag>
        </div>
      </div>
      
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
import { ref, watch, computed } from 'vue'

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
  padding: 20px 24px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: -20px -20px 0;
  border-radius: 24px 24px 0 0;
}

.feedback-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-align: center;
}

/* === 内容区域 === */
.feedback-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
}

/* 当有选中文本时（header消失），减少上边距 */
.feedback-panel:has(.selected-text-display) .feedback-content {
  padding-top: 0;
}

/* === 选中文本显示区域 === */
.selected-text-display {
  padding: 6px 0 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.highlight-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
  min-width: 70px;
  white-space: nowrap;
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
  color: #333;
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
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  line-height: 1.6;
  flex: 1;
  resize: none;
}

.reason-textarea :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* === 操作按钮 === */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  margin: 0 -20px -20px;
  border-radius: 0 0 24px 24px;
}

.action-buttons .el-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-buttons .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-buttons .el-button--primary:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.action-buttons .el-button--default {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.action-buttons .el-button--default:hover {
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-buttons .el-button--success {
  background: #10b981;
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-buttons .el-button--success:hover:not(.is-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .feedback-header {
    padding: 16px 20px 12px;
    margin: -15px -15px 0;
  }
  
  .feedback-header h3 {
    font-size: 18px;
  }
  
  .feedback-content {
    padding: 15px;
    gap: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    padding: 15px;
    margin: 0 -15px -15px;
  }
  
  .label {
    min-width: 60px;
    font-size: 11px;
  }
}
</style>