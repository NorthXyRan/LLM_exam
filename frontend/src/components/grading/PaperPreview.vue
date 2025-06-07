<template>
  <div class="paper-preview" @mouseup="handleTextSelection">
    <div 
      class="preview-content" 
      v-html="highlightedContent"
      @click="handleHighlightClick"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'

// 高亮数据类型定义
interface HighlightItem {
  'Student answer': string
  'Scoring point': number
  reason: string
}

interface HighlightData {
  student_id: number
  question_id: number
  answer: {
    correct: HighlightItem[]
    wrong: HighlightItem[]
    unclear: HighlightItem[]
    redundant: HighlightItem[]
  }
  total_score: number
}

// 选中高亮的数据类型
interface SelectedHighlight {
  text: string
  type: 'correct' | 'wrong' | 'unclear' | 'redundant'
  reason: string
  scoringPoint: number
}

interface Props {
  studentAnswer?: string
  highlightData?: HighlightData | null
}

const props = withDefaults(defineProps<Props>(), {
  studentAnswer: '',
  highlightData: null
})

const emits = defineEmits<{
  // 简化事件：只发送必要的信息给父组件
  (e: 'highlightClicked', data: SelectedHighlight): void
  (e: 'markAnswer', data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }): void
}>()

// === 内部状态管理（从主组件移过来） ===
const hasSelectedText = ref(false)
const selectedText = ref('')
const highlightMode = ref(false)

// 高亮类型配置
const HIGHLIGHT_CONFIG = {
  correct: { 
    className: 'highlight-correct', 
    color: '#d4edda', 
    borderColor: '#28a745',
    label: '正确'
  },
  wrong: { 
    className: 'highlight-wrong', 
    color: '#f8d7da', 
    borderColor: '#dc3545',
    label: '错误'
  },
  unclear: { 
    className: 'highlight-unclear', 
    color: '#fff3cd', 
    borderColor: '#ffc107',
    label: '模糊'
  },
  redundant: { 
    className: 'highlight-redundant', 
    color: '#d1ecf1', 
    borderColor: '#17a2b8',
    label: '冗余'
  }
}

////////////////////////////////////////////////////////////
//                  计算高亮后的HTML内容                     //
////////////////////////////////////////////////////////////
const highlightedContent = computed(() => {
  if (!props.studentAnswer) {
    return props.studentAnswer
  }

  // 如果没有高亮数据，返回原始文本
  if (!props.highlightData) {
    return props.studentAnswer
  }

  let content = props.studentAnswer
  const highlights: Array<{
    text: string
    type: keyof typeof HIGHLIGHT_CONFIG
    reason: string
    scoringPoint: number
    startIndex: number
    endIndex: number
  }> = []

  ////////////////////// 
  //  收集所有高亮片段  //
  /////////////////////
  Object.entries(props.highlightData.answer).forEach(([type, items]) => {
    
    // 确保 items 是数组类型
    if (Array.isArray(items)) {
      items.forEach((item: HighlightItem) => {
        const text = item['Student answer']
        const startIndex = content.indexOf(text)    // 获取文本在内容中的位置
        
        if (startIndex !== -1) {
          highlights.push({
            text,
            type: type as keyof typeof HIGHLIGHT_CONFIG,
            reason: item.reason,
            scoringPoint: item['Scoring point'],
            startIndex,
            endIndex: startIndex + text.length
          })
        } else {
          console.warn(`未找到高亮文本: "${text}"`)
        }
      })
    }
  })

  // 按位置排序，避免重叠问题
  highlights.sort((a, b) => a.startIndex - b.startIndex)

  // 检查并处理重叠 - 保留较长的片段
  const validHighlights = highlights.filter((highlight, index) => {
    for (let i = index + 1; i < highlights.length; i++) {
      const next = highlights[i]
      // 如果有重叠
      if (highlight.endIndex > next.startIndex) {
        if (highlight.text.length >= next.text.length) {
          // 当前片段更长，移除下一个
          highlights.splice(i, 1)
          i--
        } else {
          // 下一个片段更长，移除当前片段
          return false
        }
      }
    }
    return true
  })

  // 生成高亮后的HTML内容
  let result = content
  validHighlights.reverse().forEach(highlight => {
    const { text, type, reason, scoringPoint } = highlight
    const config = HIGHLIGHT_CONFIG[type]
    
    // 转义特殊字符
    const escapedText = text.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    const escapedReason = reason.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    
    const highlightHtml = `<span 
      class="text-highlight ${config.className}" 
      data-type="${type}"
      data-text="${escapedText}"
      data-reason="${escapedReason}"
      data-scoring-point="${scoringPoint}"
      style="background-color: ${config.color}; border-left: 3px solid ${config.borderColor}; padding: 2px 4px; border-radius: 3px; cursor: pointer; margin: 0 1px;"
      title="【${config.label}】${reason}"
    >${text}</span>`
    
    result = result.substring(0, highlight.startIndex) + 
             highlightHtml + 
             result.substring(highlight.endIndex)
  })

  return result
})

