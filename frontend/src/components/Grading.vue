<template>
  <div class="grading-page">
    
    <!-- 头部：题目选择、学生选择、统计信息 -->
    <grading-header
      class="grading-header-section"
      :current-question="currentQuestionId"
      :current-student-id="currentStudentId"
      :questions="questions"
      :student-list="studentList"
      :highlight-data-list="highlightDataList"
      @question-change="handleQuestionChange"
      @student-change="handleStudentChange"
      @show-current-question="showCurrentQuestion"
    />

    <!-- 第一行：评分区域 + 操作区域 (7:3) -->
    <div class="grading-row grading-row-top">
      <scoring-section
        class="grading-card scoring-card"
        :llm-score="currentLLMScore"
        @score-change="handleScoreChange"
      />
      <action-section
        class="grading-card action-card"
        @start-grading="startGrading"
        @batch-grading="handleBatchGrading"
      />
    </div>

    <!-- 第二行：预览 + 参考答案 + 反馈 (4:3:3) -->
    <div class="grading-row grading-row-main">
      <!-- 预览区域：工具栏 + 答案预览 -->
      <div class="grading-card preview-card">
        <highlight-toolbar
          class="preview-toolbar"
          ref="highlightToolbarRef"
          :paper-preview-ref="paperPreviewRef"
          @mark-answer="handleMarkAnswer"
        />
        <paper-preview
          class="preview-content"
          ref="paperPreviewRef"
          :student-answer="currentStudentAnswer"
          :highlight-data="currentHighlightData"
          @mark-answer="handleMarkAnswer"
          @highlight-clicked="handleHighlightClicked"
        />
      </div>

      <!-- 参考答案区域 -->
      <div class="grading-card reference-card">
        <div class="card-header">
          <h3>Reference Answer</h3>
        </div>
        <reference-answer 
          class="card-content"
          :reference-answer="currentReferenceAnswer" 
        />
      </div>

      <!-- 反馈区域 -->
      <div class="grading-card feedback-card">
        <div class="card-header">
          <h3>Score Reason</h3>
        </div>
        <feedback-panel
          class="card-content"
          ref="feedbackPanelRef"
          @modify-reason="handleModifyReason"
          @save-reason="handleSaveReason"
          @submit-reason="handleSubmitReason"
        />
      </div>
    </div>

    <!-- 当前题目弹窗 -->
    <el-dialog
      v-model="currentQuestionVisible"
      title="当前题目"
      width="50%"
      :close-on-click-modal="true"
    >
      <div class="current-question-content">
        {{ currentQuestionText }}
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="currentQuestionVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import GradingHeader from './grading/GradingHeader.vue'
import ScoringSection from './grading/ScoringSection.vue'
import ActionSection from './grading/ActionSection.vue'
import HighlightToolbar from './grading/HighlightToolbar.vue'
import PaperPreview from './grading/PaperPreview.vue'
import ReferenceAnswer from './grading/ReferenceAnswer.vue'
import FeedbackPanel from './grading/FeedbackPanel.vue'

/**
 * ===== 数据类型定义 =====
 */
interface Question {
  question_id: number
  question: string
  score: number
  referenceAnswer: string
}

interface StudentAnswer {
  student_id: number
  question_id: number
  answer: string
}

interface HighlightItem {
  'Student answer': string
  'Scoring point': number
  reason: string
}

interface HighlightData {
  student_id: number
  question_id: number
  answer: {
    correct: HighlightItem[]
    wrong: HighlightItem[]
    unclear: HighlightItem[]
    redundant: HighlightItem[]
  }
  total_score: number
}

interface StudentInfo {
  id: number
  total_score?: number
}

/**
 * ===== 核心状态：当前选中的学生和题目 =====
 */
const currentStudentId = ref<number>(1)
const currentQuestionId = ref<number>(1)

/**
 * ===== 数据存储：从文件加载的所有数据 =====
 */
const studentAnswers = ref<StudentAnswer[]>([])         
const studentList = ref<StudentInfo[]>([])              
const questions = ref<Question[]>([])                   
const highlightDataList = ref<HighlightData[]>([])      

/**
 * ===== UI 状态：弹窗控制 =====
 */
const currentQuestionVisible = ref(false)

/**
 * ===== 组件引用：用于调用子组件方法 =====
 */
const feedbackPanelRef = ref()
const paperPreviewRef = ref()
const highlightToolbarRef = ref()

