<template>
  <BaseUpload
    title="Paper Management"
    upload-title="Upload Paper File"
    :icon="Document"
    card-class="paper-upload-card"
    upload-class="paper-upload"
    accept=".txt,.doc,.docx,.pdf,.json"
    upload-hint="Support TXT, DOC, DOCX, PDF, JSON format"
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
import { computed, ref, watch } from 'vue'
import { API_CONFIG, isAPIConfigValid } from '../../config/api.js'
import BaseUpload from './BaseUpload.vue'
import { isJsonFile, readFileContent, saveJsonResult } from './fileReaders.ts'

// =============================================================================
// Props & Emits
// =============================================================================
const props = defineProps({
  examPaper: { type: Object, required: true },
  resetTrigger: { type: Number, default: 0 },
})
const emit = defineEmits(['paper-uploaded', 'paper-removed', 'preview-paper'])

// =============================================================================
// 响应式状态
// =============================================================================
const paperFileList = ref([])
const uploadState = ref({
  fileName: '',
  hasError: false,
  errorMessage: '',
  isSuccess: false,
  rawContent: '', // 保存原始文件内容，用于预览
})

// 计算状态显示信息
const statusDisplay = computed(() => {
  if (!props.examPaper.name && !uploadState.value.fileName) return ''
  if (uploadState.value.hasError) return ''
  return `当前试卷：${props.examPaper.name}（共${props.examPaper.questionCount}道题目）`
})

// 监听重置触发器
watch(
  () => props.resetTrigger,
  () => {
    if (props.resetTrigger > 0) {
      paperFileList.value = []
      uploadState.value = {
        fileName: '',
        hasError: false,
        errorMessage: '',
        isSuccess: false,
        rawContent: '',
      }
      console.log('📄 PaperUpload 文件列表已清空')
    }
  },
)

// =============================================================================
// AI解析相关函数
// =============================================================================
/**
 * 使用AI解析试卷内容
 */
async function parseWithAI(content) {
  try {
    ElMessage.info('正在调用大模型分析试卷...')

    if (!isAPIConfigValid()) {
      console.warn('⚠️ API密钥未配置')
      throw new Error('AI解析失败，请上传 JSON 格式的试卷文件，或检查 API 配置')
    }

    const prompt = `
请分析以下试卷内容，并返回一个JSON格式的结果，包含题目数量和题目内容：

试卷内容：
${content}

请按照以下格式返回JSON:
{
  "questionCount": 题目总数,
  "questions": [
    {
      "question_id": 题号,
      "question": "题目内容",
      "score": 分值
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

    // 解析JSON结果
    let parsedResult
    try {
      parsedResult = JSON.parse(analysisResult)
    } catch (e) {
      // 尝试提取JSON部分
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

async function processPaperData(file, content) {
  if (isJsonFile(file.name)) {
    console.log('✅ 检测到JSON文件，直接解析')
    const jsonData = JSON.parse(content)
    return {
      name: file.name,
      content: content,
    }
  } else {
    console.log('✅ 检测到其他格式文件，调用AI解析')
    const parseResult = await parseWithAI(content)

    // 保存AI解析结果（仅非JSON文件）
    await saveJsonResult(parseResult, file.name, 'paper')

    return {
      name: file.name,
      content: JSON.stringify(parseResult),
    }
  }
}

// =============================================================================
// 事件处理函数
// =============================================================================
async function handleFileUpload(uploadFile, isProcessingRef) {
  try {
    isProcessingRef.value = true
    ElMessage.info('开始解析试卷...')

    const file = uploadFile.raw || uploadFile
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象')
    }

    console.log('✅ 开始处理试卷文件:', file.name)

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

    const paperData = await processPaperData(file, content)
    console.log('✅ 最终试卷数据:', paperData)

    // 成功后清除临时状态
    uploadState.value = {
      fileName: '',
      hasError: false,
      errorMessage: '',
      isSuccess: true,
      rawContent: '',
    }

    emit('paper-uploaded', paperData)
    ElMessage.success(`试卷解析完成！`)
  } catch (error) {
    console.error('❌ 试卷解析失败:', error)

    // 设置错误状态，保持原始内容
    uploadState.value = {
      fileName: uploadState.value.fileName || '未知文件',
      hasError: true,
      errorMessage: error.message,
      isSuccess: false,
      rawContent: uploadState.value.rawContent, // 保持原始内容
    }

    ElMessage.error('试卷解析失败: ' + error.message)
    paperFileList.value = []
  } finally {
    isProcessingRef.value = false
  }
}

function handleFileRemove() {
  emit('paper-removed')
  ElMessage.info('已移除试卷文件')
}

function handlePreview() {
  if (uploadState.value.hasError && uploadState.value.rawContent) {
    // 错误状态下，直接预览原始文件内容
    emit('preview-paper', {
      fileName: uploadState.value.fileName,
      content: uploadState.value.rawContent,
      isError: true,
    })
  } else {
    // 正常状态，使用默认预览
    emit('preview-paper')
  }
}

async function handleRemove() {
  // 清除所有状态
  uploadState.value = {
    fileName: '',
    hasError: false,
    errorMessage: '',
    isSuccess: false,
    rawContent: '',
  }
  paperFileList.value = []
  emit('paper-removed')
}
</script>

<style scoped>
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

.paper-upload-card :deep(.card-header) {
  background: #e6d8c9;
}

.paper-upload-card :deep(.section-icon) {
  color: #4f46e5;
}

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
