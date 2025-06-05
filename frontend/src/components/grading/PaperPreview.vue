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
import { computed, ref } from 'vue'

// 高亮数据类型定义 - 修正TypeScript字段访问
interface HighlightItem {
  'Student answer': string
  start_index: number
  end_index: number
  'Scoring point'?: number
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
  scoringPoint?: number
}

interface Props {
  highlightMode?: boolean
  studentAnswer?: string
  highlightData?: HighlightData | null
}

const props = withDefaults(defineProps<Props>(), {
  highlightMode: false,
  studentAnswer: '',
  highlightData: null
})

const emits = defineEmits<{
  (e: 'textSelected', data: { text: string, hasSelection: boolean }): void
  (e: 'markAnswer', data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }): void
  (e: 'highlightClicked', data: SelectedHighlight): void
}>()

const hasSelectedText = ref(false)
const selectedText = ref('')

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

// 计算高亮后的HTML内容 - 添加调试功能
const highlightedContent = computed(() => {
  if (!props.studentAnswer) {
    return props.studentAnswer
  }

  // 如果没有高亮数据，返回原始文本
  if (!props.highlightData) {
    return props.studentAnswer
  }

  const originalContent = props.studentAnswer
  console.log('=== 高亮调试信息 ===')
  console.log('原始文本长度:', originalContent.length)
  console.log('原始文本内容:', JSON.stringify(originalContent))

  const segments: Array<{
    start: number
    end: number
    text: string
    highlight?: {
      type: keyof typeof HIGHLIGHT_CONFIG
      reason: string
      scoringPoint?: number
    }
  }> = []

  // 收集所有高亮片段并验证
  Object.entries(props.highlightData.answer).forEach(([type, items]) => {
    if (Array.isArray(items)) {
      items.forEach((item: HighlightItem, index) => {
        const startIndex = item.start_index
        const endIndex = item.end_index
        const expectedText = item['Student answer'] // 使用方括号访问带空格的属性
        const scoringPoint = item['Scoring point'] // 使用方括号访问带空格的属性
        
        console.log(`\n--- ${type} 高亮 ${index + 1} ---`)
        console.log('期望文本:', JSON.stringify(expectedText))
        console.log('索引范围:', `${startIndex}-${endIndex}`)
        console.log('评分点:', scoringPoint)
        
        // 验证索引有效性
        if (startIndex < 0 || endIndex > originalContent.length || startIndex >= endIndex) {
          console.error(`❌ 无效的索引范围: ${startIndex}-${endIndex}, 文本长度: ${originalContent.length}`)
          return
        }

        // 提取实际文本并比较
        const actualText = originalContent.substring(startIndex, endIndex)
        console.log('实际文本:', JSON.stringify(actualText))
        
        if (actualText !== expectedText) {
          console.warn(`⚠️ 文本不匹配!`)
          console.log('差异分析:')
          console.log('  期望长度:', expectedText.length)
          console.log('  实际长度:', actualText.length)
          
          // 尝试查找期望文本在原文中的位置
          const foundIndex = originalContent.indexOf(expectedText)
          if (foundIndex !== -1) {
            console.log(`  期望文本在原文中的实际位置: ${foundIndex}-${foundIndex + expectedText.length}`)
          } else {
            console.log('  期望文本在原文中未找到')
            // 查找相似文本
            const similarTexts = []
            for (let i = 0; i <= originalContent.length - expectedText.length; i++) {
              const candidate = originalContent.substring(i, i + expectedText.length)
              if (candidate.trim() === expectedText.trim()) {
                similarTexts.push(`${i}-${i + expectedText.length}`)
              }
            }
            if (similarTexts.length > 0) {
              console.log('  找到相似文本(忽略空白):', similarTexts)
            }
          }
        } else {
          console.log('✅ 文本匹配成功')
        }

        segments.push({
          start: startIndex,
          end: endIndex,
          text: actualText, // 使用实际提取的文本
          highlight: {
            type: type as keyof typeof HIGHLIGHT_CONFIG,
            reason: item.reason,
            scoringPoint: scoringPoint // 使用之前提取的值
          }
        })
      })
    }
  })

  // 检查重叠
  segments.sort((a, b) => a.start - b.start)
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i]
    const next = segments[i + 1]
    if (current.end > next.start) {
      console.warn(`⚠️ 检测到重叠: [${current.start}-${current.end}] 与 [${next.start}-${next.end}]`)
    }
  }

  // 创建所有文本段（包括高亮和非高亮部分）
  const allSegments: Array<{
    text: string
    highlight?: {
      type: keyof typeof HIGHLIGHT_CONFIG
      reason: string
      scoringPoint?: number
    }
  }> = []

  let currentIndex = 0

  segments.forEach(segment => {
    // 添加高亮前的普通文本
    if (currentIndex < segment.start) {
      const normalText = originalContent.substring(currentIndex, segment.start)
      allSegments.push({
        text: normalText
      })
    }

    // 添加高亮文本
    allSegments.push(segment)
    currentIndex = segment.end
  })

  // 添加最后的普通文本
  if (currentIndex < originalContent.length) {
    allSegments.push({
      text: originalContent.substring(currentIndex)
    })
  }

  console.log('最终段落数量:', allSegments.length)
  console.log('===================')

  // 生成HTML
  return allSegments.map(segment => {
    if (!segment.highlight) {
      // 普通文本，直接返回（保持换行等格式）
      return segment.text
    }

    // 高亮文本，包装为span
    const { type, reason, scoringPoint } = segment.highlight
    const config = HIGHLIGHT_CONFIG[type]
    
    // 转义特殊字符
    const escapedText = segment.text.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    const escapedReason = reason.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    
    return `<span 
      class="text-highlight ${config.className}" 
      data-type="${type}"
      data-text="${escapedText}"
      data-reason="${escapedReason}"
      data-scoring-point="${scoringPoint || 0}"
      style="background-color: ${config.color}; border-left: 3px solid ${config.borderColor}; padding: 2px 4px; border-radius: 3px; cursor: pointer; margin: 0 1px;"
      title="【${config.label}】${reason}"
    >${segment.text}</span>`
  }).join('')
})

