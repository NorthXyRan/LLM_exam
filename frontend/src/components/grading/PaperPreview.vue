<template>
  <div class="paper-preview" @mouseup="handleTextSelection">
    <slot name="preview">
      <div class="preview-placeholder">
        <p>试卷预览内容将在这里显示</p>
        <p>选中文本后可以使用上方的标记工具进行评价</p>
        <div class="sample-text">
          <h4>示例学生答案：</h4>
          <p>这是一个示例的学生答案文本，你可以选中任意部分进行标记。比如这句话可能是正确的，而这句话可能存在错误。还有一些内容可能比较模糊，需要进一步澄清。</p>
        </div>
      </div>
    </slot>
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
/* === 试卷预览主容器 === */
.paper-preview {
  flex: 1;
  min-height: 400px;
  background-color: #f8f9fa;
  border-radius: 0 0 4px 4px;
  padding: 20px;
  user-select: text;
  border: 1px solid #e9ecef;
  border-top: none;
}

/* === 内容样式 === */
.preview-placeholder {
  color: #666;
  line-height: 1.6;
}

.sample-text {
  margin-top: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.sample-text h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.sample-text p {
  margin: 8px 0;
  line-height: 1.6;
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
</style> 