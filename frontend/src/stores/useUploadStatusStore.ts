// 管理：examPaper, referenceAnswer 的状态信息
// 职责：跟踪上传进度和状态

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// ===== 状态数据类型 =====
export interface ExamPaper {
  name: string
  status: string
  questionCount: number
  content?: string
  rawFile?: File
}

export interface ReferenceAnswer {
  name: string
  status: string
  matched: boolean
  answerCount: number
}

export interface StudentPaper {
  id: number
  filename: string
  valid: boolean
  questionCount: number
  error: string
}

export interface StudentAnswers {
  name: string
  status: string
  studentCount: number
  answerCount: number
  papers: StudentPaper[]
}

// ===== 上传状态管理 =====
export const useUploadStatusStore = defineStore('uploadStatus', () => {
  // ===== 状态 =====
  const examPaper = ref<ExamPaper>({
    name: '',
    status: '',
    questionCount: 0,
  })

  const referenceAnswer = ref<ReferenceAnswer>({
    name: '',
    status: '',
    matched: false,
    answerCount: 0,
  })

  const studentAnswers = ref<StudentAnswers>({
    name: '',
    status: '',
    studentCount: 0,
    answerCount: 0,
    papers: [],
  })

  // ===== 计算属性 =====
  const isPaperUploaded = computed(() => examPaper.value.status === 'ready')
  const isReferenceAnswerUploaded = computed(() => referenceAnswer.value.status === 'ready')
  const isStudentAnswersUploaded = computed(() => studentAnswers.value.status === 'ready')
  // 只需要试卷上传就可以上传学生答案
  const canUploadStudentPapers = computed(() => isPaperUploaded.value)

  // 检查是否可以开始打分（试卷 + 学生答案为必需，参考答案可选）
  const canProceedToGrading = computed(
    () => isPaperUploaded.value && isStudentAnswersUploaded.value,
  )

  // 上传进度计算（试卷和学生答案为必需，参考答案为可选加分项）
  const uploadProgress = computed(() => {
    let completed = 0
    let total = 2 // 试卷 + 学生答案为必需

    if (isPaperUploaded.value) completed++
    if (isStudentAnswersUploaded.value) completed++

    // 参考答案为可选，如果上传了则增加进度
    if (isReferenceAnswerUploaded.value) {
      completed += 0.5 // 加分项，不算完整的一步
    }

    return {
      completed: Math.floor(completed),
      total,
      percentage: Math.min((completed / total) * 100, 100),
      hasOptionalReference: isReferenceAnswerUploaded.value,
    }
  })

  // ===== 试卷状态管理 =====
  const setPaperStatus = (paperData: ExamPaper) => {
    examPaper.value = { ...paperData }
    console.log('📝 试卷状态已更新:', examPaper.value)
  }

  const resetPaperStatus = () => {
    examPaper.value = {
      name: '',
      status: '',
      questionCount: 0,
    }
  }

  // ===== 参考答案状态管理 =====
  const setReferenceAnswerStatus = (answerData: ReferenceAnswer) => {
    referenceAnswer.value = { ...answerData }
    console.log('📝 参考答案状态已更新:', referenceAnswer.value)
  }

  const resetReferenceAnswerStatus = () => {
    referenceAnswer.value = {
      name: '',
      status: '',
      matched: false,
      answerCount: 0,
    }
  }

  // ===== 学生答案状态管理 =====
  const setStudentAnswersStatus = (data: {
    name: string
    studentCount: number
    answerCount: number
    answers: any[]
  }) => {
    const uniqueStudentIds = [
      ...new Set(data.answers.map((item: any) => item.student_id)),
    ] as number[]
    const papers: StudentPaper[] = uniqueStudentIds.map((id: number) => ({
      id,
      filename: `Student_${id}`,
      valid: true,
      questionCount: data.answers.filter((item: any) => item.student_id === id).length,
      error: '',
    }))

    studentAnswers.value = {
      name: data.name,
      status: 'ready',
      studentCount: data.studentCount,
      answerCount: data.answerCount,
      papers,
    }
    console.log('📝 学生答案状态已更新:', studentAnswers.value)
  }

  const resetStudentAnswersStatus = () => {
    studentAnswers.value = {
      name: '',
      status: '',
      studentCount: 0,
      answerCount: 0,
      papers: [],
    }
  }

  // ===== 批量操作 =====
  const resetAnswerAndStudentStatus = () => {
    resetReferenceAnswerStatus()
    resetStudentAnswersStatus()
    console.log('📝 已重置参考答案和学生答案状态')
  }

  const resetAllStatus = () => {
    resetPaperStatus()
    resetReferenceAnswerStatus()
    resetStudentAnswersStatus()
    console.log('📝 已重置所有上传状态')
  }

  // ===== 状态检查 =====
  const getUploadSummary = () => {
    return {
      paper: {
        uploaded: isPaperUploaded.value,
        name: examPaper.value.name,
        questionCount: examPaper.value.questionCount,
      },
      referenceAnswer: {
        uploaded: isReferenceAnswerUploaded.value,
        name: referenceAnswer.value.name,
        answerCount: referenceAnswer.value.answerCount,
        matched: referenceAnswer.value.matched,
      },
      studentAnswers: {
        uploaded: isStudentAnswersUploaded.value,
        name: studentAnswers.value.name,
        studentCount: studentAnswers.value.studentCount,
        answerCount: studentAnswers.value.answerCount,
      },
      canProceed: canUploadStudentPapers.value,
    }
  }

  // ===== 本地存储 =====
  const saveToLocal = () => {
    try {
      localStorage.setItem('upload_exam_paper', JSON.stringify(examPaper.value))
      localStorage.setItem('upload_reference_answer', JSON.stringify(referenceAnswer.value))
      localStorage.setItem('upload_student_answers', JSON.stringify(studentAnswers.value))
      console.log('💾 上传状态已保存到本地')
    } catch (error) {
      console.error('保存上传状态失败:', error)
    }
  }

  const loadFromLocal = () => {
    try {
      const savedPaper = localStorage.getItem('upload_exam_paper')
      const savedReference = localStorage.getItem('upload_reference_answer')
      const savedStudentAnswers = localStorage.getItem('upload_student_answers')

      if (savedPaper) {
        examPaper.value = JSON.parse(savedPaper)
      }
      if (savedReference) {
        referenceAnswer.value = JSON.parse(savedReference)
      }
      if (savedStudentAnswers) {
        studentAnswers.value = JSON.parse(savedStudentAnswers)
      }

      console.log('📂 上传状态已从本地恢复')
    } catch (error) {
      console.error('加载上传状态失败:', error)
    }
  }

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('upload_exam_paper')
      localStorage.removeItem('upload_reference_answer')
      localStorage.removeItem('upload_student_answers')
      console.log('🗑️ 上传状态本地存储已清空')
    } catch (error) {
      console.error('清空上传状态存储失败:', error)
    }
  }

  return {
    // 状态
    examPaper,
    referenceAnswer,
    studentAnswers,

    // 计算属性
    isPaperUploaded,
    isReferenceAnswerUploaded,
    isStudentAnswersUploaded,
    canUploadStudentPapers,
    canProceedToGrading,
    uploadProgress,

    // 方法
    setPaperStatus,
    resetPaperStatus,
    setReferenceAnswerStatus,
    resetReferenceAnswerStatus,
    setStudentAnswersStatus,
    resetStudentAnswersStatus,
    resetAnswerAndStudentStatus,
    resetAllStatus,
    getUploadSummary,
    saveToLocal,
    loadFromLocal,
    clearLocalStorage,
  }
})
