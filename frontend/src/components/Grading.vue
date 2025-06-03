<template>
  <div class="grading-page">
    <!-- 评分页面头部：题目选择、学生选择、统计信息 -->
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
    
    <!-- 评分页面主体：评分区域、试卷预览、操作工具 -->
    <grading-page-content
      :paper-info="currentPaperInfo"
      :llm-score="currentLLMScore"
      :max-score="currentMaxScore"
      :student-answer="currentStudentAnswer"
      @start-grading="startGrading"
      @mark-answer="handleMarkAnswer"
      @score-change="handleScoreChange"
      @erase-marks="handleEraseMarks"
      @clear-all="handleClearAll"
    />

    <!-- 参考答案弹窗 -->
    <el-dialog
      v-model="referenceAnswerVisible"
      title="参考答案"
      width="50%"
      :close-on-click-modal="true"
    >
      <div class="reference-answer-content">
        {{ currentReferenceAnswer }}
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="referenceAnswerVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

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
 * 定义所有数据结构的类型，确保类型安全
 */

// 题目接口 - 从paper.json和answer.json合并而来
interface Question {
  question_id: number      // 题目ID，对应JSON中的question_id字段
  question: string         // 题目内容
  score: number           // 题目分值
  referenceAnswer: string // 参考答案（从answer.json获取）
}

// 学生答案接口 - 从student_answer.json读取
interface StudentAnswer {
  student_id: number   // 学生ID
  question_id: number  // 题目序号（1, 2, 3...）
  answer: string       // 学生的答案内容
}

// 学生评分接口 - 用于存储每题的评分信息（待实现）
interface StudentScore {
  student_id: number       // 学生ID
  question_id: number      // 题目序号
  llm_score?: number       // AI自动评分
  teacher_score?: number   // 教师手动评分
  final_score: number      // 最终得分
  is_graded: boolean       // 是否已完成批改
}

// 学生信息接口 - 用于学生列表显示和导航
interface StudentInfo {
  id: number               // 学生ID
  total_score?: number     // 总分（所有题目final_score之和）
}

/**
 * ===== Vue 路由 =====
 */
const router = useRouter()

/**
 * ===== 核心状态管理 =====
 * 管理当前选中的学生和题目
 */


const currentStudentId = ref<number>(1)        // 当前选中的学生ID（数字类型，如：1, 2, 3）
const currentQuestionId = ref<number>(1)       // 当前选中的题目序号（数字类型，如：1, 2, 3）

/**
 * ===== 批改进度数据 =====
 * 用于统计和显示批改进度
 */

// 已批改的学生数量（示例数据，实际应该根据StudentScore计算）
const gradedCount = ref(20)

// 已批改的学生ID列表（用于在界面上标记已完成的学生）
const gradedPapers = ref([1, 2, 3, 5, 8, 13, 21])

/**
 * ===== 主要数据存储 =====
 * 存储从JSON文件加载的核心数据
 */

// 所有学生的答案数据（从student_answer.json加载）
const studentAnswers = ref<StudentAnswer[]>([])

// 学生列表（从studentAnswers中提取唯一学生ID生成）
const studentList = ref<StudentInfo[]>([])

// 题目列表（从paper.json和answer.json合并生成）
const questions = ref<Question[]>([])

/**
 * ===== 统计数据 =====
 * 用于显示班级整体情况（示例数据）
 */
const statistics = ref({
  highest: 8,              // 最高分
  lowest: 0,               // 最低分
  average: 4,              // 平均分
  highestStudent: {        // 最高分学生信息
    id: 2
  },
  lowestStudent: {         // 最低分学生信息
    id: 16
  }
})

/**
 * ===== 弹窗状态控制 =====
 */


const referenceAnswerVisible = ref(false)       // 参考答案弹窗显示状态
const currentQuestionVisible = ref(false)      // 当前题目弹窗显示状态

/**
 * ===== 评分相关数据 =====
 */

// 当前题目的LLM评分（示例数据）
const currentLLMScore = ref(8)

/**
 * ===== 计算属性 =====
 * 基于当前状态动态计算相关信息
 */