/**
 * ===== 计算属性：基于当前学生和题目的数据 =====
 */
const currentReferenceAnswer = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.referenceAnswer || '暂无参考答案'
})

const currentQuestionText = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.question || '暂无题目内容'
})

const currentStudentAnswer = computed(() => {
  if (!currentStudentId.value || !currentQuestionId.value) {
    return '请先选择学生和题目'
  }

  const answer = studentAnswers.value.find(
    ans => ans.student_id === currentStudentId.value && 
           ans.question_id === currentQuestionId.value
  )
  
  return answer?.answer || '该学生未回答此题目'
})

const currentHighlightData = computed(() => {
  if (!currentStudentId.value || !currentQuestionId.value) {
    return null
  }

  const highlightData = highlightDataList.value.find(
    data => data.student_id === currentStudentId.value && 
            data.question_id === currentQuestionId.value
  )
  
  return highlightData || null
})

const currentLLMScore = computed(() => {
  const highlightData = currentHighlightData.value
  return highlightData?.total_score || 0
})

/**
 * ===== 数据加载：从静态文件加载试卷数据 =====
 */
const loadQuestions = async () => {
  try {
    const [paperResponse, answerResponse] = await Promise.all([
      fetch('/paper/example1/paper.json'),
      fetch('/paper/example1/answer.json')
    ])

    if (!paperResponse.ok || !answerResponse.ok) {
      throw new Error('无法加载题目文件')
    }

    const [paperData, answerData] = await Promise.all([
      paperResponse.json(),
      answerResponse.json()
    ])

    questions.value = paperData.map((question: any, index: number) => ({
      question_id: question.question_id,
      question: question.question,
      score: question.score || 0,
      referenceAnswer: answerData[index]?.answer || '暂无参考答案'
    }))

    console.log(`✅ 加载题目: ${questions.value.length} 道`)
  } catch (error) {
    console.error('❌ 加载题目失败:', error)
    ElMessage.error('无法读取题目文件')
    throw error
  }
}

const loadStudentAnswers = async () => {
  try {
    const response = await fetch('/paper/example1/student_answer.json')
    if (!response.ok) throw new Error('无法加载学生答案文件')

    const data: StudentAnswer[] = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('学生答案数据格式无效')
    }

    studentAnswers.value = data
    
    // 提取学生ID列表
    const uniqueStudentIds = [...new Set(data.map(item => item.student_id))]
    studentList.value = uniqueStudentIds.map(id => ({ id }))

    console.log(`✅ 加载学生答案: ${studentList.value.length} 个学生`)
  } catch (error) {
    console.error('❌ 加载学生答案失败:', error)
    ElMessage.error('无法读取学生答案文件')
    throw error
  }
}

const loadHighlightData = async () => {
  try {
    const response = await fetch('/paper/example1/student_answer_marked.json')
    if (!response.ok) {
      console.warn('⚠️ 未找到高亮数据文件，使用普通模式')
      return
    }

    const data: HighlightData[] = await response.json()
    if (!Array.isArray(data)) throw new Error('高亮数据格式无效')

    highlightDataList.value = data
    console.log(`✅ 加载高亮数据: ${data.length} 条`)
  } catch (error) {
    console.error('❌ 加载高亮数据失败:', error)
    ElMessage.warning('无法读取高亮数据文件，使用普通模式')
  }
}

/**
 * ===== 核心事件：学生和题目切换 =====
 */
const handleStudentChange = (studentId: number) => {
  if (studentId === currentStudentId.value) return
  currentStudentId.value = studentId
  ElMessage.success(`切换到学生 ${studentId}，分数: ${currentLLMScore.value}`)
}

const handleQuestionChange = (question: { id: number, name: string, score: number }) => {
  if (question.id === currentQuestionId.value) return
  currentQuestionId.value = question.id
  ElMessage.success(`切换到${question.name}，满分${question.score}分`)
}

const showCurrentQuestion = () => {
  if (!currentQuestionId.value) {
    ElMessage.warning('请先选择题目')
    return
  }
  currentQuestionVisible.value = true
}

/**
 * ===== 子组件间通信：事件转发 =====
 */
// 高亮点击 → 转发给 FeedbackPanel
const handleHighlightClicked = (data: any) => {
  feedbackPanelRef.value?.handleHighlightClicked(data)
}

