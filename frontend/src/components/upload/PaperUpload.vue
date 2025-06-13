<template>
  <BaseUpload
    title="Paper Management"
    upload-title="Upload Paper File"
    :icon="Document"
    card-class="paper-upload-card"
    upload-class="paper-upload"
    accept=".txt,.doc,.docx,.json"
    upload-hint="Support TXT, DOC, DOCX, JSON format"
    processing-hint="Parsing paper content with AI..."
    :current-file-name="uploadState.fileName || examPaper.name"
    :status-text="statusDisplay"
    :is-ready="examPaper.status === 'ready' && !uploadState.hasError"
    :has-error="uploadState.hasError"
    :error-message="uploadState.errorMessage"
    :disabled="false"
    :reset-trigger="resetTrigger"
    @file-uploaded="handleFileUpload"
    @file-removed="handleFileRemove"
    @preview="handlePreview"
    @remove="handleRemove"
  />
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref, watch, nextTick } from 'vue'
import { isJsonFile, readFileContent, askToSaveJsonResult, validateJsonData } from '@/services/file/fileReaders'
import { uploadLLMService } from '@/services/llm'
import BaseUpload from './BaseUpload.vue'

// Props & Emits
const props = defineProps({
  examPaper: { type: Object, required: true },
  resetTrigger: { type: Number, default: 0 },
})
const emit = defineEmits(['paper-uploaded', 'paper-removed', 'preview-paper'])

// 上传状态管理
const uploadState = ref({
  fileName: '',
  hasError: false,
  errorMessage: '',
  isSuccess: false,
  rawContent: '', // 保存原始文件内容，用于预览
})

// 重置上传状态的函数
const resetUploadState = () => {
  uploadState.value = {
    fileName: '',
    hasError: false,
    errorMessage: '',
    isSuccess: false,
    rawContent: '',
  }
  console.log('📝 PaperUpload: 上传状态已重置')
}

// 计算属性：显示当前状态
const statusDisplay = computed(() => {
  if (!props.examPaper.name && !uploadState.value.fileName) return ''
  if (uploadState.value.hasError) return ''
  return `当前试卷：${props.examPaper.name}（共${props.examPaper.questionCount}道题目）`
})

// 监听重置触发 - 添加immediate选项确保初始化时也能重置
watch(
  () => props.resetTrigger,
  (newVal, oldVal) => {
    console.log(`📝 PaperUpload: resetTrigger 变化 ${oldVal} -> ${newVal}`)
    if (newVal > 0 && newVal !== oldVal) {
      nextTick(() => {
        resetUploadState()
      })
    }
  },
  { immediate: false } // 不需要immediate，因为初始状态就是空的
)

/**
 * 处理文件上传
 */
async function handleFileUpload(uploadFile, isProcessingRef) {
  try {
    isProcessingRef.value = true
    ElMessage.info('开始解析试卷...')

    const file = uploadFile.raw || uploadFile
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象')
    }

    // 读取文件内容
    const content = await readFileContent(file)
    if (!content || content.trim().length === 0) {
      throw new Error('文件内容为空或解析失败')
    }

    // 设置上传状态，保存原始内容
    uploadState.value = {
      fileName: file.name,
      hasError: false,
      errorMessage: '',
      isSuccess: false,
      rawContent: content,
    }

    let paperData

    if (isJsonFile(file.name)) {
      // JSON文件直接解析
      console.log('✅ 检测到JSON文件，直接解析')
      const jsonData = JSON.parse(content)
      validateJsonData(jsonData, 'paper')
      paperData = {
        name: file.name,
        content: content,
      }
    } else {
      // 其他格式调用AI解析
      console.log('✅ 检测到其他格式文件，调用AI解析')
      
      // 检查AI服务是否可用
      if (!uploadLLMService.isAvailable()) {
        throw new Error('AI解析失败，请上传 JSON 格式的试卷文件，或检查 API 配置')
      }
      
      // 调用AI解析
      const parseResult = await uploadLLMService.Parse(content, 'paper')
      
      validateJsonData(parseResult, 'paper')
      
      // 保存AI解析结果
      await askToSaveJsonResult(parseResult, file.name, 'paper')
      
      paperData = {
        name: file.name,
        content: JSON.stringify(parseResult),
      }
    }

    // 解析成功，清除错误状态但保留成功标记
    uploadState.value = {
      fileName: '',
      hasError: false,
      errorMessage: '',
      isSuccess: true,
      rawContent: '',
    }

    // 通知父组件
    emit('paper-uploaded', paperData)
    ElMessage.success('试卷解析完成！')
  } catch (error) {
    console.error('❌ 试卷解析失败:', error)

    // 设置错误状态
    uploadState.value = {
      ...uploadState.value,
      hasError: true,
      errorMessage: error.message,
      isSuccess: false,
    }

    ElMessage.error('试卷解析失败: ' + error.message)
  } finally {
    isProcessingRef.value = false
  }
}

/**
 * 处理文件移除
 */
function handleFileRemove() {
  resetUploadState()
  emit('paper-removed')
  ElMessage.info('已移除试卷文件')
}

/**
 * 处理预览
 */
function handlePreview() {
  if (uploadState.value.hasError && uploadState.value.rawContent) {
    // 错误状态下，预览原始文件内容
    emit('preview-paper', {
      fileName: uploadState.value.fileName,
      content: uploadState.value.rawContent,
      isError: true,
    })
  } else {
    // 正常状态预览
    emit('preview-paper')
  }
}

/**
 * 处理移除操作
 */
function handleRemove() {
  resetUploadState()
  emit('paper-removed')
}
</script>

<style scoped>
/* 试卷上传卡片样式 */
.paper-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 0px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.paper-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 卡片头部背景色 */
.paper-upload-card :deep(.card-header) {
  background: #e6d8c9;
}

/* 图标颜色 */
.paper-upload-card :deep(.section-icon) {
  color: #4f46e5;
}

/* 上传区域样式 */
.paper-upload-card :deep(.paper-upload .el-upload-dragger) {
  border: 2px dashed #c7d2fe;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  padding: 4px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-upload-card :deep(.paper-upload .el-upload-dragger:hover) {
  border-color: #4f46e5;
  background: #f3f4f6;
}

.paper-upload-card :deep(.upload-icon) {
  color: #4f46e5;
}
</style>