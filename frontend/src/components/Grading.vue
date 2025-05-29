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
    
    <div class="page-content">
      <el-card class="paper-content">
        <template #header>
          <div class="paper-header">
            <span>当前试卷：{{ currentPaperInfo.studentName }} - {{ currentPaperInfo.studentId }}</span>
            <div class="paper-actions">
              <el-button type="primary" @click="startGrading">
                <el-icon><VideoPlay /></el-icon>
                开始评分
              </el-button>
              <el-button @click="openSettings">
                <el-icon><Setting /></el-icon>
                评分设置
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="paper-preview">
          <!-- 试卷预览内容将在后续实现 -->
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="referenceAnswerVisible"
      title="参考答案"
      width="50%"
      :before-close="handleDialogClose"
    >
      <div class="reference-answer-content">
        {{ statistics.referenceAnswer }}
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
      :before-close="handleDialogClose"
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
import { Setting, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GradingHeader from './grading/GradingHeader.vue'

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

// 关闭对话框前的回调
const handleDialogClose = (done: () => void) => {
  done()
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

// 处理题目切换
const handleQuestionChange = (question: { id: number, name: string, score: number }) => {
  currentQuestion.value = question.id
  ElMessage.success(`切换到${question.name}，满分${question.score}分`)
  // TODO: 加载对应题目的内容和统计数据
}

</script>

<style scoped>
.grading-page {
  min-height: 100%;
}

.page-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.paper-actions {
  display: flex;
  gap: 10px;
}

.paper-preview {
  min-height: 400px;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 20px;
  margin-top: 20px;
}

.current-question-content, .reference-answer-content {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 14px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
