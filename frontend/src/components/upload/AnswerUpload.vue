<template>
  <BaseUpload
    title="Reference Answer"
    upload-title="Upload Answer File"
    :icon="DocumentChecked"
    card-class="answer-upload-card"
    upload-class="answer-upload"
    accept=".txt,.doc,.docx,.json"
    upload-hint="Support TXT, DOC, DOCX, JSON format"
    processing-hint="Parsing answer content..."
    :current-file-name="uploadState.fileName || referenceAnswer.name"
    :status-text="statusDisplay"
    :is-ready="referenceAnswer.status === 'ready' && !uploadState.hasError"
    :has-error="uploadState.hasError"
    :error-message="uploadState.errorMessage"
    :disabled="disabled"
    :reset-trigger="resetTrigger"
    @file-uploaded="handleFileUpload"
    @file-removed="handleFileRemove"
    @preview="handlePreview"
    @remove="handleRemove"
  />
</template>

<script setup>
import { DocumentChecked } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { isJsonFile, readFileContent, saveJsonResult, validateJsonData } from '@/services/file/fileReaders'
import { uploadLLMService } from '@/services/llm'
import BaseUpload from './BaseUpload.vue'

// Props & Emits
const props = defineProps({
  referenceAnswer: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  resetTrigger: { type: Number, default: 0 },
})
const emit = defineEmits(['answer-uploaded', 'answer-removed', 'preview-answer'])

// 上传状态管理
const uploadState = ref({
  fileName: '',
  hasError: false,
  errorMessage: '',
  isSuccess: false,
  rawContent: '', // 保存原始文件内容，用于预览
})

// 计算属性：显示当前状态
const statusDisplay = computed(() => {
  if (!props.referenceAnswer.name && !uploadState.value.fileName) return ''
  if (uploadState.value.hasError) return ''
  return `当前参考答案：${props.referenceAnswer.name}（共${props.referenceAnswer.answerCount}道答案）`
})

/**
 * 处理文件上传
 */
const handleFileUpload = async (uploadFile, isProcessingRef) => {
  try {
    isProcessingRef.value = true
    ElMessage.info('开始解析参考答案...')

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

    let answerData

    if (isJsonFile(file.name)) {
      // JSON文件直接解析
      console.log('✅ 检测到JSON文件，直接解析')
      const jsonData = JSON.parse(content)
      validateJsonData(jsonData, 'answer')
      answerData = {
        name: file.name,
        content: content,
      }
    } else {
      // 其他格式调用AI解析
      console.log('✅ 检测到其他格式文件，调用AI解析')
      
      // 检查AI服务是否可用
      if (!uploadLLMService.isAvailable()) {
        throw new Error('AI解析失败，请上传 JSON 格式的参考答案文件，或检查 API 配置')
      }
      
      // 调用AI解析
      const parseResult = await uploadLLMService.Parse(content, 'answer')
      
      // 保存AI解析结果
      await saveJsonResult(parseResult, file.name, 'answer')
      
      answerData = {
        name: file.name,
        content: JSON.stringify(parseResult),
      }
    }

    // 解析成功，清除错误状态
    uploadState.value = {
      fileName: '',
      hasError: false,
      errorMessage: '',
      isSuccess: true,
      rawContent: '',
    }

    // 通知父组件
    emit('answer-uploaded', answerData)
    ElMessage.success('参考答案解析完成！')
  } catch (error) {
    console.error('❌ 参考答案解析失败:', error)

    // 设置错误状态
    uploadState.value = {
      ...uploadState.value,
      hasError: true,
      errorMessage: error.message,
      isSuccess: false,
    }

    ElMessage.error('参考答案解析失败: ' + error.message)
  } finally {
    isProcessingRef.value = false
  }
}

/**
 * 处理文件移除
 */
const handleFileRemove = () => {
  emit('answer-removed')
  ElMessage.info('已移除答案文件')
}

/**
 * 处理预览
 */
const handlePreview = () => {
  if (uploadState.value.hasError && uploadState.value.rawContent) {
    // 错误状态下，预览原始文件内容
    emit('preview-answer', {
      fileName: uploadState.value.fileName,
      content: uploadState.value.rawContent,
      isError: true,
    })
  } else {
    // 正常状态预览
    emit('preview-answer')
  }
}

/**
 * 处理移除操作
 */
const handleRemove = () => {
  // 清除所有状态
  uploadState.value = {
    fileName: '',
    hasError: false,
    errorMessage: '',
    isSuccess: false,
    rawContent: '',
  }
  emit('answer-removed')
}
</script>

<style scoped>
/* 答案上传卡片样式 */
.answer-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  border: 0px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.answer-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 卡片头部背景色 */
.answer-upload-card :deep(.card-header) {
  background: #c8e6f4;
}

/* 图标颜色 */
.answer-upload-card :deep(.section-icon) {
  color: #0891b2;
}

/* 上传区域样式 */
.answer-upload-card :deep(.answer-upload .el-upload-dragger) {
  border: 2px dashed #a5f3fc;
  border-radius: 12px;
  background: #f0fdfa;
  transition: all 0.3s ease;
  padding: 4px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-upload-card :deep(.answer-upload .el-upload-dragger:hover) {
  border-color: #0891b2;
  background: #ecfdf5;
}

.answer-upload-card :deep(.upload-icon) {
  color: #0891b2;
}
</style>