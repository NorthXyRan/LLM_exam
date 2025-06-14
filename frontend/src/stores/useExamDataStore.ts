// 管理解析后的核心业务数据

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
  const questions = ref<Question[]>([])                  // 题目列表
  const referenceAnswers = ref<ReferenceAnswer[]>([])    // 参考答案列表
  const studentAnswers = ref<StudentAnswer[]>([])        // 学生答案列表
  const studentList = ref<StudentInfo[]>([])             // 学生列表
  const highlightDataList = ref<HighlightData[]>([])     // 评分结果

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

  // 设置参考答案数据
  const setReferenceAnswers = (answersData: ReferenceAnswer[]) => {
    referenceAnswers.value = answersData
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
    addHighlightData,
    resetQuestions,
    resetReferenceAnswers,
    resetStudentData,
    resetAllData,
    saveToLocal,
    loadFromLocal,
  }
})
