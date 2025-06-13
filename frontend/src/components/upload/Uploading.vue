<template>
  <div class="uploading-container">
    <!-- Paper Upload Component -->
    <PaperUpload
      :exam-paper="uploadStatusStore.examPaper"
      :reset-trigger="resetTrigger"
      @paper-uploaded="handlePaperUploaded"
      @paper-removed="handlePaperRemoved"
      @preview-paper="handlePreviewPaper"
    />

    <!-- Answer Upload Component -->
    <AnswerUpload
      :reference-answer="uploadStatusStore.referenceAnswer"
      :disabled="!uploadStatusStore.isPaperUploaded"
      :reset-trigger="resetTrigger"
      @answer-uploaded="handleAnswerUploaded"
      @answer-removed="handleAnswerRemoved"
      @preview-answer="handlePreviewAnswer"
    />

    <!-- Student Upload Component -->
    <StudentUpload
      :student-papers="uploadStatusStore.studentAnswers.papers"
      :disabled="!uploadStatusStore.canUploadStudentPapers"
      :reset-trigger="resetTrigger"
      @papers-uploaded="handleStudentPapersUploaded"
      @preview-papers="handlePreviewStudentPapers"
    />

    <!-- 独立的重置按钮 -->
    <div class="reset-button-container">
      <el-button type="danger" @click="resetAll">Reset</el-button>
    </div>

    <!-- 预览弹窗 -->
    <Preview
      v-model:visible="previewDialog.visible"
      :file-name="previewDialog.fileName"
      :content="previewDialog.content"
      :data-type="previewDialog.dataType"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { validateJsonData } from '../../services/file/fileReaders.ts'
import AnswerUpload from './AnswerUpload.vue'
import PaperUpload from './PaperUpload.vue'
import Preview from './preview.vue'
import StudentUpload from './StudentUpload.vue'

import { useExamDataStore } from '../../stores/useExamDataStore'
import { useUploadStatusStore } from '../../stores/useUploadStatusStore'

// 使用分离的 Store
const examDataStore = useExamDataStore()
const uploadStatusStore = useUploadStatusStore()

// 重置标志，用于通知子组件清空文件列表
const resetTrigger = ref(0)

// 预览弹窗状态
const previewDialog = ref({
  visible: false,
  fileName: '',
  content: '',
  dataType: '', // 'paper', 'answer', 'student'
})

// ===== 数据验证和处理函数 =====
const processPaperData = (content: string, fileName: string) => {
  const paperJsonData = JSON.parse(content)
  validateJsonData(paperJsonData, 'paper')

  const mappedQuestions = paperJsonData.questions.map((question: any) => ({
    question_id: question.question_id,
    question: question.question,
    score: question.score,
  }))

  return {
    fileName,
    questionCount: paperJsonData.questions.length,
    questions: mappedQuestions,
    content: content,
  }
}

const processAnswerData = (content: string, fileName: string) => {
  const answerJsonData = JSON.parse(content)
  validateJsonData(answerJsonData, 'answer')

  return {
    fileName,
    answerCount: answerJsonData.answers.length,
    answers: answerJsonData.answers,
  }
}

const processStudentData = (content: string, fileName: string) => {
  const studentJsonData = JSON.parse(content)
  validateJsonData(studentJsonData, 'student')

  const uniqueStudentIds = [...new Set(studentJsonData.map((item: any) => item.student_id))]

  return {
    fileName,
    studentCount: uniqueStudentIds.length,
    answerCount: studentJsonData.length,
    answers: studentJsonData,
    students: uniqueStudentIds.map((id) => ({ id })),
  }
}