// 当前学生的基本信息
const currentPaperInfo = computed(() => {
  const currentStudent = studentList.value.find(s => s.id === currentStudentId.value)
  return {
    studentId: currentStudent?.id || undefined
  }
})

// 当前题目的满分
const currentMaxScore = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.score || 0
})

// 当前题目的参考答案
const currentReferenceAnswer = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.referenceAnswer || '暂无参考答案'
})

// 当前题目的内容
const currentQuestionText = computed(() => {
  const current = questions.value.find(q => q.question_id === currentQuestionId.value)
  return current?.question || '暂无题目内容'
})

// 当前学生对当前题目的回答
const currentStudentAnswer = computed(() => {
  // 如果没有选中学生或题目，返回提示信息
  if (!currentStudentId.value || !currentQuestionId.value) {
    return '请先选择学生和题目'
  }

  // 在学生答案数组中查找匹配的记录
  const answer = studentAnswers.value.find(
    ans => ans.student_id === currentStudentId.value && 
           ans.question_id === currentQuestionId.value
  )
  
  return answer?.answer || '该学生未回答此题目'
})

/**
 * ===== 数据加载函数 =====
 * 从JSON文件异步加载数据
 */

/**
 * 加载题目和参考答案数据
 * 从两个JSON文件合并数据：paper.json(题目) + answer.json(答案)
 * 注意：即使是本地文件，fetch也是通过HTTP请求获取
 */
