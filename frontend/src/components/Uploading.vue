<template>
  <div class="uploading-container">
    <!-- Paper Upload Component -->
    <PaperUpload 
      :exam-paper="examPaper"
      @paper-uploaded="handlePaperUploaded"
      @paper-removed="handlePaperRemoved"
      @preview-paper="handlePreviewPaper"
      @reparse-paper="handleReparsePaper"
    />

    <!-- Answer Upload Component -->
    <AnswerUpload 
      :reference-answer="referenceAnswer"
      :exam-paper="examPaper"
      :disabled="!examPaper.name"
      @answer-uploaded="handleAnswerUploaded"
      @answer-removed="handleAnswerRemoved"
      @preview-answer="handlePreviewAnswer"
      @edit-answer="handleEditAnswer"
    />

    <!-- Student Upload Component -->
    <StudentUpload 
      :student-papers="studentPapers"
      :parsing="parsing"
      :disabled="!canUploadStudentPapers"
      :exam-paper="examPaper"
      @papers-uploaded="handleStudentPapersUploaded"
      @reparse-paper="handleReParseStudentPaper"
    />

    <!-- 独立的重置按钮 -->
    <div class="reset-button-container">
      <el-button type="danger" @click="resetAll">Reset</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import AnswerUpload from './upload/AnswerUpload.vue'
import PaperUpload from './upload/PaperUpload.vue'
import StudentUpload from './upload/StudentUpload.vue'

// 试卷相关数据
const examPaper = ref({
  name: '',
  status: '',
  questionCount: 0
})

// 参考答案相关数据
const referenceAnswer = ref({
  name: '',
  status: '',
  matched: false,
  answerCount: 0
})

// 学生答卷相关数据
interface StudentPaper {
  id: number
  filename: string
  valid: boolean
  questionCount: number
  error: string
}

const studentPapers = ref<StudentPaper[]>([])
const parsing = ref(false)

// 计算属性
const canUploadStudentPapers = computed(() => {
  return examPaper.value.status === 'ready' && referenceAnswer.value.status === 'ready'
})

// Paper 相关事件处理
const handlePaperUploaded = (file: File) => {
  ElMessage.info('开始解析试卷...')
  setTimeout(() => {
    examPaper.value = {
      name: file.name,
      status: 'ready',
      questionCount: 5
    }
    resetAnswerAndStudents()
    ElMessage.success('试卷解析完成！')
  }, 2000)
}

const handlePaperRemoved = () => {
  examPaper.value = {
    name: '',
    status: '',
    questionCount: 0
  }
  resetAnswerAndStudents()
  ElMessage.info('已移除试卷文件')
}

const handlePreviewPaper = () => {
  ElMessage.info('打开试卷预览')
}

const handleReparsePaper = () => {
  ElMessage.info('重新解析试卷')
}

// Answer 相关事件处理
const handleAnswerUploaded = (file: File) => {
  ElMessage.info('开始解析参考答案...')
  setTimeout(() => {
    const matched = Math.random() > 0.3
    referenceAnswer.value = {
      name: file.name,
      status: 'ready',
      matched: matched,
      answerCount: matched ? examPaper.value.questionCount : examPaper.value.questionCount - 1
    }
    studentPapers.value = []
    if (matched) {
      ElMessage.success('参考答案解析完成，与试卷匹配！')
    } else {
      ElMessage.warning('参考答案解析完成，但与试卷题目不完全匹配！')
    }
  }, 2000)
}

const handleAnswerRemoved = () => {
  referenceAnswer.value = {
    name: '',
    status: '',
    matched: false,
    answerCount: 0
  }
  studentPapers.value = []
  ElMessage.info('已移除答案文件')
}

const handlePreviewAnswer = () => {
  ElMessage.info('打开答案预览')
}

const handleEditAnswer = () => {
  ElMessage.info('打开答案编辑')
}

// Student 相关事件处理
const handleStudentPapersUploaded = (fileList: File[]) => {
  parsing.value = true
  ElMessage.info('开始解析学生答卷...')
  
  setTimeout(() => {
    const newPapers = fileList.map((f: File, index: number) => ({
      id: Date.now() + index,
      filename: f.name,
      valid: Math.random() > 0.2,
      questionCount: examPaper.value.questionCount,
      error: Math.random() > 0.2 ? '' : '缺少第2题'
    }))
    
    studentPapers.value = newPapers
    parsing.value = false
    
    const validCount = newPapers.filter((p: any) => p.valid).length
    ElMessage.success(`学生答卷解析完成！成功解析 ${validCount}/${newPapers.length} 份`)
  }, 3000)
}

const handleReParseStudentPaper = (paper: any) => {
  ElMessage.info(`重新解析 ${paper.filename}`)
}

// 合并重置方法
const resetAnswerAndStudents = () => {
  referenceAnswer.value = {
    name: '',
    status: '',
    matched: false,
    answerCount: 0
  }
  studentPapers.value = []
}

// 全部重置
const resetAll = () => {
  ElMessageBox.confirm('确定要重置所有设置吗？', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    examPaper.value = { name: '', status: '', questionCount: 0 }
    resetAnswerAndStudents()
    ElMessage.success('已重置所有设置')
  })
}
</script>

<style scoped>
.uploading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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