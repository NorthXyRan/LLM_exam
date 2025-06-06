<template>
  <div class="grading">
    <!-- 评分页面头部：题目选择、学生选择、统计信息 -->
    <grading-header
      :current-question="currentQuestionId"
      :current-student-id="currentStudentId"
      :questions="questions"
      :total-students="studentList.length"
      :graded-count="gradedCount"
      :graded-papers="gradedPapers"
      :statistics="statisticsData"
      :student-list="studentList"
      @question-change="handleQuestionChange"
      @student-change="handleStudentChange"
      @show-current-question="showCurrentQuestion"
    />
    
    <!-- 评分页面主体：评分区域、试卷预览、操作工具 -->
    <grading-page-content
      :paper-info="currentPaperInfo"
      :llm-score="currentLLMScore"
      :max-score="currentMaxScore"
      :student-answer="currentStudentAnswer"
      :highlight-data="currentHighlightData"
      :reference-answer="currentReferenceAnswer"
      @start-grading="startGrading"
      @mark-answer="handleMarkAnswer"
      @score-change="handleScoreChange"
      @erase-marks="handleEraseMarks"
      @clear-all="handleClearAll"
    />

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
import { useRouter } from 'vue-router'
import GradingHeader from './grading/GradingHeader.vue'
import GradingPageContent from './grading/GradingPageContent.vue'

/**
 * ===== TypeScript 接口定义 =====
 */

// 题目接口
interface Question {
  question_id: number
  question: string
  score: number
  referenceAnswer: string
}

// 学生答案接口
interface StudentAnswer {
  student_id: number
  question_id: number
  answer: string
}

// 高亮数据接口
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

// 学生评分接口
interface StudentScore {
  student_id: number
  question_id: number
  llm_score?: number
  teacher_score?: number
  final_score: number
  is_graded: boolean
}

// 学生信息接口
interface StudentInfo {
  id: number
  total_score?: number
}

/**
 * ===== Vue 路由 =====
 */
const router = useRouter()

/**
 * ===== 核心状态管理 =====
 */
const currentStudentId = ref<number>(1)
const currentQuestionId = ref<number>(1)

/**
 * ===== 主要数据存储 =====
 */
const studentAnswers = ref<StudentAnswer[]>([])
const studentList = ref<StudentInfo[]>([])
const questions = ref<Question[]>([])
const highlightDataList = ref<HighlightData[]>([])

/**
 * ===== 弹窗状态控制 =====
 */
const referenceAnswerVisible = ref(false)
const currentQuestionVisible = ref(false)

/**
 * ===== 计算属性 =====
 */
const currentPaperInfo = computed(() => {
  const currentStudent = studentList.value.find(s => s.id === currentStudentId.value)
  return {
    studentId: currentStudent?.id || undefined
  }
})

const currentMaxScore = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.score || 0
})

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

// 当前高亮数据
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

// 当前LLM分数 - 从高亮数据中获取
const currentLLMScore = computed(() => {
  const highlightData = currentHighlightData.value
  return highlightData?.total_score || 0
})

// 统计信息计算
const statisticsData = computed(() => {
  // 获取当前题目的所有学生分数
  const currentQuestionScores = highlightDataList.value
    .filter(data => data.question_id === currentQuestionId.value)
    .map(data => ({
      studentId: data.student_id,
      score: data.total_score
    }))

  if (currentQuestionScores.length === 0) {
    return {
      highest: 0,
      lowest: 0,
      average: 0,
      highestStudent: { id: undefined },
      lowestStudent: { id: undefined }
    }
  }

  // 计算最高分、最低分、平均分
  const scores = currentQuestionScores.map(item => item.score)
  const highest = Math.max(...scores)
  
  const lowest = Math.min(...scores)
  const average = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10

  // 找到最高分和最低分对应的学生
  const highestStudent = currentQuestionScores.find(item => item.score === highest)
  const lowestStudent = currentQuestionScores.find(item => item.score === lowest)

  return {
    highest,
    lowest,
    average,
    highestStudent: { id: highestStudent?.studentId },
    lowestStudent: { id: lowestStudent?.studentId }
  }
})

// 已批改数据计算
const gradedCount = computed(() => {
  return highlightDataList.value
    .filter(data => data.question_id === currentQuestionId.value)
    .length
})

const gradedPapers = computed(() => {
  return highlightDataList.value
    .filter(data => data.question_id === currentQuestionId.value)
    .map(data => data.student_id)
})

/**
 * ===== 数据加载函数 =====
 */

/**
 * 加载题目和参考答案数据
 */
