<template>
  <BaseUpload
    title="Student Papers"
    upload-title="Upload Student Answers"
    :icon="User"
    card-class="student-upload-card"
    upload-class="student-upload"
    accept=".json"
    upload-hint="Support JSON format with all student answers"
    processing-hint="Parsing student answers..."
    :current-file-name="uploadState.fileName || uploadStatusStore.studentAnswers.name"
    :status-text="statusDisplay"
    :is-ready="hasValidData && !uploadState.hasError"
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
import { User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useUploadStatusStore } from '../../stores/useUploadStatusStore'
import BaseUpload from './BaseUpload.vue'
import { readFileContent, validateJsonData } from './fileReaders.ts'

const uploadStatusStore = useUploadStatusStore()

const props = defineProps({
  studentPapers: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  resetTrigger: { type: Number, default: 0 },
})

const emit = defineEmits(['papers-uploaded', 'preview-papers'])

const uploadState = ref({
  fileName: '',
  hasError: false,
  errorMessage: '',
  isSuccess: false,
  rawContent: '', // 保存原始文件内容，用于预览
})

const hasValidData = computed(() => {
  return props.studentPapers.length > 0 && props.studentPapers.some((paper) => paper.valid)
})

const statusDisplay = computed(() => {
  if (!uploadStatusStore.studentAnswers.name && !uploadState.value.fileName) return ''
  if (uploadState.value.hasError) return ''
  return `当前学生答案：${uploadStatusStore.studentAnswers.name}（共${uploadStatusStore.studentAnswers.studentCount}名学生，${uploadStatusStore.studentAnswers.answerCount}个答案）`
})

const handleFileUpload = async (uploadFile, isProcessingRef) => {
  try {
    isProcessingRef.value = true
    ElMessage.info('开始解析学生答案...')

    const file = uploadFile.raw || uploadFile
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象')
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      throw new Error('只支持JSON格式的学生答案文件')
    }

    const content = await readFileContent(file)

    // 设置上传状态，保存原始内容
    uploadState.value = {
      fileName: file.name,
      hasError: false,
      errorMessage: '',
      isSuccess: false,
      rawContent: content, // 保存原始内容用于预览
    }
    if (!content || content.trim().length === 0) {
      throw new Error('文件内容为空')
    }

    const jsonData = JSON.parse(content)
    validateJsonData(jsonData, 'student')

    const studentData = {
      name: file.name,
      content: content,
    }

    // 成功后清除临时状态
    uploadState.value = {
      fileName: '',
      hasError: false,
      errorMessage: '',
      isSuccess: true,
      rawContent: '',
    }

    emit('papers-uploaded', studentData)
    ElMessage.success('学生答案解析完成！')
  } catch (error) {
    console.error('❌ 学生答案解析失败:', error)

    // 设置错误状态，保持原始内容
    uploadState.value = {
      fileName: uploadState.value.fileName || '未知文件',
      hasError: true,
      errorMessage: error.message,
      isSuccess: false,
      rawContent: uploadState.value.rawContent, // 保持原始内容
    }

    ElMessage.error('学生答案解析失败: ' + error.message)
  } finally {
    isProcessingRef.value = false
  }
}

const handleFileRemove = () => {
  emit('papers-uploaded', { removed: true })
  ElMessage.info('已移除学生答案文件')
}

const handlePreview = () => {
  if (uploadState.value.hasError && uploadState.value.rawContent) {
    // 错误状态下，直接预览原始文件内容
    emit('preview-papers', {
      fileName: uploadState.value.fileName,
      content: uploadState.value.rawContent,
      isError: true,
    })
  } else {
    // 正常状态，使用默认预览
    emit('preview-papers')
  }
}

const handleRemove = () => {
  // 清除所有状态
  uploadState.value = {
    fileName: '',
    hasError: false,
    errorMessage: '',
    isSuccess: false,
    rawContent: '',
  }
  emit('papers-uploaded', { removed: true })
}
</script>

<style scoped>
.student-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 0px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.student-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.student-upload-card :deep(.card-header) {
  background: #ffd48e;
}

.student-upload-card :deep(.section-icon) {
  color: #7c3aed;
}

.student-upload-card :deep(.student-upload .el-upload-dragger) {
  border: 2px dashed #c4b5fd;
  border-radius: 12px;
  background: #faf5ff;
  transition: all 0.3s ease;
  padding: 4px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-upload-card :deep(.student-upload .el-upload-dragger:hover) {
  border-color: #7c3aed;
  background: #f3f4f6;
}

.student-upload-card :deep(.upload-icon) {
  color: #7c3aed;
}
</style>
