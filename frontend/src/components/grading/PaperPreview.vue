<template>
  <div class="paper-preview" @mouseup="handleTextSelection">
    <div class="preview-content">
      <slot name="preview">
        <div class="preview-placeholder">
          <p>试卷预览内容将在这里显示</p>
          <p>选中文本后可以使用上方的标记工具进行评价</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

interface Props {
  highlightMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlightMode: false
})

const emits = defineEmits<{
  (e: 'textSelected', data: { text: string, hasSelection: boolean }): void
  (e: 'markAnswer', data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }): void
}>()

const hasSelectedText = ref(false)
const selectedText = ref('')

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
    // 高亮模式下自动标记为正确（示例）
    if (props.highlightMode) {
      setTimeout(() => {
        markAnswer('correct')
      }, 100)
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
}

/* === 占位内容样式 === */
.preview-placeholder {
  color: #666;
  line-height: 1.6;
}

.preview-placeholder p {
  margin: 8px 0;
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

/* === 滚动条样式 === */
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

/* === 响应式调整 === */
@media (max-width: 768px) {
  .preview-content {
    padding: 15px;
  }
}
</style>