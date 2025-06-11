import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ===== 数据类型定义 =====
export interface Question {
  question_id: number
  question: string
  score: number
}

export interface ReferenceAnswer {
  question_id: number
  answer: string
}

export interface StudentAnswer {
  student_id: number
  question_id: number
  answer: string
}

export interface StudentInfo {
  id: number
}

export interface HighlightItem {
  'Student answer': string
  'Scoring point': number
  reason: string
}

export interface HighlightData {
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

// ===== 核心数据存储 =====
export const useExamDataStore = defineStore('examData', () => {
  // ===== 状态 =====
  const questions = ref<Question[]>([])
  const referenceAnswers = ref<ReferenceAnswer[]>([])
  const studentAnswers = ref<StudentAnswer[]>([])
  const studentList = ref<StudentInfo[]>([])
  const highlightDataList = ref<HighlightData[]>([])

  // ===== 计算属性 =====
  const questionCount = computed(() => questions.value.length)
  const referenceAnswerCount = computed(() => referenceAnswers.value.length)
  const studentCount = computed(() => studentList.value.length)
  const totalAnswerCount = computed(() => studentAnswers.value.length)

  // 获取指定题目
  const getQuestionById = (questionId: number) => {
    return questions.value.find((q) => q.question_id === questionId)
  }

  // 获取指定题目的参考答案
  const getReferenceAnswer = (questionId: number) => {
    return referenceAnswers.value.find((ans) => ans.question_id === questionId)
  }

  // 获取指定学生的答案
  const getStudentAnswer = (studentId: number, questionId: number) => {
    return studentAnswers.value.find(
      (ans) => ans.student_id === studentId && ans.question_id === questionId,
    )
  }

  // 获取指定的高亮数据
  const getHighlightData = (studentId: number, questionId: number) => {
    return highlightDataList.value.find(
      (data) => data.student_id === studentId && data.question_id === questionId,
    )
  }

  // 检查数据完整性
  const isDataComplete = computed(() => {
    return questions.value.length > 0 && studentAnswers.value.length > 0
  })

  // ===== 基础操作方法 =====

  // 设置题目数据
  const setQuestions = (questionsData: Question[]) => {
    questions.value = questionsData
  }

  // 设置学生答案数据
  const setStudentAnswers = (answersData: StudentAnswer[]) => {
    studentAnswers.value = answersData
    // 自动生成学生列表
    const uniqueStudentIds = [...new Set(answersData.map((item) => item.student_id))]
    studentList.value = uniqueStudentIds.map((id) => ({ id }))
  }

  // 设置高亮数据
  const setHighlightData = (highlightData: HighlightData[]) => {
    highlightDataList.value = highlightData
  }

  // 添加单个题目
  const addQuestion = (question: Question) => {
    const existingIndex = questions.value.findIndex((q) => q.question_id === question.question_id)
    if (existingIndex >= 0) {
      questions.value[existingIndex] = question
    } else {
      questions.value.push(question)
    }
  }

  // 设置参考答案数据
  const setReferenceAnswers = (answersData: ReferenceAnswer[]) => {
    referenceAnswers.value = answersData
  }

  // 更新单个参考答案
  const updateReferenceAnswer = (questionId: number, answer: string) => {
    const existingIndex = referenceAnswers.value.findIndex((ans) => ans.question_id === questionId)
    if (existingIndex >= 0) {
      referenceAnswers.value[existingIndex] = { question_id: questionId, answer }
    } else {
      referenceAnswers.value.push({ question_id: questionId, answer })
    }
  }

  // 批量更新参考答案
  const updateReferenceAnswers = (newAnswers: { question_id: number; answer: string }[]) => {
    referenceAnswers.value = newAnswers.map((ans) => ({
      question_id: ans.question_id,
      answer: ans.answer,
    }))
  }

  // 清除所有参考答案
  const clearReferenceAnswers = () => {
    referenceAnswers.value = []
  }

  // 添加学生答案
  const addStudentAnswer = (answer: StudentAnswer) => {
    const existingIndex = studentAnswers.value.findIndex(
      (ans) => ans.student_id === answer.student_id && ans.question_id === answer.question_id,
    )
    if (existingIndex >= 0) {
      studentAnswers.value[existingIndex] = answer
    } else {
      studentAnswers.value.push(answer)
    }

    // 更新学生列表
    const studentExists = studentList.value.some((student) => student.id === answer.student_id)
    if (!studentExists) {
      studentList.value.push({ id: answer.student_id })
    }
  }

  // 添加高亮数据
  const addHighlightData = (highlight: HighlightData) => {
    const existingIndex = highlightDataList.value.findIndex(
      (data) =>
        data.student_id === highlight.student_id && data.question_id === highlight.question_id,
    )
    if (existingIndex >= 0) {
      highlightDataList.value[existingIndex] = highlight
    } else {
      highlightDataList.value.push(highlight)
    }
  }

  // ===== 数据重置 =====
  const resetQuestions = () => {
    questions.value = []
  }

  const resetReferenceAnswers = () => {
    referenceAnswers.value = []
  }

  const resetStudentData = () => {
    studentAnswers.value = []
    studentList.value = []
    highlightDataList.value = []
  }

  const resetAllData = () => {
    resetQuestions()
    resetReferenceAnswers()
    resetStudentData()
  }

  // ===== 示例数据 =====
  const loadExampleData = () => {
    if (questions.value.length === 0) {
      questions.value = [{ question_id: 1, question: '示例问题1', score: 10 }]
    }

    if (referenceAnswers.value.length === 0) {
      referenceAnswers.value = [{ question_id: 1, answer: '示例参考答案1' }]
    }

    if (studentAnswers.value.length === 0) {
      studentAnswers.value = [{ student_id: 1, question_id: 1, answer: '学生1的答案1' }]
      studentList.value = [{ id: 1 }]
    }

    console.log('📝 示例数据加载完成')
  }

  // ===== 本地存储 =====
  const saveToLocal = () => {
    try {
      localStorage.setItem('exam_questions', JSON.stringify(questions.value))
      localStorage.setItem('exam_reference_answers', JSON.stringify(referenceAnswers.value))
      localStorage.setItem('exam_student_answers', JSON.stringify(studentAnswers.value))
      localStorage.setItem('exam_student_list', JSON.stringify(studentList.value))
      localStorage.setItem('exam_highlight_data', JSON.stringify(highlightDataList.value))
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  const loadFromLocal = () => {
    try {
      const savedQuestions = localStorage.getItem('exam_questions')
      const savedReferenceAnswers = localStorage.getItem('exam_reference_answers')
      const savedStudentAnswers = localStorage.getItem('exam_student_answers')
      const savedStudentList = localStorage.getItem('exam_student_list')
      const savedHighlightData = localStorage.getItem('exam_highlight_data')

      if (savedQuestions) questions.value = JSON.parse(savedQuestions)
      if (savedReferenceAnswers) referenceAnswers.value = JSON.parse(savedReferenceAnswers)
      if (savedStudentAnswers) studentAnswers.value = JSON.parse(savedStudentAnswers)
      if (savedStudentList) studentList.value = JSON.parse(savedStudentList)
      if (savedHighlightData) highlightDataList.value = JSON.parse(savedHighlightData)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  return {
    // 状态
    questions,
    referenceAnswers,
    studentAnswers,
    studentList,
    highlightDataList,

    // 计算属性
    questionCount,
    referenceAnswerCount,
    studentCount,
    totalAnswerCount,
    getQuestionById,
    getReferenceAnswer,
    getStudentAnswer,
    getHighlightData,
    isDataComplete,

    // 方法
    setQuestions,
    setReferenceAnswers,
    setStudentAnswers,
    setHighlightData,
    addQuestion,
    updateReferenceAnswer,
    updateReferenceAnswers,
    clearReferenceAnswers,
    addStudentAnswer,
    addHighlightData,
    resetQuestions,
    resetReferenceAnswers,
    resetStudentData,
    resetAllData,
    loadExampleData,
    saveToLocal,
    loadFromLocal,
  }
})
