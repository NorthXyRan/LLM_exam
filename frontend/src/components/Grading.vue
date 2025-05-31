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
      @open-settings="openSettings"
      @mark-answer="handleMarkAnswer"
      @score-change="handleScoreChange"
    />

    <el-dialog
      v-model="referenceAnswerVisible"
      title="参考答案"
      width="50%"
    >
      <div class="reference-answer-content">
        {{ statistics.referenceAnswer }}
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="referenceAnswerVisible = false">关闭</el-button>
          <el-button type="primary" @click="copyReferenceAnswer">复制内容</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="currentQuestionVisible"
      title="当前题目"
      width="50%"
    >
      <div class="current-question-content">
        {{ statistics.currentQuestion }}
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GradingHeader from './grading/GradingHeader.vue'
import GradingPageContent from './grading/GradingPageContent.vue'

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
  referenceAnswer: `这是一个示例参考答案：

1. 关键点一：......
2. 关键点二：......
3. 关键点三：......

评分要点：
- 内容完整性（30分）
- 逻辑性（25分）
- 创新性（25分）
- 表达准确性（20分）

注意事项：
1. 答案要点完整
2. 逻辑结构清晰
3. 表述准确规范`,
  currentQuestion: `这是一个示例当前题目：`,
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
const questions = ref([
  { id: 1, name: '第一题', score: 30 },
  { id: 2, name: '第二题', score: 25 },
  { id: 3, name: '第三题', score: 25 },
  { id: 4, name: '第四题', score: 20 }
])

const currentQuestion = ref(1)

// 当前LLM评分和满分
const currentLLMScore = ref(85.5) // 示例LLM评分
const currentMaxScore = ref(100) // 当前题目满分

// 页码变化处理
const handlePageChange = (page: number) => {
  currentPage.value = page
  // TODO: 加载对应页码的试卷
  ElMessage.success(`切换到第 ${page} 份试卷`)
}

// 跳转到指定学生的试卷
const handleJumpToStudent = (student: { name?: string, id?: string, paperIndex?: number }) => {
  handlePageChange(student.paperIndex!)
  ElMessage.success(`跳转到 ${student.name} 的试卷`)
}

// 开始评分
const startGrading = () => {
  ElMessage.success('开始评分当前试卷')
}

// 打开设置
const openSettings = () => {
  router.push('/prompt-setting')
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
  ElMessage.success(`切换到${question.name}，满分${question.score}分`)
  // TODO: 加载对应题目的内容和统计数据
}

// 复制参考答案
const copyReferenceAnswer = () => {
  navigator.clipboard.writeText(statistics.value.referenceAnswer)
    .then(() => {
      ElMessage.success('参考答案已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
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