// 处理高亮点击事件
const handleHighlightClick = (event: Event) => {
  const target = event.target as HTMLElement
  
  if (target.classList.contains('text-highlight')) {
    event.stopPropagation() // 阻止事件冒泡
    
    const type = target.getAttribute('data-type') as 'correct' | 'wrong' | 'unclear' | 'redundant'
    const text = target.getAttribute('data-text') || ''
    const reason = target.getAttribute('data-reason') || ''
    const scoringPoint = parseInt(target.getAttribute('data-scoring-point') || '0')
    
    const config = HIGHLIGHT_CONFIG[type]
    
    emits('highlightClicked', {
      text: text.replace(/&quot;/g, '"').replace(/&#39;/g, "'"), // 反转义
      type,
      reason: reason.replace(/&quot;/g, '"').replace(/&#39;/g, "'"), // 反转义
      scoringPoint
    })
    
    ElMessage.info(`查看【${config.label}】标记详情`)
    console.log('点击高亮:', { type, text, reason, scoringPoint })
  }
}

// 处理文本选择
const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim()
    hasSelectedText.value = true
    
    // 高亮模式下自动标记为正确（示例）
    if (highlightMode.value) {
      setTimeout(() => {
        markAnswer('correct')
      }, 100)
    }
  } else {
    hasSelectedText.value = false
    selectedText.value = ''
  }
}

// 标记答案
const markAnswer = (type: 'correct' | 'wrong' | 'unclear' | 'redundant') => {
  if (!selectedText.value) {
    ElMessage.warning('请先选中要标记的文本')
    return
  }
  
  const markLabels = {
    correct: '正确',
    wrong: '错误',
    unclear: '模糊',
    redundant: '冗余'
  }
  
  emits('markAnswer', {
    text: selectedText.value,
    type
  })
  
  ElMessage.success(`已标记为"${markLabels[type]}"：${selectedText.value.substring(0, 20)}...`)
  
  // 清除选择
  clearSelection()
}

// 清除文本选择
const clearSelection = () => {
  window.getSelection()?.removeAllRanges()
  hasSelectedText.value = false
  selectedText.value = ''
}

// 设置高亮模式
const setHighlightMode = (mode: boolean) => {
  highlightMode.value = mode
  console.log('高亮模式:', mode ? '开启' : '关闭')
}

// 获取当前选中的文本
const getSelectedText = () => {
  return selectedText.value
}

// 检查是否有选中文本
const getHasSelectedText = () => {
  return hasSelectedText.value
}

// 快捷标记方法
const quickMark = (type: 'correct' | 'wrong' | 'unclear' | 'redundant') => {
  markAnswer(type)
}

// 清除所有标记（如果需要的话）
const clearAllMarks = () => {
  clearSelection()
  ElMessage.info('已清除当前选择')
}

// 监听 props 变化，在内容改变时清除选择
watch(() => props.studentAnswer, () => {
  clearSelection()
})

// 暴露方法给父组件和其他组件使用
defineExpose({
  // 原有方法
  markAnswer,
  // 新增的内部状态管理方法
  setHighlightMode,
  getSelectedText,
  getHasSelectedText,
  clearSelection,
  quickMark,
  clearAllMarks,
  // 只读状态访问
  readonly: {
    hasSelectedText: () => hasSelectedText.value,
    selectedText: () => selectedText.value,
    highlightMode: () => highlightMode.value
  }
})
</script>

<style scoped>
/* === 试卷预览内部样式 === */
.paper-preview {
  flex: 1;
  padding: 0;
  user-select: text;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 内容容器，提供实际的内边距 */
.preview-content {
  padding: 20px;
  flex: 1;
  min-height: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
  font-size: 14px;
}

/* === 高亮样式 === */
.preview-content :deep(.text-highlight) {
  transition: all 0.2s ease;
  position: relative;
  display: inline;
}

.preview-content :deep(.text-highlight:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

/* 正确答案高亮 */
.preview-content :deep(.highlight-correct) {
  background-color: #d4edda !important;
  border-left: 3px solid #28a745 !important;
}

.preview-content :deep(.highlight-correct:hover) {
  background-color: #c3e6cb !important;
  border-left-color: #1e7e34 !important;
}

/* 错误答案高亮 */
.preview-content :deep(.highlight-wrong) {
  background-color: #f8d7da !important;
  border-left: 3px solid #dc3545 !important;
}

.preview-content :deep(.highlight-wrong:hover) {
  background-color: #f5c6cb !important;
  border-left-color: #c82333 !important;
}

/* 模糊答案高亮 */
.preview-content :deep(.highlight-unclear) {
  background-color: #fff3cd !important;
  border-left: 3px solid #ffc107 !important;
}

.preview-content :deep(.highlight-unclear:hover) {
  background-color: #ffeaa7 !important;
  border-left-color: #e0a800 !important;
}

/* 冗余答案高亮 */
.preview-content :deep(.highlight-redundant) {
  background-color: #d1ecf1 !important;
  border-left: 3px solid #17a2b8 !important;
}

.preview-content :deep(.highlight-redundant:hover) {
  background-color: #bee5eb !important;
  border-left-color: #138496 !important;
}

/* === 文本选择样式 === */
::selection {
  background-color: #409eff;
  color: white;
}

::-moz-selection {
  background-color: #409eff;
  color: white;
}

/* 高亮模式下的选择样式 */
.paper-preview.highlight-mode ::selection {
  background-color: #4CD964;
  color: white;
}

.paper-preview.highlight-mode ::-moz-selection {
  background-color: #4CD964;
  color: white;
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .preview-content {
    padding: 15px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .preview-content {
    padding: 12px;
    font-size: 12px;
  }
}
</style>