// 标记答案 → 转发给 FeedbackPanel
const handleMarkAnswer = (data: any) => {
  feedbackPanelRef.value?.handleMarkAnswer(data)
}

/**
 * ===== 简单事件：只做消息提示 =====
 */
const startGrading = () => ElMessage.success('开始AI评分...')
const handleBatchGrading = () => ElMessage.success('开始批量评分')
const handleScoreChange = (data: { teacherScore: number, llmScore: number }) => {
  ElMessage.info(`教师评分: ${data.teacherScore}分 (LLM评分: ${data.llmScore}分)`)
}
const handleModifyReason = () => ElMessage.info('理由编辑模式')
const handleSaveReason = () => ElMessage.success('理由已保存')
const handleSubmitReason = () => ElMessage.success('理由已提交，重新评分中...')

/**
 * ===== 页面初始化：加载数据并设置默认值 =====
 */
onMounted(async () => {
  try {
    // 并行加载所有数据
    await Promise.all([
      loadQuestions(),
      loadStudentAnswers(),
      loadHighlightData()
    ])

    // 设置默认选中项
    if (questions.value.length > 0) {
      currentQuestionId.value = 1
    }
    if (studentList.value.length > 0) {
      currentStudentId.value = studentList.value[0].id
    }

    console.log('🎉 初始化完成')
  } catch (error) {
    console.error('💥 初始化失败:', error)
    ElMessage.error('初始化失败，请刷新重试')
  }
})
</script>

<style scoped>
/* ===== 主容器：垂直布局 ===== */
.grading-page {
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

/* ===== 头部区域 ===== */
.grading-header-section {
  /* GradingHeader 自己的样式已经包含了卡片样式 */
  flex-shrink: 0;
}

/* ===== 行容器：水平布局 ===== */
.grading-row {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.grading-row-top {
  height: 80px; /* 第一行固定高度 */
}

.grading-row-main {
  height: 500px;
  flex-shrink: 0;
  min-height: 500px; /* 允许内容滚动 */
}

/* ===== 通用卡片样式 ===== */
.grading-card {
  background: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.grading-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ===== 第一行卡片：评分 + 操作 (7:3) ===== */
.scoring-card {
  flex: 7;
  background: #F5F5F5;
}

.action-card {
  flex: 3;
  background: #F5F5F5;
}

/* ===== 第二行卡片：预览 + 参考答案 + 反馈 (4:3:3) ===== */
.preview-card {
  flex: 4;
  background: #FFFFFF;
}

.reference-card {
  flex: 3;
  background: #FFFFFF;
}

.feedback-card {
  flex: 3;
  background: #FFFFFF;
}

/* ===== 预览卡片内部布局 ===== */
.preview-toolbar {
  background: #F5F5F5;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.preview-content {
  background: #ffffff;
  flex: 1;
  color: rgba(0, 0, 0, 0.87);
  overflow-y: auto;
  min-height: 0;
}

/* ===== 卡片头部 ===== */
.card-header {
  padding: 16px 20px;
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

/* ===== 卡片内容 ===== */
.card-content {
  background: #ffffff;
  flex: 1;
  color: rgba(0, 0, 0, 0.87);
  overflow-y: auto;
  min-height: 0;
}

/* ===== 滚动条全局样式 ===== */
.grading-page :deep(*)::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.current-question-content {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  padding: 15px;
  border-radius: 8px;
  background: #FFFFFF;
  max-height: 400px;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.grading-page :deep(.el-dialog) {
  border-radius: 12px;
  background: #FFFFFF;
}

.grading-page :deep(.el-dialog__header) {
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
  padding: 16px 20px;
}

.grading-page :deep(.el-dialog__title) {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 600;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1080px) {
  .grading-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .grading-row-top {
    height: auto;
  }
  
  .grading-row-top .grading-card {
    height: 80px;
  }
  
  .grading-row-main .grading-card {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .grading-page {
    gap: 12px;
    padding: 12px;
  }
  
  .grading-row {
    gap: 8px;
  }
  
  .grading-row-top .grading-card {
    height: 70px;
  }
  
  .grading-row-main .grading-card {
    min-height: 250px;
  }
  
  .preview-toolbar {
    padding: 8px 12px;
    height: 48px;
    overflow-x: auto;
    overflow-y: hidden;
  }
}

@media (max-width: 480px) {
  .grading-page {
    gap: 8px;
    padding: 8px;
  }
}
</style>