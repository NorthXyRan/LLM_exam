<template>
  <div class="feedback-panel">
    <div class="feedback-header">
      <h4>智能反馈面板</h4>
    </div>

    <div class="feedback-content">
      <!-- 选中文本显示 -->
      <div class="selected-text-display" v-if="selectedHighlight">
        <div class="text-preview">
          <span class="label">选中文本：</span>
          <span class="text">{{ selectedHighlight.text }}</span>
        </div>
        <div class="highlight-type">
          <span class="label">标记类型：</span>
          <el-tag :type="getTagType(selectedHighlight.type)" size="small">
            {{ getTypeLabel(selectedHighlight.type) }}
          </el-tag>
        </div>
      </div>

      <!-- AI 给分理由显示和编辑 -->
      <div class="ai-reason-display">
        <div class="reason-header">
          <el-icon><Setting /></el-icon>
          <span>给分理由</span>
        </div>
        <div class="reason-content">
          <el-input
            v-model="editableReason"
            type="textarea"
            :rows="8"
            placeholder="选择左侧文本查看 AI 给分理由，或手动输入理由..."
            resize="none"
            class="reason-textarea"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="medium"
          @click="modifyReason"
          :disabled="!selectedHighlight"
        >
          <el-icon><Edit /></el-icon>
          修改
        </el-button>
        <el-button 
          type="success" 
          size="medium"
          @click="saveReason"
          :disabled="!editableReason.trim()"
        >
          <el-icon><Check /></el-icon>
          保存
        </el-button>
        <el-button 
          type="warning" 
          size="medium"
          @click="submitReason"
          :disabled="!editableReason.trim()"
        >
          <el-icon><Upload /></el-icon>
          提交
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Edit, Setting, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'

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

// 监听选中的高亮变化
watch(() => props.selectedHighlight, (newHighlight) => {
  if (newHighlight?.aiReason) {
    editableReason.value = newHighlight.aiReason
  } else {
    editableReason.value = ''
  }
}, { immediate: true })

// 获取标签类型
const getTagType = (type: string) => {
  const typeMap = {
    correct: 'success',
    wrong: 'danger',
    unclear: 'warning',
    redundant: 'info'
  }
  return typeMap[type as keyof typeof typeMap] || 'default'
}

// 获取类型标签
const getTypeLabel = (type: string) => {
  const labelMap = {
    correct: '正确',
    wrong: '错误',
    unclear: '模糊',
    redundant: '冗余'
  }
  return labelMap[type as keyof typeof labelMap] || type
}

// 修改理由
const modifyReason = () => {
  if (props.selectedHighlight) {
    emits('modifyReason', props.selectedHighlight)
    ElMessage.info('可以在文本框中修改理由')
  }
}

// 保存理由
const saveReason = () => {
  if (!editableReason.value.trim()) {
    ElMessage.warning('请输入理由内容')
    return
  }
  
  if (props.selectedHighlight) {
    emits('saveReason', {
      highlight: props.selectedHighlight,
      reason: editableReason.value.trim()
    })
    ElMessage.success('理由已保存')
  }
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

// 暴露方法给父组件
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
/* === 反馈面板主容器 === */
.feedback-panel {
  flex: 0 0 30%;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 20px;    /* 添加内边距  */
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 460px;
}

/* === 头部样式 === */
.feedback-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.feedback-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* === 内容区域 === */
.feedback-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* === 选中文本显示区域 === */
.selected-text-display {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.text-preview, 
.highlight-type {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.text-preview:last-child, 
.highlight-type:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  min-width: 70px;
}

.text {
  font-size: 13px;
  color: #333;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 2px;
  flex: 1;
}

/* === AI理由显示区域 === */
.ai-reason-display {
  flex: 1;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.reason-content {
  flex: 1;
  padding: 12px;
}

.reason-textarea {
  height: 100%;
}

.reason-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  border: none;
  padding: 0;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
}

/* === 操作按钮 === */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style> 