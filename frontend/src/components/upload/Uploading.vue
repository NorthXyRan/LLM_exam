<template>
  <div class="uploading-container">
    <!-- 试卷上传组件 -->
    <PaperUpload
      :status="uploadStore.examPaper.status"
      :file-name="uploadStore.examPaper.name"
      :display-text="paperDisplayText"
      :error="uploadStore.examPaper.error"
      @file-selected="handlePaperSelected"
      @remove="handlePaperRemove"
      @preview="handlePaperPreview"
    />

    <!-- 参考答案上传组件 -->
    <AnswerUpload
      :disabled="!uploadStore.canUploadAnswer"
      :status="uploadStore.referenceAnswer.status"
      :file-name="uploadStore.referenceAnswer.name"
      :display-text="answerDisplayText"
      :error="uploadStore.referenceAnswer.error"
      @file-selected="handleAnswerSelected"
      @remove="handleAnswerRemove"
      @preview="handleAnswerPreview"
    />

    <!-- 学生答案上传组件 -->
    <StudentUpload
      :disabled="!uploadStore.canUploadStudent"
      :status="uploadStore.studentAnswers.status"
      :file-name="uploadStore.studentAnswers.name"
      :display-text="studentDisplayText"
      :error="uploadStore.studentAnswers.error"
      @file-selected="handleStudentSelected"
      @remove="handleStudentRemove"
      @preview="handleStudentPreview"
    />

    <!-- 重置按钮 -->
    <div class="reset-button-container">
      <el-button type="danger" @click="resetAll">
        <el-icon><RefreshLeft /></el-icon>
        Reset All
      </el-button>
    </div>

    <!-- 统一预览弹窗 -->
    <Preview
      v-model:visible="previewDialog.visible"
      :title="previewDialog.title"
      :content="previewDialog.content"
    />
  </div>
</template>

