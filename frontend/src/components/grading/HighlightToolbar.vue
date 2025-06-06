<template>
  <div class="highlight-toolbar">
    <div class="tool-section">
      <div class="tool-group">
        <el-button 
          :type="highlightMode ? 'primary' : 'default'"
          :class="{ 'active': highlightMode }"
          @click="toggleHighlightMode"
        >
          <el-icon><Edit /></el-icon>
          highlight
        </el-button>
      </div>
      
      <el-divider direction="vertical" />
      
      <div class="tool-group">
        <el-button 
          type="success" 
          @click="() => handleMarkAnswer('correct')"
          :disabled="!hasSelectedText"
        >
          <el-icon><Check /></el-icon>
          correct
        </el-button>
        <el-button 
          type="danger" 
          @click="() => handleMarkAnswer('wrong')"
          :disabled="!hasSelectedText"
        >
          <el-icon><Close /></el-icon>
          wrong
        </el-button>
        <el-button 
          type="warning" 
          @click="() => handleMarkAnswer('unclear')"
          :disabled="!hasSelectedText"
        >
          <el-icon><QuestionFilled /></el-icon>
          unclear
        </el-button>
        <el-button 
          type="info" 
          @click="() => handleMarkAnswer('redundant')"
          :disabled="!hasSelectedText"
        >
          <el-icon><RemoveFilled /></el-icon>
          redundant
        </el-button>
      </div>
      
      <el-divider direction="vertical" />
      
      <div class="tool-group">
        <el-button 
          @click="handleEraseMarks"
          :disabled="!hasSelectedText"
          class="eraser-btn"
        >
          <el-icon><Delete /></el-icon>
          erase
        </el-button>
        <el-button 
          @click="handleClearAll"
          class="clear-btn"
        >
          <el-icon><Refresh /></el-icon>
          reset
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Close, Delete, Edit, QuestionFilled, Refresh, RemoveFilled } from '@element-plus/icons-vue';
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
  (e: 'eraseMarks'): void
  (e: 'clearAll'): void
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

// 橡皮功能 - 清除选中文本的标记
const handleEraseMarks = () => {
  emits('eraseMarks')
  ElMessage.info('已清除选中文本的标记')
}

// 清屏功能 - 一键清除所有标记
const handleClearAll = () => {
  emits('clearAll')
  ElMessage.warning('已清除所有标记')
}
</script>

<style scoped>
/* === 高亮工具栏内部样式 === */
.highlight-toolbar {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0 16px;
}

.tool-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: max-content;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.03);
}

/* WebKit浏览器（Chrome, Safari）滚动条样式 */
.tool-section::-webkit-scrollbar {
  height: 4px;
}

.tool-section::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 2px;
}

.tool-section::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.tool-section::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* === 按钮样式重写 === */
.highlight-toolbar :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px;
  white-space: nowrap;
  flex-shrink: 0;
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
  flex-shrink: 0;
}

/* === 按钮状态样式 === */
.active {
  background-color: #007AFF !important;
  border-color: #007AFF !important;
  color: white !important;
}

/* === 橡皮和清屏按钮样式 === */
.eraser-btn {
  background: #F0F0F0 !important;
  border-color: #D0D0D0 !important;
  color: #666 !important;
}

.eraser-btn:hover {
  background: #E0E0E0 !important;
  border-color: #C0C0C0 !important;
  color: #333 !important;
}

.clear-btn {
  background: #FFF3E0 !important;
  border-color: #FFB74D !important;
  color: #F57C00 !important;
}

.clear-btn:hover {
  background: #FFE0B2 !important;
  border-color: #FFA726 !important;
  color: #E65100 !important;
}

.highlight-toolbar :deep(.el-button:disabled) {
  opacity: 0.4;
  transform: none !important;
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .tool-section {
    gap: 8px;
    padding: 4px 6px;
  }
  
  .tool-group {
    gap: 6px;
  }
  
  .highlight-toolbar :deep(.el-button) {
    padding: 6px;
    font-size: 12px;
  }
  
  .highlight-toolbar :deep(.el-divider--vertical) {
    height: 20px;
    margin: 0 6px;
  }
}

@media (max-width: 480px) {
  .tool-section {
    gap: 6px;
    padding: 4px;
  }
  
  .tool-group {
    gap: 4px;
  }
  
  .highlight-toolbar :deep(.el-button) {
    padding: 4px 6px;
    font-size: 11px;
  }
  
  .highlight-toolbar :deep(.el-button .el-icon) {
    margin-right: 2px;
  }
  
  .highlight-toolbar :deep(.el-divider--vertical) {
    height: 18px;
    margin: 0 4px;
  }
}
</style>