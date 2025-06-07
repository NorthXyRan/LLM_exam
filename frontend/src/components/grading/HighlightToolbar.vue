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
import { ref, watch, onMounted, onUnmounted } from 'vue';

// Props 接口 - 现在不需要 hasSelectedText，会从 PaperPreview 获取
interface Props {
  paperPreviewRef?: any  // PaperPreview 组件的引用
}

const props = defineProps<Props>()

// 简化的事件定义 - 只保留必要的
const emits = defineEmits<{
  (e: 'markAnswer', type: 'correct' | 'wrong' | 'unclear' | 'redundant'): void
  (e: 'eraseMarks'): void
  (e: 'clearAll'): void
}>()

// === 内部状态管理（从主组件移过来） ===
const highlightMode = ref(false)
const hasSelectedText = ref(false)

// 定时器用于轮询选中状态
let pollTimer: number | null = null

// 启动轮询检查文本选择状态
const startPolling = () => {
  if (pollTimer) return
  
  pollTimer = setInterval(() => {
    if (props.paperPreviewRef) {
      const currentHasSelection = props.paperPreviewRef.getHasSelectedText()
      if (currentHasSelection !== hasSelectedText.value) {
        hasSelectedText.value = currentHasSelection
      }
    } else {
      // 如果没有 paperPreviewRef，直接检查 DOM 选择
      const selection = window.getSelection()
      const hasSelection = !!(selection && selection.toString().trim())
      if (hasSelection !== hasSelectedText.value) {
        hasSelectedText.value = hasSelection
      }
    }
  }, 200) // 每200ms检查一次
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 组件挂载时开始轮询
onMounted(() => {
  startPolling()
})

// 组件卸载时停止轮询
onUnmounted(() => {
  stopPolling()
})

// 监听 highlightMode 变化，同步到 PaperPreview
watch(highlightMode, (newMode) => {
  if (props.paperPreviewRef) {
    props.paperPreviewRef.setHighlightMode(newMode)
  }
})

// 切换高亮模式
const toggleHighlightMode = () => {
  highlightMode.value = !highlightMode.value
  
  if (highlightMode.value) {
    ElMessage.info('高亮模式已开启，选中文本进行标记')
  } else {
    ElMessage.info('高亮模式已关闭')
  }
}

// 标记答案 - 直接调用 PaperPreview 的方法
const handleMarkAnswer = (type: 'correct' | 'wrong' | 'unclear' | 'redundant') => {
  if (props.paperPreviewRef) {
    props.paperPreviewRef.markAnswer(type)
  } else {
    // 回退到事件方式
    emits('markAnswer', type)
  }
}

// 橡皮功能 - 清除选中文本的标记
const handleEraseMarks = () => {
  if (props.paperPreviewRef) {
    props.paperPreviewRef.clearSelection()
    ElMessage.info('已清除选中文本的标记')
  } else {
    emits('eraseMarks')
  }
}

// 清屏功能 - 一键清除所有标记
const handleClearAll = () => {
  if (props.paperPreviewRef) {
    props.paperPreviewRef.clearAllMarks()
    ElMessage.warning('已清除所有标记')
  } else {
    emits('clearAll')
  }
}

// 获取当前选中的文本
const getSelectedText = () => {
  if (props.paperPreviewRef) {
    return props.paperPreviewRef.getSelectedText()
  }
  return window.getSelection()?.toString().trim() || ''
}

// 快捷键支持
const handleKeyDown = (event: KeyboardEvent) => {
  if (!hasSelectedText.value) return
  
  // Ctrl/Cmd + 数字键快速标记
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case '1':
        event.preventDefault()
        handleMarkAnswer('correct')
        break
      case '2':
        event.preventDefault()
        handleMarkAnswer('wrong')
        break
      case '3':
        event.preventDefault()
        handleMarkAnswer('unclear')
        break
      case '4':
        event.preventDefault()
        handleMarkAnswer('redundant')
        break
      case 'Backspace':
      case 'Delete':
        event.preventDefault()
        handleEraseMarks()
        break
    }
  }
  
  // H 键切换高亮模式
  if (event.key === 'h' || event.key === 'H') {
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      toggleHighlightMode()
    }
  }
}

// 组件挂载时添加键盘监听
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

// 组件卸载时移除键盘监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 暴露方法给父组件
defineExpose({
  // 模式控制
  toggleHighlightMode,
  setHighlightMode: (mode: boolean) => {
    highlightMode.value = mode
  },
  getHighlightMode: () => highlightMode.value,
  
  // 标记功能
  markCorrect: () => handleMarkAnswer('correct'),
  markWrong: () => handleMarkAnswer('wrong'),
  markUnclear: () => handleMarkAnswer('unclear'),
  markRedundant: () => handleMarkAnswer('redundant'),
  
  // 清除功能
  eraseMarks: handleEraseMarks,
  clearAll: handleClearAll,
  
  // 状态查询
  getSelectedText,
  hasSelection: () => hasSelectedText.value,
  
  // 只读状态
  readonly: {
    highlightMode: () => highlightMode.value,
    hasSelectedText: () => hasSelectedText.value
  }
})
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
  position: relative;
}

/* 添加快捷键提示 */
.highlight-toolbar :deep(.el-button):hover::after {
  content: attr(title);
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
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
  background: rgb(12, 5, 214);
  border-color: rgb(12, 5, 214);
}

.highlight-toolbar :deep(.el-button--info:hover) {
  background: rgb(12, 5, 214);
  border-color: rgb(12, 5, 214);
  transform: translateY(-1px);
}

.highlight-toolbar :deep(.el-button--default) {
  background: #e5e5e5;
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
  background-color: #ffd900c1 !important;
  border-color: #ffd900c1 !important;
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