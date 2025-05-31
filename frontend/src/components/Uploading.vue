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

    <!-- Bottom Actions -->
    <div class="bottom-actions">
      <el-button 
        v-if="allReady" 
        type="primary" 
        size="large"
        @click="startGrading"
      >
        开始批改 ({{ validStudentPapers }}份答卷)
      </el-button>
      <el-button @click="resetAll">重置全部</el-button>
    </div>
  </div>
</template>

<script setup>
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
const studentPapers = ref([])
const parsing = ref(false)

// 计算属性
const canUploadStudentPapers = computed(() => {
  return examPaper.value.status === 'ready' && referenceAnswer.value.status === 'ready'
})

const validStudentPapers = computed(() => {
  return studentPapers.value.filter(paper => paper.valid).length
})

const allReady = computed(() => {
  return canUploadStudentPapers.value && validStudentPapers.value > 0
})

// Paper 相关事件处理
const handlePaperUploaded = (file) => {
  ElMessage.info('开始解析试卷...')
  setTimeout(() => {
    examPaper.value = {
      name: file.name,
      status: 'ready',
      questionCount: 5
    }
    resetAnswerState()
    ElMessage.success('试卷解析完成！')
  }, 2000)
}

const handlePaperRemoved = () => {
  examPaper.value = {
    name: '',
    status: '',
    questionCount: 0
  }
  resetAnswerState()
  ElMessage.info('已移除试卷文件')
}

const handlePreviewPaper = () => {
  ElMessage.info('打开试卷预览')
}

const handleReparsePaper = () => {
  ElMessage.info('重新解析试卷')
}

// Answer 相关事件处理
const handleAnswerUploaded = (file) => {
  ElMessage.info('开始解析参考答案...')
  setTimeout(() => {
    const matched = Math.random() > 0.3
    referenceAnswer.value = {
      name: file.name,
      status: 'ready',
      matched: matched,
      answerCount: matched ? examPaper.value.questionCount : examPaper.value.questionCount - 1
    }
    resetStudentPapers()
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
  resetStudentPapers()
  ElMessage.info('已移除答案文件')
}

const handlePreviewAnswer = () => {
  ElMessage.info('打开答案预览')
}

const handleEditAnswer = () => {
  ElMessage.info('打开答案编辑')
}

// Student 相关事件处理
const handleStudentPapersUploaded = (fileList) => {
  parsing.value = true
  ElMessage.info('开始解析学生答卷...')
  
  setTimeout(() => {
    const newPapers = fileList.map((f, index) => ({
      id: Date.now() + index,
      filename: f.name,
      valid: Math.random() > 0.2,
      questionCount: examPaper.value.questionCount,
      error: Math.random() > 0.2 ? '' : '缺少第2题'
    }))
    
    studentPapers.value = newPapers
    parsing.value = false
    
    const validCount = newPapers.filter(p => p.valid).length
    ElMessage.success(`学生答卷解析完成！成功解析 ${validCount}/${newPapers.length} 份`)
  }, 3000)
}

const handleReParseStudentPaper = (paper) => {
  ElMessage.info(`重新解析 ${paper.filename}`)
}

// 重置方法
const resetAnswerState = () => {
  referenceAnswer.value = {
    name: '',
    status: '',
    matched: false,
    answerCount: 0
  }
}

const resetStudentPapers = () => {
  studentPapers.value = []
}

const resetAll = () => {
  ElMessageBox.confirm('确定要重置所有设置吗？', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    examPaper.value = { name: '', status: '', questionCount: 0 }
    resetAnswerState()
    resetStudentPapers()
    ElMessage.success('已重置所有设置')
  })
}

// 开始批改
const startGrading = () => {
  ElMessage.success(`准备批改 ${validStudentPapers.value} 份答卷`)
  // 这里可以触发路由跳转到批改界面
  // $router.push('/grading')
}
</script>

<style scoped>
.uploading-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;  /* 上传组件之间的间距 */
}

.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  border-radius: 12px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.bottom-actions .el-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.bottom-actions .el-button--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.bottom-actions .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.bottom-actions .el-button--default {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.bottom-actions .el-button--default:hover {
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .uploading-container {
    max-width: 100%;
    padding: 16px;
    gap: 20px;
  }
  
  .bottom-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .bottom-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .uploading-container {
    padding: 12px;
    gap: 16px;
  }
}
</style>