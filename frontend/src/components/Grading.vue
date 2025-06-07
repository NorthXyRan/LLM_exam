<template>
  <div class="grading">
    
    <!-- 头部：题目选择、学生选择、统计信息（自治组件） -->
    <grading-header
      :current-question="currentQuestionId"
      :current-student-id="currentStudentId"
      :questions="questions"
      :student-list="studentList"
      :highlight-data-list="highlightDataList"
      @question-change="handleQuestionChange"
      @student-change="handleStudentChange"
      @show-current-question="showCurrentQuestion"
    />

    <!-- 主体：评分界面 -->
    <div class="page-content">
      <div class="content-grid">
        
        <!-- 评分区域 -->
        <div class="scoring-area">
          <div class="area-card">
            <scoring-section
              :llm-score="currentLLMScore"
              @score-change="handleScoreChange"
            />
          </div>
        </div>

        <!-- 操作区域 -->
        <div class="action-area">
          <div class="area-card">
            <action-section
              @start-grading="startGrading"
              @batch-grading="handleBatchGrading"
            />
          </div>
        </div>

        <!-- 预览区域：工具栏 + 学生答案预览（自治组件） -->
        <div class="preview-area">
          <div class="area-card">
            <highlight-toolbar
              ref="highlightToolbarRef"
              :paper-preview-ref="paperPreviewRef"
              @mark-answer="handleMarkAnswer"
            />
            <paper-preview
              ref="paperPreviewRef"
              :student-answer="currentStudentAnswer"
              :highlight-data="currentHighlightData"
              @mark-answer="handleMarkAnswer"
              @highlight-clicked="handleHighlightClicked"
            />
          </div>
        </div>

        <!-- 参考答案区域 -->
        <div class="reference-area">
          <div class="area-card">
            <div class="reference-header">
              <h3>Reference Answer</h3>
            </div>
            <reference-answer :reference-answer="currentReferenceAnswer" />
          </div>
        </div>

        <!-- 反馈区域：理由查看和编辑（自治组件） -->
        <div class="feedback-area">
          <div class="area-card">
            <div class="feedback-header">
              <h3>Score Reason</h3>
            </div>
            <feedback-panel
              ref="feedbackPanelRef"
              @modify-reason="handleModifyReason"
              @save-reason="handleSaveReason"
              @submit-reason="handleSubmitReason"
            />
          </div>
        </div>
        
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
/* ===== 主容器布局 ===== */
.grading {
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

/* ===== 主体内容区域 ===== */
.page-content {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E5E5;
  overflow: hidden;
  background: #FFFFFF;
}

/* ===== 网格布局：2行10列 ===== */
.content-grid {
  display: grid;
  grid-template-areas: 
    "scoring scoring scoring scoring scoring scoring scoring action action action"
    "preview preview preview preview reference reference reference feedback feedback feedback";
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: 80px 1fr;
  gap: 16px;
  height: 85vh;
  padding: 16px;
}

/* ===== 网格区域分配 ===== */
.scoring-area { grid-area: scoring; }
.action-area { grid-area: action; }
.preview-area { grid-area: preview; }
.reference-area { grid-area: reference; }
.feedback-area { grid-area: feedback; }

/* ===== 卡片容器 ===== */
.area-card {
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.2s ease;
}

.area-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 预览和参考答案区域使用白色背景 */
.preview-area .area-card,
.reference-area .area-card {
  background: #FFFFFF;
}

/* ===== 子组件容器 ===== */
.preview-area,
.reference-area,
.feedback-area {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.preview-area .area-card,
.reference-area .area-card,
.feedback-area .area-card {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* ===== 子组件样式重置 ===== */
.scoring-area :deep(.scoring-section),
.action-area :deep(.action-section) {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.feedback-area :deep(.feedback-panel) {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  flex: 1;
  border-radius: 0 0 12px 12px;
  overflow-y: auto;
  min-height: 0;
}

.preview-area :deep(.highlight-toolbar) {
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

.preview-area :deep(.paper-preview) {
  background: #ffffff;
  flex: 1;
  color: rgba(0, 0, 0, 0.87);
  overflow-y: auto;
  min-height: 0;
}

.reference-area :deep(.reference-answer) {
  background: #ffffff;
  flex: 1;
  color: rgba(0, 0, 0, 0.87);
  overflow-y: auto;
  min-height: 0;
}

/* ===== 区域标题 ===== */
.reference-header,
.feedback-header {
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

.reference-header h3,
.feedback-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

/* ===== 滚动条样式 ===== */
.content-grid :deep(*)::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

/* ===== 弹窗样式 ===== */
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

.grading :deep(.el-dialog) {
  border-radius: 12px;
  background: #FFFFFF;
}

.grading :deep(.el-dialog__header) {
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
  padding: 16px 20px;
}

.grading :deep(.el-dialog__title) {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 600;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1080px) {
  .content-grid {
    grid-template-areas:
      "scoring"
      "action"
      "preview"
      "reference"
      "feedback";
    grid-template-columns: 1fr;
    grid-template-rows: 80px 80px 1fr 1fr 1fr;
    gap: 12px;
    height: 90vh;
  }
}

@media (max-width: 768px) {
  .grading {
    gap: 12px;
    padding: 12px;
  }
  
  .content-grid {
    padding: 12px;
    gap: 8px;
    grid-template-rows: 70px 70px 1fr 1fr 1fr;
    height: 95vh;
  }
  
  .preview-area :deep(.highlight-toolbar) {
    padding: 8px 12px;
    height: 48px;
    overflow-x: auto;
    overflow-y: hidden;
  }
}

@media (max-width: 480px) {
  .grading {
    gap: 8px;
    padding: 8px;
  }
}
</style>