// ===== 试卷相关事件处理 =====
const handlePaperUploaded = async (paperData: any) => {
  try {
    console.log('✅ 收到试卷数据:', paperData)

    if (!paperData.content) {
      throw new Error('试卷数据内容为空')
    }

    const result = processPaperData(paperData.content, paperData.name)

    // 设置题目数据
    examDataStore.setQuestions(result.questions)

    // 更新上传状态
    uploadStatusStore.setPaperStatus({
      name: result.fileName,
      status: 'ready',
      questionCount: result.questionCount,
      content: result.content,
    })

    // 保存到本地
    examDataStore.saveToLocal()
    uploadStatusStore.saveToLocal()

    ElMessage.success(`试卷数据验证成功！共解析出 ${result.questionCount} 道题目`)
    console.log('✅ 试卷数据已保存到store')
  } catch (error) {
    console.error('❌ 处理试卷上传失败:', error)
    ElMessage.error(`试卷上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

const handlePaperRemoved = () => {
  // 重置所有相关数据
  examDataStore.resetAllData()
  uploadStatusStore.resetAllStatus()

  // 保存状态
  examDataStore.saveToLocal()
  uploadStatusStore.saveToLocal()

  ElMessage.success('试卷已移除')
}

const handlePreviewPaper = (errorData?: any) => {
  if (errorData?.isError) {
    // 错误状态预览原始文件内容
    previewDialog.value = {
      visible: true,
      fileName: errorData.fileName,
      content: errorData.content,
      dataType: 'paper',
    }
  } else {
    // 正常状态预览
    previewDialog.value = {
      visible: true,
      fileName: uploadStatusStore.examPaper.name,
      content: uploadStatusStore.examPaper.content || '',
      dataType: 'paper',
    }
  }
}

// ===== 参考答案相关事件处理 =====
const handleAnswerUploaded = async (answerData: any) => {
  try {
    console.log('✅ 收到参考答案数据:', answerData)

    if (!answerData.content) {
      throw new Error('参考答案数据内容为空')
    }

    const result = processAnswerData(answerData.content, answerData.name)

    // 更新参考答案
    examDataStore.updateReferenceAnswers(result.answers)

    // 更新上传状态
    uploadStatusStore.setReferenceAnswerStatus({
      name: result.fileName,
      status: 'ready',
      matched: true,
      answerCount: result.answerCount,
    })

    // 保存到本地
    examDataStore.saveToLocal()
    uploadStatusStore.saveToLocal()

    ElMessage.success(`参考答案验证成功！共 ${result.answerCount} 道题目的答案`)
    console.log('✅ 参考答案数据已保存到store')
  } catch (error) {
    console.error('❌ 处理参考答案上传失败:', error)
    ElMessage.error(`参考答案上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

const handleAnswerRemoved = () => {
  // 只清除参考答案数据，不动学生数据
  examDataStore.clearReferenceAnswers()

  // 重置参考答案上传状态
  uploadStatusStore.resetReferenceAnswerStatus()

  // 保存状态
  examDataStore.saveToLocal()
  uploadStatusStore.saveToLocal()

  ElMessage.success('参考答案已移除')
}

const handlePreviewAnswer = (errorData?: any) => {
  if (errorData?.isError) {
    // 错误状态预览原始文件内容
    previewDialog.value = {
      visible: true,
      fileName: errorData.fileName,
      content: errorData.content,
      dataType: 'answer',
    }
  } else {
    // 正常状态预览
    previewDialog.value = {
      visible: true,
      fileName: uploadStatusStore.referenceAnswer.name,
      content: JSON.stringify(
        {
          answerCount: uploadStatusStore.referenceAnswer.answerCount,
          answers: examDataStore.referenceAnswers,
        },
        null,
        2,
      ),
      dataType: 'answer',
    }
  }
}

// ===== 学生答案相关事件处理 =====
const handleStudentPapersUploaded = async (paperData: any) => {
  try {
    console.log('✅ 收到学生答案数据:', paperData)

    // 检查是否是移除操作
    if (paperData.removed) {
      // 重置学生数据
      examDataStore.resetStudentData()
      uploadStatusStore.resetStudentAnswersStatus()

      // 保存状态
      examDataStore.saveToLocal()
      uploadStatusStore.saveToLocal()

      ElMessage.success('学生答案已移除')
      console.log('✅ 学生数据已重置')
      return
    }

    if (!paperData.content) {
      throw new Error('学生答案数据内容为空')
    }

    const result = processStudentData(paperData.content, paperData.name)

    // 保存学生答案数据
    examDataStore.setStudentAnswers(result.answers)

    // 更新上传状态
    uploadStatusStore.setStudentAnswersStatus({
      name: result.fileName,
      studentCount: result.studentCount,
      answerCount: result.answerCount,
      answers: result.answers,
    })

    // 保存到本地
    examDataStore.saveToLocal()
    uploadStatusStore.saveToLocal()

    ElMessage.success(
      `学生答案验证成功！共 ${result.studentCount} 名学生，${result.answerCount} 个答案`,
    )
    console.log('✅ 学生答案数据已保存到store')
  } catch (error) {
    console.error('❌ 处理学生答案上传失败:', error)
    ElMessage.error(`学生答案上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

const handlePreviewStudentPapers = (errorData?: any) => {
  if (errorData?.isError) {
    // 错误状态预览原始文件内容
    previewDialog.value = {
      visible: true,
      fileName: errorData.fileName,
      content: errorData.content,
      dataType: 'student',
    }
  } else {
    // 正常状态预览
    const studentAnswers = examDataStore.studentAnswers
    previewDialog.value = {
      visible: true,
      fileName: '学生答案数据',
      content: JSON.stringify(studentAnswers, null, 2),
      dataType: 'student',
    }
  }
}

// ===== 重置所有数据 =====
const resetAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有数据吗？这将清除所有已上传的文件和数据。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 重置所有store
    examDataStore.resetAllData()
    uploadStatusStore.resetAllStatus()

    // 触发子组件重置文件列表
    resetTrigger.value++

    // 保存到本地存储
    examDataStore.saveToLocal()
    uploadStatusStore.saveToLocal()

    ElMessage.success('所有数据已重置')
    console.log('✅ 所有数据已重置')
  } catch {
    ElMessage.info('已取消重置操作')
  }
}

// ===== 初始化 =====
onMounted(() => {
  examDataStore.loadFromLocal()
  uploadStatusStore.loadFromLocal()

  console.log('📂 Uploading页面初始化完成')
})
</script>

<style scoped>
.uploading-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 重置按钮容器 */
.reset-button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 自定义重置按钮样式 */
.reset-button-container :deep(.el-button--danger) {
  background-color: #f97069;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  transition: all 0.2s ease;
}

.reset-button-container :deep(.el-button--danger:hover) {
  background-color: #ff2d20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.reset-button-container :deep(.el-button--danger:active) {
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
}

@media (max-width: 480px) {
  .uploading-container {
    padding: 12px;
    gap: 16px;
  }

  .reset-button-container {
    margin-top: 20px;
  }
}
</style>
