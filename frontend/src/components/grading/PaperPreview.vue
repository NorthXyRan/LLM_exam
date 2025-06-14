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
import { 
  generateHighlightedHTML,
  parseHighlightElement,
  HIGHLIGHT_CONFIG,
  type HighlightData,
  type HighlightType
} from './utils/highlightUtils'

interface Props {
  studentAnswer?: string
  highlightData?: HighlightData | null
}

const props = withDefaults(defineProps<Props>(), {
  studentAnswer: '',
  highlightData: null
})

const emits = defineEmits<{
  (e: 'highlightClicked', data: {
    text: string
    type: HighlightType
    reason: string
    scoringPoint: number
  }): void
  (e: 'markAnswer', data: { 
    text: string
    type: HighlightType 
  }): void
}>()

// === 内部状态管理 ===
const hasSelectedText = ref(false)
const selectedText = ref('')
const highlightMode = ref(false)

// === 计算属性 ===
const highlightedContent = computed(() => {
  return generateHighlightedHTML(
    props.studentAnswer, 
    props.highlightData
  )
})

// === 事件处理 ===
const handleHighlightClick = (event: Event) => {
  const target = event.target as HTMLElement
  const highlightData = parseHighlightElement(target)
  
  if (highlightData) {
    event.stopPropagation()
    const config = HIGHLIGHT_CONFIG[highlightData.type]
    
    emits('highlightClicked', highlightData)
    ElMessage.info(`查看【${config.label}】标记详情`)
  }
}

const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim()
    hasSelectedText.value = true
    
    // 高亮模式下自动标记为正确
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

// === 标记功能 ===
const markAnswer = (type: HighlightType) => {
  if (!selectedText.value) {
    ElMessage.warning('请先选中要标记的文本')
    return
  }
  
  const config = HIGHLIGHT_CONFIG[type]
  
  emits('markAnswer', {
    text: selectedText.value,
    type
  })
  
  ElMessage.success(`已标记为"${config.label}"：${selectedText.value.substring(0, 20)}...`)
  
  clearSelection()
}

const clearSelection = () => {
  window.getSelection()?.removeAllRanges()
  hasSelectedText.value = false
  selectedText.value = ''
}

// === 模式控制 ===
const setHighlightMode = (mode: boolean) => {
  highlightMode.value = mode
  console.log('高亮模式:', mode ? '开启' : '关闭')
}

// === 监听器 ===
watch(() => props.studentAnswer, () => {
  clearSelection()
})

// === 暴露的方法 ===
defineExpose({
  // 核心方法
  markAnswer,
  setHighlightMode,
  clearSelection,
  
  // 快捷方法
  quickMark: markAnswer,
  
  // 状态访问
  getSelectedText: () => selectedText.value,
  getHasSelectedText: () => hasSelectedText.value,
  
  // 只读状态
  readonly: {
    hasSelectedText: () => hasSelectedText.value,
    selectedText: () => selectedText.value,
    highlightMode: () => highlightMode.value
  }
})
</script>

<style scoped>
/* === 试卷预览容器 === */
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

/* 内容容器 */
.preview-content {
  padding: 20px;
  flex: 1;
  min-height: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
  font-size: 14px;
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

/* === 响应式设计 === */
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