const loadQuestions = async () => {
  try {
    const [paperResponse, answerResponse] = await Promise.all([
      fetch('/paper/example1/paper.json'),
      fetch('/paper/example1/answer.json')
    ])

    if (!paperResponse.ok) {
      throw new Error(`题目文件不存在或无法访问: ${paperResponse.status}`)
    }
    if (!answerResponse.ok) {
      throw new Error(`答案文件不存在或无法访问: ${answerResponse.status}`)
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

    console.log(`成功加载 ${questions.value.length} 道题目`)
  } catch (error) {
    console.error('加载题目失败:', error)
    ElMessage.error('无法读取题目文件，请检查文件是否存在')
    throw error
  }
}

/**
 * 加载学生答案数据
 */
const loadStudentAnswers = async () => {
  try {
    const response = await fetch('/paper/example1/student_answer.json')
    
    if (!response.ok) {
      throw new Error(`学生答案文件不存在或无法访问: ${response.status}`)
    }

    const data: StudentAnswer[] = await response.json()
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('学生答案数据格式无效或为空')
    }

    studentAnswers.value = data

    const uniqueStudentIds = [...new Set(data.map(item => item.student_id))]
    studentList.value = uniqueStudentIds.map(id => ({ id }))

    console.log(`成功加载 ${studentList.value.length} 个学生的答案数据`)
  } catch (error) {
    console.error('加载学生答案失败:', error)
    ElMessage.error('无法读取学生答案文件，请检查文件是否存在')
    throw error
  }
}

/**
 * 加载高亮标记数据
 */
const loadHighlightData = async () => {
  try {
    const response = await fetch('/paper/example1/student_answer_marked.json')
    
    if (!response.ok) {
      console.warn('未找到高亮标记数据文件，将使用普通模式')
      return
    }

    const data: HighlightData[] = await response.json()
    
    if (!Array.isArray(data)) {
      throw new Error('高亮数据格式无效')
    }

    highlightDataList.value = data
    console.log(`成功加载 ${data.length} 条高亮标记数据`)
    
    // 统计信息
    const questionScores = data.filter(item => item.question_id === 1).map(item => item.total_score)
    if (questionScores.length > 0) {
      console.log('第1题统计:', {
        最高分: Math.max(...questionScores),
        最低分: Math.min(...questionScores),
        平均分: Math.round((questionScores.reduce((sum, score) => sum + score, 0) / questionScores.length) * 10) / 10,
        参与学生数: questionScores.length
      })
    }
  } catch (error) {
    console.error('加载高亮数据失败:', error)
    ElMessage.warning('无法读取高亮标记文件，将使用普通模式')
  }
}

/**
 * ===== 页面初始化 =====
 */
onMounted(async () => {
  try {
    await Promise.all([
      loadQuestions(),
      loadStudentAnswers(),
      loadHighlightData()
    ])

    if (questions.value.length > 0) {
      currentQuestionId.value = 1
    }
    if (studentList.value.length > 0) {
      currentStudentId.value = studentList.value[0].id
    }
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('加载试卷数据失败，请刷新页面重试')
  }
})

/**
 * ===== 事件处理函数 =====
 */

const handleStudentChange = (studentId: number) => {
  if (studentId === currentStudentId.value) {
    return
  }

  currentStudentId.value = studentId
  ElMessage.success(`切换到学生ID: ${studentId}，分数: ${currentLLMScore.value}`)
}

const handleQuestionChange = (question: { id: number, name: string, score: number }) => {
  if (question.id === currentQuestionId.value) {
    return
  }

  currentQuestionId.value = question.id
  
  // 显示当前题目的统计信息
  const stats = statisticsData.value
  ElMessage.success(`切换到${question.name}，满分${question.score}分
    最高分: ${stats.highest} | 最低分: ${stats.lowest} | 平均分: ${stats.average}`)
}

const startGrading = () => {
  if (!currentStudentId.value || !currentQuestionId.value) {
    ElMessage.warning('请先选择学生和题目')
    return
  }

  ElMessage.success('开始AI评分...')
}

const handleMarkAnswer = (data: { 
  text: string, 
  type: 'correct' | 'wrong' | 'unclear' | 'redundant' 
}) => {
  ElMessage.success(`标记文本："${data.text.substring(0, 30)}..." 为 ${data.type}`)
  console.log('答案标记:', data)
}

const handleScoreChange = (data: { teacherScore: number, llmScore: number }) => {
  ElMessage.info(`教师评分: ${data.teacherScore}分 (LLM评分: ${data.llmScore}分)`)
  console.log('评分变化:', data)
}

const handleEraseMarks = () => {
  ElMessage.success('擦除所有标记')
}

const handleClearAll = () => {
  ElMessage.success('清除所有数据')
}

/**
 * ===== 弹窗控制函数 =====
 */
const showReferenceAnswer = () => {
  if (!currentQuestionId.value) {
    ElMessage.warning('请先选择题目')
    return
  }
  referenceAnswerVisible.value = true
}

const showCurrentQuestion = () => {
  if (!currentQuestionId.value) {
    ElMessage.warning('请先选择题目')
    return
  }
  currentQuestionVisible.value = true
}
</script>

<style scoped>
.grading {
  min-height: 100vh;
  background: #F5F5F5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

@media (max-width: 768px) {
  .grading-page {
    gap: 12px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .grading-page {
    gap: 8px;
    padding: 8px;
  }
}

.reference-answer-content,
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

.grading-page :deep(.el-button--primary) {
  background: #007AFF;
  border-color: #007AFF;
  border-radius: 8px;
  font-weight: 500;
}

.grading-page :deep(.el-button--primary:hover) {
  background: #0056B3;
  border-color: #0056B3;
}

.grading-page :deep(.el-button--default) {
  background: #E5E5E5;
  border-color: #E5E5E5;
  color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
}

.grading-page :deep(.el-button--default:hover) {
  background: #D1D1D1;
  border-color: #D1D1D1;
}
</style>