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
import { API_CONFIG, isAPIConfigValid } from '../../config/api.ts'
import BaseUpload from './BaseUpload.vue'
import { isJsonFile, readFileContent, saveJsonResult, validateJsonData } from './fileReaders.ts'

const props = defineProps({
  referenceAnswer: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  resetTrigger: { type: Number, default: 0 },
})

const emit = defineEmits(['answer-uploaded', 'answer-removed', 'preview-answer'])

const uploadState = ref({
  fileName: '',
  hasError: false,
  errorMessage: '',
  isSuccess: false,
  rawContent: '', // 保存原始文件内容，用于预览
})

const statusDisplay = computed(() => {
  if (!props.referenceAnswer.name && !uploadState.value.fileName) return ''
  if (uploadState.value.hasError) return ''
  return `当前参考答案：${props.referenceAnswer.name}（共${props.referenceAnswer.answerCount}道答案）`
})

const parseWithAI = async (content) => {
  try {
    ElMessage.info('正在调用大模型解析参考答案...')

    if (!isAPIConfigValid()) {
      console.warn('⚠️ API密钥未配置')
      throw new Error('AI解析失败，请上传 JSON 格式的参考答案文件，或检查 API 配置')
    }

    const prompt = `
请分析以下参考答案内容，并返回一个JSON格式的结果：

参考答案内容：
${content}

请按照以下格式返回JSON:
{
  "answerCount": 答案总数,
  "answers": [
    {
      "question_id": 题号,
      "answer": "参考答案内容"
    }
  ]
}

重要：只返回JSON数据，不要任何额外的文字说明。请严格按照上传的文件的排版格式，在合适的地方添加换行符\n。
`

    const response = await fetch(API_CONFIG.OPENAI.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_CONFIG.OPENAI.API_KEY}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENAI.MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: API_CONFIG.OPENAI.MAX_TOKENS,
        temperature: API_CONFIG.OPENAI.TEMPERATURE,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API调用失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    let analysisResult = result.choices[0].message.content

    let parsedResult
    try {
      parsedResult = JSON.parse(analysisResult)
    } catch (e) {
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('模型返回格式错误')
      }
    }

    return parsedResult
  } catch (error) {
    console.error('模型解析失败:', error)
    ElMessage.error('模型解析失败: ' + error.message)
    throw error
  }
}

const handleFileUpload = async (uploadFile, isProcessingRef) => {
  try {
    isProcessingRef.value = true
    ElMessage.info('开始解析参考答案...')

    const file = uploadFile.raw || uploadFile
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象')
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
      throw new Error('文件内容为空或解析失败')
    }

    let answerData

    if (isJsonFile(file.name)) {
      console.log('✅ 检测到JSON文件，直接解析')
      const jsonData = JSON.parse(content)
      validateJsonData(jsonData, 'answer')
      answerData = {
        name: file.name,
        content: content,
      }
    } else {
      console.log('✅ 检测到其他格式文件，调用AI解析')
      const parseResult = await parseWithAI(content)

      // 保存AI解析结果（仅非JSON文件）
      await saveJsonResult(parseResult, file.name, 'answer')

      answerData = {
        name: file.name,
        content: JSON.stringify(parseResult),
      }
    }

    // 成功后清除临时状态
    uploadState.value = {
      fileName: '',
      hasError: false,
      errorMessage: '',
      isSuccess: true,
      rawContent: '',
    }

    emit('answer-uploaded', answerData)
    ElMessage.success('参考答案解析完成！')
  } catch (error) {
    console.error('❌ 参考答案解析失败:', error)

    // 设置错误状态，保持原始内容
    uploadState.value = {
      fileName: uploadState.value.fileName || '未知文件',
      hasError: true,
      errorMessage: error.message,
      isSuccess: false,
      rawContent: uploadState.value.rawContent, // 保持原始内容
    }

    ElMessage.error('参考答案解析失败: ' + error.message)
  } finally {
    isProcessingRef.value = false
  }
}

const handleFileRemove = () => {
  emit('answer-removed')
  ElMessage.info('已移除答案文件')
}

const handlePreview = () => {
  if (uploadState.value.hasError && uploadState.value.rawContent) {
    // 错误状态下，直接预览原始文件内容
    emit('preview-answer', {
      fileName: uploadState.value.fileName,
      content: uploadState.value.rawContent,
      isError: true,
    })
  } else {
    // 正常状态，使用默认预览
    emit('preview-answer')
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
  emit('answer-removed')
}
</script>

<style scoped>
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

.answer-upload-card :deep(.card-header) {
  background: #c8e6f4;
}

.answer-upload-card :deep(.section-icon) {
  color: #0891b2;
}

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