// 处理高亮点击事件
const handleHighlightClick = (event: Event) => {
  const target = event.target as HTMLElement
  
  if (target.classList.contains('text-highlight')) {
    event.stopPropagation()
    
    const type = target.getAttribute('data-type') as 'correct' | 'wrong' | 'unclear' | 'redundant'
    const text = target.getAttribute('data-text') || ''
    const reason = target.getAttribute('data-reason') || ''
    const scoringPoint = parseInt(target.getAttribute('data-scoring-point') || '0')
    
    const config = HIGHLIGHT_CONFIG[type]
    
    emits('highlightClicked', {
      text: text.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
      type,
      reason: reason.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
      scoringPoint: scoringPoint || undefined
    })
    
    ElMessage.info(`查看【${config.label}】标记详情`)
  }
}

// 处理文本选择
const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim()
    hasSelectedText.value = true
    emits('textSelected', {
      text: selectedText.value,
      hasSelection: true
    })
    
    if (props.highlightMode) {
      setTimeout(() => markAnswer('correct'), 100)
    }
  } else {
    hasSelectedText.value = false
    selectedText.value = ''
    emits('textSelected', {
      text: '',
      hasSelection: false
    })
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
  window.getSelection()?.removeAllRanges()
  hasSelectedText.value = false
  selectedText.value = ''
  emits('textSelected', {
    text: '',
    hasSelection: false
  })
}

// 暴露方法给父组件
defineExpose({
  markAnswer
})
</script>

<style scoped>
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

.preview-content {
  padding: 20px;
  flex: 1;
  min-height: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
  font-size: 14px;
}

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

.preview-content :deep(.highlight-correct) {
  background-color: #d4edda !important;
  border-left: 3px solid #28a745 !important;
}

.preview-content :deep(.highlight-correct:hover) {
  background-color: #c3e6cb !important;
  border-left-color: #1e7e34 !important;
}

.preview-content :deep(.highlight-wrong) {
  background-color: #f8d7da !important;
  border-left: 3px solid #dc3545 !important;
}

.preview-content :deep(.highlight-wrong:hover) {
  background-color: #f5c6cb !important;
  border-left-color: #c82333 !important;
}

.preview-content :deep(.highlight-unclear) {
  background-color: #fff3cd !important;
  border-left: 3px solid #ffc107 !important;
}

.preview-content :deep(.highlight-unclear:hover) {
  background-color: #ffeaa7 !important;
  border-left-color: #e0a800 !important;
}

.preview-content :deep(.highlight-redundant) {
  background-color: #d1ecf1 !important;
  border-left: 3px solid #17a2b8 !important;
}

.preview-content :deep(.highlight-redundant:hover) {
  background-color: #bee5eb !important;
  border-left-color: #138496 !important;
}

::selection {
  background-color: #409eff;
  color: white;
}

::-moz-selection {
  background-color: #409eff;
  color: white;
}

.paper-preview::-webkit-scrollbar {
  width: 6px;
}

.paper-preview::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.paper-preview::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.6);
  border-radius: 3px;
}

.paper-preview::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.8);
}

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