const loadQuestions = async () => {
  try {
    // 并发加载两个本地JSON文件以提高性能
    const [paperResponse, answerResponse] = await Promise.all([
      fetch('/paper/example1/paper.json'),
      fetch('/paper/example1/answer.json')
    ])

    // 检查文件是否成功加载
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

    // 合并题目和答案数据
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
 * 从本地student_answer.json文件加载所有学生的答案，并生成学生列表
 */
const loadStudentAnswers = async () => {
  try {
    const response = await fetch('/paper/example1/student_answer.json')
    
    if (!response.ok) {
      throw new Error(`学生答案文件不存在或无法访问: ${response.status}`)
    }

    const data: StudentAnswer[] = await response.json()
    
    // 验证数据格式
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('学生答案数据格式无效或为空')
    }

    studentAnswers.value = data

    // 从答案数据中提取唯一的学生ID，生成学生列表
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
 * ===== 页面初始化 =====
 * 组件挂载时执行的初始化逻辑
 */
onMounted(async () => {
  try {
    // 并发加载所有数据
    await Promise.all([
      loadQuestions(),
      loadStudentAnswers()
    ])

    // 设置默认选中项
    if (questions.value.length > 0) {
      currentQuestionId.value = 1 // 默认选中第1题
    }
    if (studentList.value.length > 0) {
      currentStudentId.value = studentList.value[0].id // 默认选中第一个学生
    }
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('加载试卷数据失败，请刷新页面重试')
  }
})

/**
 * ===== 事件处理函数 =====
 * 处理用户交互和组件间通信
 */

/**
 * 处理学生切换
 * @param studentId 学生ID
 */
const handleStudentChange = (studentId: number) => {
  if (studentId === currentStudentId.value) {
    return // 如果是同一个学生，不需要处理
  }

  currentStudentId.value = studentId
  ElMessage.success(`切换到学生ID: ${studentId}`)
  
  // TODO: 可以在这里添加切换学生时的额外逻辑
  // 比如保存当前评分、重置某些状态等
}

/**
 * 处理题目切换
 * @param question 题目信息对象
 */
const handleQuestionChange = (question: { id: number, name: string, score: number }) => {
  if (question.id === currentQuestionId.value) {
    return // 如果是同一道题，不需要处理
  }

  currentQuestionId.value = question.id
  ElMessage.success(`切换到${question.name}，满分${question.score}分`)
  
  // TODO: 可以在这里添加切换题目时的额外逻辑
  // 比如保存当前评分、清除高亮标记等
}

/**
 * 开始AI评分
 * TODO: 集成大模型API（如OpenAI、Claude等）进行自动评分
 */
const startGrading = () => {
  if (!currentStudentId.value || !currentQuestionId.value) {
    ElMessage.warning('请先选择学生和题目')
    return
  }

  ElMessage.success('开始AI评分...')
  
  // TODO: 调用大模型API进行评分
  // 1. 获取当前学生答案: currentStudentAnswer.value
  // 2. 获取参考答案: currentReferenceAnswer.value  
  // 3. 构造prompt发送给大模型API
  // 4. 解析AI返回的评分结果
  // 5. 更新currentLLMScore和相关评分数据
  
  // 示例API调用结构：
  // const result = await callLLMAPI({
  //   studentAnswer: currentStudentAnswer.value,
  //   referenceAnswer: currentReferenceAnswer.value,
  //   question: currentQuestionText.value,
  //   maxScore: currentMaxScore.value
  // })
}

/**
 * 处理答案标记
 * @param data 标记数据
 */
const handleMarkAnswer = (data: { 
  text: string, 
  type: 'correct' | 'wrong' | 'unclear' | 'redundant' 
}) => {
  ElMessage.success(`标记文本："${data.text.substring(0, 30)}..." 为 ${data.type}`)
  
  // TODO: 实现标记逻辑
  // 1. 保存标记到数据结构
  // 2. 更新界面显示
  // 3. 可能影响评分计算
  console.log('答案标记:', data)
}

/**
 * 处理评分变化
 * @param data 评分数据
 */
const handleScoreChange = (data: { teacherScore: number, llmScore: number }) => {
  ElMessage.info(`教师评分: ${data.teacherScore}分 (LLM评分: ${data.llmScore}分)`)
  
  // TODO: 实现评分保存逻辑
  // 1. 更新StudentScore数据
  // 2. 重新计算总分
  // 3. 更新批改状态
  console.log('评分变化:', data)
}

/**
 * 处理擦除标记
 * TODO: 实现擦除当前答案所有标记的逻辑
 */
const handleEraseMarks = () => {
  ElMessage.success('擦除所有标记')
  
  // TODO: 实现擦除逻辑
  // 1. 清除当前答案的所有高亮标记
  // 2. 更新界面显示
  // 3. 可能需要重新计算评分
}

/**
 * 处理清除所有数据
 * TODO: 实现清除当前学生当前题目所有评分数据的逻辑
 */
const handleClearAll = () => {
  ElMessage.success('清除所有数据')
  
  // TODO: 实现清除逻辑
  // 1. 清除评分
  // 2. 清除标记
  // 3. 重置状态
  // 4. 可能需要确认对话框
}

/**
 * ===== 弹窗控制函数 =====
 */

/**
 * 显示参考答案弹窗
 */
const showReferenceAnswer = () => {
  if (!currentQuestionId.value) {
    ElMessage.warning('请先选择题目')
    return
  }
  referenceAnswerVisible.value = true
}

/**
 * 显示当前题目弹窗
 */
const showCurrentQuestion = () => {
  if (!currentQuestionId.value) {
    ElMessage.warning('请先选择题目')
    return
  }
  currentQuestionVisible.value = true
}
</script>

<style scoped>
/**
 * ===== 主页面布局样式 =====
 */
.grading-page {
  min-height: 100vh;
  background: #F5F5F5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

/**
 * ===== 响应式设计 =====
 * 适配不同屏幕尺寸
 */
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

/**
 * ===== 弹窗内容样式 =====
 * 参考答案和题目内容的显示样式
 */
.reference-answer-content,
.current-question-content {
  white-space: pre-line;        /* 保留换行符，便于阅读 */
  line-height: 1.6;             /* 行高，提升可读性 */
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  padding: 15px;
  border-radius: 8px;
  background: #FFFFFF;
  max-height: 400px;            /* 限制最大高度 */
  overflow-y: auto;             /* 内容过多时显示滚动条 */
}

/**
 * ===== 弹窗底部按钮区域 =====
 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/**
 * ===== Element Plus 组件样式覆盖 =====
 * 统一弹窗和按钮的视觉效果
 */
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

/* 主要按钮样式 */
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

/* 默认按钮样式 */
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