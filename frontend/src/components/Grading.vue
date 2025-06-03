<template>
  <div class="grading-page">
    <grading-header
      :current-question="currentQuestionId"
      :current-student-id="currentStudentId"
      :questions="questions"
      :total-students="studentList.length"
      :graded-count="gradedCount"
      :graded-papers="gradedPapers"
      :statistics="statistics"
      :student-list="studentList"
      @question-change="handleQuestionChange"
      @student-change="handleStudentChange"
      @show-reference-answer="showReferenceAnswer"
      @show-current-question="showCurrentQuestion"
    />
    
    <grading-page-content
      :paper-info="currentPaperInfo"
      :llm-score="currentLLMScore"
      :max-score="currentMaxScore"
      :student-answer="currentStudentAnswer"
      @start-grading="startGrading"
      @mark-answer="handleMarkAnswer"
      @score-change="handleScoreChange"
    />

    <el-dialog
      v-model="referenceAnswerVisible"
      title="参考答案"
      width="50%"
    >
      <div class="reference-answer-content">
        {{ currentReferenceAnswer }}
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="referenceAnswerVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="currentQuestionVisible"
      title="当前题目"
      width="50%"
    >
      <div class="current-question-content">
        {{ currentQuestionText }}
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="currentQuestionVisible = false">关闭</el-button>
        </span>
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

// 定义题目接口
interface Question {
  question_id: string  // 题目ID，如 "q1", "q2"
  question: string     // 题目内容
  score: number        // 题目分值
  referenceAnswer: string // 参考答案
}

// 定义学生答案接口
interface StudentAnswer {
  student_id: number   // 学生ID
  question_id: number  // 题目ID的数字部分，如 1, 2, 3
  answer: string       // 学生答案
}

// 定义学生得分接口
interface StudentScore {
  student_id: number   // 学生ID
  question_id: number  // 题目ID
  llm_score?: number   // AI评分
  teacher_score?: number // 教师评分
  final_score: number  // 最终得分
  is_graded: boolean   // 是否已批改
}

// 定义学生信息接口
interface StudentInfo {
  id: number          // 学生ID
  total_score?: number // 总分（所有题目final_score之和）
}



const router = useRouter()

const currentStudentId = ref()    // 当前选中的学生ID
const currentQuestionId = ref()   // 当前选中的题目ID（题目序号）

const gradedCount = ref(20) // 示例数据
// 已批改的学生ID列表（统一为学生ID）
const gradedPapers = ref([1, 2, 3, 5, 8, 13, 21]) // 示例数据

// 学生数据
const studentAnswers = ref<StudentAnswer[]>([])
const studentList = ref<StudentInfo[]>([])

// 统计数据
const statistics = ref({
  highest: 8,
  lowest: 0,
  average: 4,
  highestStudent: {
    id: 2
  },
  lowestStudent: {
    id: 16
  }
})

// 当前试卷信息，从studentList中获取student_id
const currentPaperInfo = computed(() => {
  const currentStudent = studentList.value.find(s => s.id === currentStudentId.value)
  return {
    studentId: currentStudent?.id || undefined
  }
})

// 参考答案对话框显示状态
const referenceAnswerVisible = ref(false)
// 当前题目对话框显示状态
const currentQuestionVisible = ref(false)

// 试卷题目列表
const questions = ref<Question[]>([])

// 当前LLM评分和满分
const currentLLMScore = ref(8) // 示例LLM评分

const currentMaxScore = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.score || 0
})

// 计算当前题目的参考答案
const currentReferenceAnswer = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.referenceAnswer || '暂无参考答案'
})

// 计算当前题目文本
const currentQuestionText = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.question || '暂无题目内容'
})

// 获取当前学生对当前题目的回答
const currentStudentAnswer = computed(() => {
  const answer = studentAnswers.value.find(// 找到当前学生对当前题目的回答
    ans => ans.student_id === currentStudentId.value && 
           ans.question_id === currentQuestionId.value
  )
  return answer?.answer || '该学生未回答此题目'
})

// 加载题目和答案
const loadQuestions = async () => {
  try {
    // 1. 等待加载题目文件
    const response = await fetch('/paper/example1/paper.json')
    const data = await response.json()  // 等待解析JSON
    
    // 2. 等待加载答案文件  
    const answerResponse = await fetch('/paper/example1/answer.json')
    const answerData = await answerResponse.json()  // 等待解析JSON
    
    // 3. 使用map将两个文件的数据合并成完整的题目对象
    questions.value = data.map((question: any, index: number) => ({
      question_id: question.question_id,            // ID
      question: question.question,                  // 题目内容
      score: question.score,                        // 分值
      referenceAnswer: answerData[index]?.answer    // 参考答案
    }))
  } catch (error) {
    console.error('加载题目失败:', error)
  }
}

// 加载学生答案
const loadStudentAnswers = async () => {
  try {
    const response = await fetch('/paper/example1/student_answer.json')
    const data: StudentAnswer[] = await response.json()
    
    studentAnswers.value = data
    
    // 提取学生ID并创建学生对象
    studentList.value = data.map(item => ({
      id: item.student_id
    }))
  } catch (error) {
    console.error('加载学生答案失败:', error)
  }
}

// 从paper中读取数据
onMounted(async () => {
  try {
    await loadQuestions()
    await loadStudentAnswers()
    
    // 确保初始化当前题目和学生
    if (questions.value.length > 0) {
      currentQuestionId.value = 1  // 默认第1题
    }
    if (studentList.value.length > 0) {
      currentStudentId.value = studentList.value[0].id  // 默认第一个学生
    }
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('加载试卷数据失败，请刷新页面重试')
  }
})

// 学生切换处理（统一处理直接切换和跳转）
const handleStudentChange = (studentId: number) => {
  currentStudentId.value = studentId
  ElMessage.success(`切换到学生ID: ${studentId}`)
}

// 开始评分
const startGrading = () => {
  ElMessage.success('开始评分当前试卷')
}

// 显示参考答案
const showReferenceAnswer = () => {
  referenceAnswerVisible.value = true
}

// 显示当前题目
const showCurrentQuestion = () => {
  currentQuestionVisible.value = true
}

// 处理题目切换
const handleQuestionChange = (question: { id: number, name: string, score: number }) => {
  currentQuestionId.value = question.id  // 这里的id是题目序号
  ElMessage.success(`切换到${question.name}，满分${question.score}分`)
}

// 处理答案标记
const handleMarkAnswer = (data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }) => {
  ElMessage.success(`标记文本："${data.text.substring(0, 30)}..." 为 ${data.type}`)
  // TODO: 这里可以将标记信息保存到数据中
  console.log('答案标记:', data)
}

// 处理评分变化
const handleScoreChange = (data: { teacherScore: number, llmScore: number }) => {
  ElMessage.info(`教师评分: ${data.teacherScore}分 (LLM评分: ${data.llmScore}分)`)
  // TODO: 这里可以将评分信息保存到数据中
  console.log('评分变化:', data)
}

</script>

<style scoped>
/* === 主页面容器 === */
.grading-page {
  min-height: 100vh;
  background: #F5F5F5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

/* === 响应式设计 === */
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

/* === 对话框内容样式 === */
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

/* === 对话框底部 === */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* === 对话框样式重写 === */
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