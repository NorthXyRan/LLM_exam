<template>
  <div class="grading-page">
    <grading-header
      :current-question="currentQuestion"
      :questions="questions"
      :current-page="currentPage"
      :total-papers="totalPapers"
      :graded-count="gradedCount"
      :graded-papers="gradedPapers"
      :statistics="statistics"
      @question-change="handleQuestionChange"
      @page-change="handlePageChange"
      @jump-to-student="handleJumpToStudent"
      @show-reference-answer="showReferenceAnswer"
      @show-current-question="showCurrentQuestion"
    />
    
    <grading-page-content
      :paper-info="currentPaperInfo"
      :llm-score="currentLLMScore"
      :max-score="currentMaxScore"
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
  id: number
  name: string
  score: number
  question_id: string
  question: string
  referenceAnswer?: string
}

const router = useRouter()
const currentPage = ref(1)
const totalPapers = ref(50) // 示例数据
const gradedCount = ref(20) // 示例数据
// 已批改的试卷列表
const gradedPapers = ref([1, 2, 3, 5, 8, 13, 21]) // 示例数据，斐波那契数列just for fun

// 统计数据
const statistics = ref({
  highest: 98,
  lowest: 45,
  average: 75.5,
  failed: 5,
  excellent: 10,
  passing: 42,
  highestStudent: {
    name: '李四',
    id: '2024015',
    paperIndex: 15
  },
  lowestStudent: {
    name: '王五',
    id: '2024031',
    paperIndex: 31
  },
  distribution: {
    '90-100': 10,
    '80-89': 15,
    '70-79': 12,
    '60-69': 8,
    '0-59': 5
  }
})

// 当前试卷信息
const currentPaperInfo = ref({
  studentName: '张三',
  studentId: '2024001'
})

// 参考答案对话框显示状态
const referenceAnswerVisible = ref(false)
// 当前题目对话框显示状态
const currentQuestionVisible = ref(false)

// 试卷题目列表
const questions = ref<Question[]>([])
const currentQuestion = ref<number>(1)

// 当前LLM评分和满分
const currentLLMScore = ref(85.5) // 示例LLM评分
const currentMaxScore = ref(100) // 当前题目满分

// 计算当前题目的参考答案
const currentReferenceAnswer = computed(() => {
  const current = questions.value.find(q => q.id === currentQuestion.value)
  return current?.referenceAnswer || '暂无参考答案'
})

// 计算当前题目文本
const currentQuestionText = computed(() => {
  const current = questions.value.find(q => q.id === currentQuestion.value)
  return current?.question || '暂无题目内容'
})

// 加载所有可用的试卷题目
const loadQuestions = async () => {
  try {
    // 动态获取所有试卷目录
    const paperDirectories = await discoverPaperDirectories()
    const loadedQuestions: Question[] = []
    
    // 尝试获取配置信息以获得更友好的名称
    let paperConfigs: any[] = []
    try {
      const configResponse = await fetch('/paper/config.json')
      if (configResponse.ok) {
        const config = await configResponse.json()
        paperConfigs = config.papers || []
      }
    } catch (error) {
      console.warn('无法加载配置文件:', error)
    }
    
    let questionIdCounter = 1
    
    for (const dir of paperDirectories) {
      try {
        // 加载试卷信息
        const paperRes = await fetch(`/paper/${dir}/paper.json`)
        const paperData = await paperRes.json()
        
        // 加载参考答案
        let answerData: any = []
        try {
          const answerRes = await fetch(`/paper/${dir}/answer.json`)
          answerData = await answerRes.json()
        } catch (error) {
          console.warn(`无法加载 ${dir} 的参考答案:`, error)
        }
        
        // 从配置中获取试卷信息
        const paperConfig = paperConfigs.find(config => config.directory === dir)
        
        // 处理题目数据（支持单个题目对象或题目数组）
        const questions = Array.isArray(paperData) ? paperData : [paperData]
        
        for (const questionData of questions) {
          // 查找对应的参考答案
          const correspondingAnswer = Array.isArray(answerData) 
            ? answerData.find((ans: any) => ans.question_id === questionData.question_id)
            : (answerData?.question_id === questionData.question_id ? answerData : null)
          
          // 创建题目对象
          const question: Question = {
            id: questionIdCounter++,
            name: `第${questionIdCounter - 1}题`,
            score: questionData.score || 0,
            question_id: questionData.question_id,
            question: questionData.question,
            referenceAnswer: correspondingAnswer?.answer || ''
          }
          
          loadedQuestions.push(question)
        }
      } catch (error) {
        console.error(`加载试卷 ${dir} 失败:`, error)
      }
    }
    
    questions.value = loadedQuestions
    
    // 设置默认当前题目
    if (loadedQuestions.length > 0) {
      currentQuestion.value = loadedQuestions[0].id
      // 更新当前题目的满分
      currentMaxScore.value = loadedQuestions[0].score
    }
    
    console.log('加载的题目:', loadedQuestions)
  } catch (error) {
    console.error('加载题目失败:', error)
    ElMessage.error('加载题目失败')
  }
}

// 动态发现试卷目录
const discoverPaperDirectories = async (): Promise<string[]> => {
  try {
    // 首先尝试从配置文件获取试卷目录列表
    try {
      const configResponse = await fetch('/paper/config.json')
      if (configResponse.ok) {
        const config = await configResponse.json()
        const directories = config.papers?.map((paper: any) => paper.directory) || []
        
        // 验证每个目录是否包含有效的paper.json文件
        const validDirectories: string[] = []
        for (const dir of directories) {
          try {
            const response = await fetch(`/paper/${dir}/paper.json`)
            if (response.ok) {
              validDirectories.push(dir)
            }
          } catch (error) {
            console.warn(`目录 ${dir} 不包含有效的paper.json文件`)
          }
        }
        
        if (validDirectories.length > 0) {
          return validDirectories
        }
      }
    } catch (error) {
      console.warn('无法加载配置文件，使用默认配置:', error)
    }
    
    // 如果配置文件不存在或无效，回退到默认目录
    const knownDirectories = ['example1']
    
    // 验证目录是否存在有效的paper.json文件
    const validDirectories: string[] = []
    for (const dir of knownDirectories) {
      try {
        const response = await fetch(`/paper/${dir}/paper.json`)
        if (response.ok) {
          validDirectories.push(dir)
        }
      } catch (error) {
        console.warn(`目录 ${dir} 不包含有效的paper.json文件`)
      }
    }
    
    return validDirectories.length > 0 ? validDirectories : ['example1']
  } catch (error) {
    console.error('发现试卷目录失败:', error)
    return ['example1'] // 回退到默认目录
  }
}

// 从paper中读取数据
onMounted(async () => {
  await loadQuestions()
})

// 页码变化处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  // TODO: 加载对应页码的试卷
  ElMessage.success(`切换到第 ${page} 份试卷`)
}

// 跳转到指定学生的试卷
const handleJumpToStudent = (student: {id?: string, paperIndex?: number }) => {
  handlePageChange(student.paperIndex!)
  ElMessage.success(`跳转到 ${student.id} 的试卷`)
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
  currentQuestion.value = question.id
  // 更新当前题目的满分
  const selectedQuestion = questions.value.find(q => q.id === question.id)
  if (selectedQuestion) {
    currentMaxScore.value = selectedQuestion.score
  }
  ElMessage.success(`切换到${question.name}，满分${question.score}分`)
  // TODO: 加载对应题目的内容和统计数据
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
