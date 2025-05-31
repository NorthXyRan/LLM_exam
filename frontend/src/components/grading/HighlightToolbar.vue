<template>
  <div class="highlight-toolbar">
    <div class="tool-section">
      <div class="tool-group">
        <el-button 
          :type="highlightMode ? 'primary' : 'default'"
          :class="{ 'active': highlightMode }"
          @click="toggleHighlightMode"
          size="medium"
        >
          <el-icon><Edit /></el-icon>
          高亮笔
        </el-button>
      </div>
      
      <el-divider direction="vertical" />
      
      <div class="tool-group">
        <el-button 
          type="success" 
          size="medium"
          @click="() => handleMarkAnswer('correct')"
          :disabled="!hasSelectedText"
        >
          <el-icon><Check /></el-icon>
          正确
        </el-button>
        <el-button 
          type="danger" 
          size="medium"
          @click="() => handleMarkAnswer('wrong')"
          :disabled="!hasSelectedText"
        >
          <el-icon><Close /></el-icon>
          错误
        </el-button>
        <el-button 
          type="warning" 
          size="medium"
          @click="() => handleMarkAnswer('unclear')"
          :disabled="!hasSelectedText"
        >
          <el-icon><QuestionFilled /></el-icon>
          模糊
        </el-button>
        <el-button 
          type="info" 
          size="medium"
          @click="() => handleMarkAnswer('redundant')"
          :disabled="!hasSelectedText"
        >
          <el-icon><RemoveFilled /></el-icon>
          冗余
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Close, Edit, QuestionFilled, RemoveFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

interface Props {
  hasSelectedText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasSelectedText: false
})

const emits = defineEmits<{
  (e: 'highlightModeChange', mode: boolean): void
  (e: 'markAnswer', type: 'correct' | 'wrong' | 'unclear' | 'redundant'): void
}>()

// 高亮模式状态
const highlightMode = ref(false)

// 切换高亮模式
const toggleHighlightMode = () => {
  highlightMode.value = !highlightMode.value
  emits('highlightModeChange', highlightMode.value)
  
  if (highlightMode.value) {
    ElMessage.info('高亮模式已开启，选中文本进行标记')
  } else {
    ElMessage.info('高亮模式已关闭')
  }
}

// 标记答案
const handleMarkAnswer = (type: 'correct' | 'wrong' | 'unclear' | 'redundant') => {
  emits('markAnswer', type)
}
</script>

<style scoped>
/* === 高亮工具栏内部样式 === */
.highlight-toolbar {
  padding: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.tool-section {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
  width: 100%;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* === 按钮样式重写 === */
.highlight-toolbar :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 6px 12px;
}

.highlight-toolbar :deep(.el-button--primary) {
  background: #007AFF;
  border-color: #007AFF;
}

.highlight-toolbar :deep(.el-button--primary:hover) {
  background: #0056B3;
  border-color: #0056B3;
  transform: translateY(-1px);
}

.highlight-toolbar :deep(.el-button--success) {
  background: #4CD964;
  border-color: #4CD964;
}

.highlight-toolbar :deep(.el-button--success:hover) {
  background: #3AC85A;
  border-color: #3AC85A;
  transform: translateY(-1px);
}

.highlight-toolbar :deep(.el-button--danger) {
  background: #FF3B30;
  border-color: #FF3B30;
}

.highlight-toolbar :deep(.el-button--danger:hover) {
  background: #E6342A;
  border-color: #E6342A;
  transform: translateY(-1px);
}

.highlight-toolbar :deep(.el-button--warning) {
  background: #FF9500;
  border-color: #FF9500;
}

.highlight-toolbar :deep(.el-button--warning:hover) {
  background: #E6850E;
  border-color: #E6850E;
  transform: translateY(-1px);
}

.highlight-toolbar :deep(.el-button--info) {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.3);
  color: rgba(0, 0, 0, 0.6);
}

.highlight-toolbar :deep(.el-button--info:hover) {
  background: rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
}

.highlight-toolbar :deep(.el-button--default) {
  background: #E5E5E5;
  border-color: #E5E5E5;
  color: rgba(0, 0, 0, 0.6);
}

.highlight-toolbar :deep(.el-button--default:hover) {
  background: #D1D1D1;
  border-color: #D1D1D1;
  transform: translateY(-1px);
}

/* === 分割线样式 === */
.highlight-toolbar :deep(.el-divider--vertical) {
  border-color: #E5E5E5;
  height: 24px;
  margin: 0 8px;
}

/* === 按钮状态样式 === */
.active {
  background-color: #007AFF !important;
  border-color: #007AFF !important;
  color: white !important;
}

.highlight-toolbar :deep(.el-button:disabled) {
  opacity: 0.4;
  transform: none !important;
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .tool-section {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .tool-group {
    gap: 6px;
  }
  
  .highlight-toolbar :deep(.el-button) {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .highlight-toolbar :deep(.el-divider--vertical) {
    height: 20px;
    margin: 0 6px;
  }
}
</style> 