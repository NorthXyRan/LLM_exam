import { defineStore } from 'pinia'
import { computed, ref, type Ref } from 'vue'

// ===== 统一的上传项状态结构 =====
export interface UploadItem {
  name: string
  status: 'idle' | 'uploading' | 'processing' | 'ready' | 'error'
  rawContent: string  // 总是保存原始文件内容，用于预览
  parsedData?: any    // 解析后的JSON数据
  error?: string      // 错误信息
  meta?: any          // 元数据（如题目数量、学生数量等）
}

// ===== 简化的上传状态管理 =====
export const useUploadStatusStore = defineStore('uploadStatus', () => {
  // ===== 状态 =====
  const examPaper: Ref<UploadItem> = ref({
    name: '',
    status: 'idle',
    rawContent: '',
  })

  const referenceAnswer: Ref<UploadItem> = ref({
    name: '',
    status: 'idle',
    rawContent: '',
  })

  const studentAnswers: Ref<UploadItem> = ref({
    name: '',
    status: 'idle',
    rawContent: '',
  })

  // ===== 计算属性 =====
  const canUploadAnswer = computed(() => examPaper.value.status === 'ready')
  const canUploadStudent = computed(() => examPaper.value.status === 'ready')
  const canProceedToGrading = computed(() => 
    examPaper.value.status === 'ready' && studentAnswers.value.status === 'ready'
  )

  // ===== 核心方法：统一的状态更新函数 =====
  const updateItemStatus = (
    item: Ref<UploadItem>, 
    updates: Partial<UploadItem>
  ) => {
    item.value = { ...item.value, ...updates }
    saveToLocal()
  }

  // ===== 试卷相关方法 =====
  const setPaperUploading = (name: string, rawContent: string) => {
    updateItemStatus(examPaper, {
      name,
      rawContent,
      status: 'processing',
      error: undefined,
      parsedData: undefined,
      meta: undefined
    })
  }

  const setPaperReady = (parsedData: any, meta: any) => {
    updateItemStatus(examPaper, {
      status: 'ready',
      parsedData,
      meta,
      error: undefined
    })
  }

  const setPaperError = (error: string) => {
    updateItemStatus(examPaper, {
      status: 'error',
      error
    })
  }

  const resetPaper = () => {
    updateItemStatus(examPaper, {
      name: '',
      status: 'idle',
      rawContent: '',
      parsedData: undefined,
      error: undefined,
      meta: undefined
    })
  }

  // ===== 参考答案相关方法 =====
  const setAnswerUploading = (name: string, rawContent: string) => {
    updateItemStatus(referenceAnswer, {
      name,
      rawContent,
      status: 'processing',
      error: undefined,
      parsedData: undefined,
      meta: undefined
    })
  }

  const setAnswerReady = (parsedData: any, meta: any) => {
    updateItemStatus(referenceAnswer, {
      status: 'ready',
      parsedData,
      meta,
      error: undefined
    })
  }

  const setAnswerError = (error: string) => {
    updateItemStatus(referenceAnswer, {
      status: 'error',
      error
    })
  }

  const resetAnswer = () => {
    updateItemStatus(referenceAnswer, {
      name: '',
      status: 'idle',
      rawContent: '',
      parsedData: undefined,
      error: undefined,
      meta: undefined
    })
  }

  // ===== 学生答案相关方法 =====
  const setStudentUploading = (name: string, rawContent: string) => {
    updateItemStatus(studentAnswers, {
      name,
      rawContent,
      status: 'processing',
      error: undefined,
      parsedData: undefined,
      meta: undefined
    })
  }

  const setStudentReady = (parsedData: any, meta: any) => {
    updateItemStatus(studentAnswers, {
      status: 'ready',
      parsedData,
      meta,
      error: undefined
    })
  }

  const setStudentError = (error: string) => {
    updateItemStatus(studentAnswers, {
      status: 'error',
      error
    })
  }

  const resetStudent = () => {
    updateItemStatus(studentAnswers, {
      name: '',
      status: 'idle',
      rawContent: '',
      parsedData: undefined,
      error: undefined,
      meta: undefined
    })
  }

  // ===== 批量操作 =====
  const resetAll = () => {
    resetPaper()
    resetAnswer()
    resetStudent()
    console.log('📝 所有上传状态已重置')
  }

  // ===== 状态总览 =====
  const getUploadSummary = () => {
    return {
      paper: {
        uploaded: examPaper.value.status === 'ready',
        name: examPaper.value.name,
        questionCount: examPaper.value.meta?.questionCount || 0,
      },
      referenceAnswer: {
        uploaded: referenceAnswer.value.status === 'ready',
        name: referenceAnswer.value.name,
        answerCount: referenceAnswer.value.meta?.answerCount || 0,
      },
      studentAnswers: {
        uploaded: studentAnswers.value.status === 'ready',
        name: studentAnswers.value.name,
        studentCount: studentAnswers.value.meta?.studentCount || 0,
        answerCount: studentAnswers.value.meta?.answerCount || 0,
      },
      canProceed: canProceedToGrading.value,
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
    // 状态 - 直接暴露 ref
    examPaper,
    referenceAnswer,
    studentAnswers,

    // 计算属性
    canUploadAnswer,
    canUploadStudent,
    canProceedToGrading,

    // 试卷方法
    setPaperUploading,
    setPaperReady,
    setPaperError,
    resetPaper,

    // 参考答案方法
    setAnswerUploading,
    setAnswerReady,
    setAnswerError,
    resetAnswer,

    // 学生答案方法
    setStudentUploading,
    setStudentReady,
    setStudentError,
    resetStudent,

    // 批量操作
    resetAll,

    // 工具方法
    getUploadSummary,
    saveToLocal,
    loadFromLocal,
    clearLocalStorage,
  }
})