<script setup lang="ts">
import { RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import {
  askToSaveJsonResult,
  isJsonFile,
  readFileContent,
  validateJsonData,
} from '../../services/file/fileReaders.ts'
import { uploadLLMService } from '../../services/llm'
import { useExamDataStore } from '../../stores/useExamDataStore'
import { useUploadStatusStore } from '../../stores/useUploadStatusStore'
import AnswerUpload from './AnswerUpload.vue'
import PaperUpload from './PaperUpload.vue'
import Preview from './preview.vue'
import StudentUpload from './StudentUpload.vue'

// 使用 Store
const uploadStore = useUploadStatusStore()
const examStore = useExamDataStore()

// 预览弹窗状态
const previewDialog = ref({
  visible: false,
  title: '',
  content: '',
})

// ===== 计算属性：显示文本 =====
const paperDisplayText = computed(() => {
  const paper = uploadStore.examPaper
  if (paper.status === 'error') return paper.error || '解析失败'
  if (paper.status === 'ready') {
    const questionCount = paper.meta?.questionCount || 0
    return `当前试卷：${paper.name}（共${questionCount}道题目）`
  }
  return ''
})

const answerDisplayText = computed(() => {
  const answer = uploadStore.referenceAnswer
  if (answer.status === 'error') return answer.error || '解析失败'
  if (answer.status === 'ready') {
    const answerCount = answer.meta?.answerCount || 0
    return `当前答案：${answer.name}（共${answerCount}道答案）`
  }
  return ''
})

const studentDisplayText = computed(() => {
  const student = uploadStore.studentAnswers
  if (student.status === 'error') return student.error || '解析失败'
  if (student.status === 'ready') {
    const studentCount = student.meta?.studentCount || 0
    const answerCount = student.meta?.answerCount || 0
    return `学生答案：${student.name}（${studentCount}名学生，${answerCount}个答案）`
  }
  return ''
})

// ===== 核心处理函数：统一的文件处理流程 =====
const processFile = async (file: File, type: 'paper' | 'answer' | 'student') => {
  try {
    console.log(`📁 开始处理${type}文件:`, file.name)

    // 1. 读取文件内容
    const content = await readFileContent(file)
    if (!content?.trim()) {
      throw new Error('文件内容为空或解析失败')
    }

    console.log(`📄 文件内容读取成功，长度: ${content.length}`)

    // 2. 根据类型设置上传状态
    if (type === 'paper') {
      uploadStore.setPaperUploading(file.name, content)
    } else if (type === 'answer') {
      uploadStore.setAnswerUploading(file.name, content)
    } else if (type === 'student') {
      uploadStore.setStudentUploading(file.name, content)
    }

    let parsedData

    // 3. 解析数据
    if (isJsonFile(file.name)) {
      // JSON 文件直接解析
      console.log(`🔍 检测到JSON文件，直接解析`)
      parsedData = JSON.parse(content)
      validateJsonData(parsedData, type as 'paper' | 'answer' | 'student')
    } else {
      // 非JSON文件使用AI解析
      console.log(`🤖 检测到非JSON文件，使用AI解析`)

      if (!uploadLLMService.isAvailable()) {
        throw new Error('AI解析服务不可用，请上传JSON格式文件或检查API配置')
      }

      // 学生答案文件通常应该是JSON格式，不支持AI解析
      if (type === 'student') {
        throw new Error('学生答案文件必须为JSON格式')
      }

      parsedData = await uploadLLMService.Parse(content, type)
      validateJsonData(parsedData, type as 'paper' | 'answer' | 'student')

      // 保存AI解析结果
      await askToSaveJsonResult(parsedData, file.name, type)
    }

    console.log(`✅ 数据解析成功:`, parsedData)

    // 4. 更新数据和状态
    if (type === 'paper') {
      examStore.setQuestions(parsedData.questions)
      uploadStore.setPaperReady(parsedData, {
        questionCount: parsedData.questions.length,
      })
      ElMessage.success(`试卷上传成功！共解析出 ${parsedData.questions.length} 道题目`)
    } else if (type === 'answer') {
      // 修复：使用正确的方法更新参考答案
      examStore.setReferenceAnswers(parsedData.answers)
      uploadStore.setAnswerReady(parsedData, {
        answerCount: parsedData.answers.length,
      })
      ElMessage.success(`参考答案上传成功！共 ${parsedData.answers.length} 道答案`)
      console.log('🔍 参考答案数据已设置:', parsedData.answers)
    } else if (type === 'student') {
      examStore.setStudentAnswers(parsedData)
      const uniqueStudentIds = [...new Set(parsedData.map((item: any) => item.student_id))]
      uploadStore.setStudentReady(parsedData, {
        studentCount: uniqueStudentIds.length,
        answerCount: parsedData.length,
      })
      ElMessage.success(
        `学生答案上传成功！共 ${uniqueStudentIds.length} 名学生，${parsedData.length} 个答案`,
      )
    }

    // 5. 保存到本地存储
    examStore.saveToLocal()
    uploadStore.saveToLocal()

    console.log(`💾 ${type} 数据已保存`)
  } catch (error: any) {
    console.error(`❌ ${type} 处理失败:`, error)

    // 设置错误状态
    const errorMessage = error.message || '未知错误'
    if (type === 'paper') {
      uploadStore.setPaperError(errorMessage)
    } else if (type === 'answer') {
      uploadStore.setAnswerError(errorMessage)
    } else if (type === 'student') {
      uploadStore.setStudentError(errorMessage)
    }

    const typeMap = {
      paper: '试卷',
      answer: '参考答案',
      student: '学生答案',
    }

    ElMessage.error(`${typeMap[type]}处理失败: ${errorMessage}`)

    // 保存错误状态到本地
    uploadStore.saveToLocal()
  }
}

// ===== 事件处理：超级简单 =====
const handlePaperSelected = (file: File) => {
  console.log('📝 选择试卷文件:', file.name)
  processFile(file, 'paper')
}

const handleAnswerSelected = (file: File) => {
  console.log('📝 选择参考答案文件:', file.name)
  processFile(file, 'answer')
}

const handleStudentSelected = (file: File) => {
  console.log('📝 选择学生答案文件:', file.name)
  processFile(file, 'student')
}

// ===== 移除操作 =====
const handlePaperRemove = () => {
  console.log('🗑️ 移除试卷')
  uploadStore.resetPaper()
  examStore.resetQuestions()

  // 保存状态
  examStore.saveToLocal()
  uploadStore.saveToLocal()

  ElMessage.success('试卷已移除')
}

const handleAnswerRemove = () => {
  console.log('🗑️ 移除参考答案')
  uploadStore.resetAnswer()
  examStore.clearReferenceAnswers()

  // 保存状态
  examStore.saveToLocal()
  uploadStore.saveToLocal()

  ElMessage.success('参考答案已移除')
}

const handleStudentRemove = () => {
  console.log('🗑️ 移除学生答案')
  uploadStore.resetStudent()
  examStore.resetStudentData()

  // 保存状态
  examStore.saveToLocal()
  uploadStore.saveToLocal()

  ElMessage.success('学生答案已移除')
}

// ===== 预览操作：极简版本 =====
const handlePaperPreview = () => {
  previewDialog.value = {
    visible: true,
    title: `试卷预览 - ${uploadStore.examPaper.name}`,
    content: uploadStore.examPaper.rawContent || '暂无内容',
  }
}

const handleAnswerPreview = () => {
  previewDialog.value = {
    visible: true,
    title: `参考答案预览 - ${uploadStore.referenceAnswer.name}`,
    content: uploadStore.referenceAnswer.rawContent || '暂无内容',
  }
}

const handleStudentPreview = () => {
  previewDialog.value = {
    visible: true,
    title: `学生答案预览 - ${uploadStore.studentAnswers.name}`,
    content: uploadStore.studentAnswers.rawContent || '暂无内容',
  }
}

// ===== 重置操作：一键搞定 =====
const resetAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有数据吗？这将清除所有已上传的文件和数据。',
      '确认重置',
      {
        confirmButtonText: '重置',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    console.log('🔄 开始重置所有数据')

    // 重置所有Store数据
    uploadStore.resetAll()
    examStore.resetAllData()

    // 保存到本地存储
    examStore.saveToLocal()
    uploadStore.saveToLocal()

    ElMessage.success('所有数据已重置')
    console.log('✅ 所有数据重置完成')
  } catch {
    // 用户取消操作
    console.log('❌ 用户取消重置操作')
  }
}

// ===== 初始化 =====
onMounted(() => {
  console.log('🚀 Uploading 组件初始化')

  // 从本地存储恢复数据
  examStore.loadFromLocal()
  uploadStore.loadFromLocal()

  console.log('📂 数据加载完成')
  console.log('📊 当前状态:', uploadStore.getUploadSummary())
})
</script>

<style scoped>
.uploading-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

/* 重置按钮容器 */
.reset-button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 重置按钮样式 */
.reset-button-container .el-button {
  background-color: #f97069;
  border-color: #f97069;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-button-container .el-button:hover {
  background-color: #ff2d20;
  border-color: #ff2d20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.reset-button-container .el-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .uploading-container {
    max-width: 100%;
    padding: 16px;
    gap: 20px;
  }

  .reset-button-container {
    margin-top: 24px;
  }

  .reset-button-container .el-button {
    padding: 12px 24px;
    font-size: 14px;
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  .uploading-container {
    padding: 12px;
    gap: 16px;
  }

  .reset-button-container {
    margin-top: 20px;
  }

  .reset-button-container .el-button {
    padding: 10px 20px;
    font-size: 14px;
    min-height: 40px;
  }
}
</style>
