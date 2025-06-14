<template>
  <div class="report-page">
    <!-- 题目选择 -->
    <div class="question-selection">
      <h2>Question Selection</h2>
      <div class="question-cards">
        <div
          v-for="question in questionList"
          :key="question.id"
          class="question-card"
          :class="{ active: currentQuestionId === question.id }"
          @click="selectQuestion(question.id)"
        >
          <div class="question-title">{{ question.name }}</div>
          <div class="question-score">Full Score: {{ question.score }} points</div>
          <div class="question-stats">
            Graded: {{ getGradedCount(question.id) }}/{{ totalStudents }}
          </div>
        </div>
      </div>
    </div>

    <!-- 当前题目信息 -->
    <div class="current-question-info" v-if="currentQuestion">
      <h2>{{ currentQuestion.name }}</h2>
      <p class="question-content">{{ currentQuestion.content }}</p>
      <p class="question-detail">
        Full Score: {{ currentQuestion.score }} points | Graded Students: {{ currentGradedCount }}
      </p>
    </div>

    <!-- 统计概览 -->
    <div class="statistics-overview">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ statistics.average }}</div>
          <div class="stat-label">Average</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.highest }}</div>
          <div class="stat-label">Highest</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.lowest }}</div>
          <div class="stat-label">Lowest</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.median }}</div>
          <div class="stat-label">Median</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.passRate }}%</div>
          <div class="stat-label">Pass Rate</div>
        </div>
      </div>
    </div>

    <!-- 分数分布 -->
    <div class="score-distribution">
      <h2>Score Distribution</h2>
      <div class="histogram" @click="handleHistogramClick">
        <div
          v-for="segment in scoreSegments"
          :key="segment.range"
          class="histogram-bar"
          :class="{ active: selectedScoreRange === segment.range }"
          :style="{ height: `${(segment.count / maxCount) * 180}px` }"
          @click.stop="selectScoreRange(segment.range)"
        >
          <div class="bar-visual"></div>
          <div class="bar-info">
            <div class="bar-range">{{ segment.range }}</div>
            <div class="bar-count">{{ segment.count }} students</div>
          </div>
        </div>
      </div>
      <div class="filter-info" v-if="selectedScoreRange">
        <span class="filter-text">Current Score Range: {{ selectedScoreRange }}</span>
        <el-button size="small" type="primary" @click="clearScoreFilter">Show All</el-button>
      </div>
    </div>

    <!-- 所有题目统计（仅在显示全部时） -->
    <div class="all-questions-statistics" v-if="currentQuestionId === 0">
      <h2>Question Statistics</h2>
      <div class="questions-grid">
        <div
          v-for="question in questionStats"
          :key="question.id"
          class="question-stat-card"
          @click="selectQuestion(question.id)"
        >
          <div class="question-header">
            <span class="question-name">{{ question.name }}</span>
            <span class="question-score">{{ question.averageScore }}/{{ question.maxScore }}</span>
          </div>
          <div class="question-rate">Score Rate: {{ question.scoreRate }}%</div>
          <div class="question-progress">
            <div class="progress-bar" :style="{ width: `${question.scoreRate}%` }"></div>
          </div>
          <div class="question-count">Graded: {{ question.gradedCount }} students</div>
        </div>
      </div>
    </div>

    <!-- 学生成绩列表 -->
    <div class="student-scores-section" v-if="currentQuestionId > 0">
      <h2>Student Scores</h2>
      <div class="scores-table">
        <div class="table-header">
          <div class="header-cell">Student ID</div>
          <div class="header-cell">Score</div>
          <div class="header-cell">Score Rate</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Action</div>
        </div>
        <div class="table-body">
          <div
            v-for="score in filteredStudentScores"
            :key="score.studentId"
            class="score-row"
            :class="{ 'high-score': score.scoreRate >= 80, 'low-score': score.scoreRate < 60 }"
          >
            <div class="cell">Student{{ score.studentId }}</div>
            <div class="cell">{{ score.score }}/{{ currentQuestion?.score || 0 }}</div>
            <div class="cell">{{ score.scoreRate }}%</div>
            <div class="cell">
              <span class="status-badge" :class="score.scoreRate >= 60 ? 'pass' : 'fail'">
                {{ score.scoreRate >= 60 ? 'Pass' : 'Fail' }}
              </span>
            </div>
            <div class="cell">
              <el-button
                size="small"
                type="primary"
                @click="viewStudentPaper(score.studentId)"
                :icon="Document"
              >
                View Paper
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 试卷查看弹窗 -->
    <el-dialog
      v-model="paperDialogVisible"
      :title="`Student${selectedStudentId}'s Paper`"
      width="80%"
      top="5vh"
      destroy-on-close
    >
      <PaperViewer
        v-if="paperDialogVisible && selectedStudentId"
        :student-id="selectedStudentId"
        :question-id="currentQuestionId > 0 ? currentQuestionId : undefined"
        :exam-title="currentQuestionId === 0 ? 'Complete Paper' : currentQuestion?.name"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useExamDataStore } from '../../stores/useExamDataStore'
import PaperViewer from './PaperViewer.vue'

// ==================== 状态管理 ====================
const examDataStore = useExamDataStore()

// 当前选中的题目ID，0表示显示全部题目统计
const currentQuestionId = ref(0)
// 分数范围筛选
const selectedScoreRange = ref<string>('')
// 试卷查看弹窗
const paperDialogVisible = ref(false)
const selectedStudentId = ref<number | null>(null)

// ==================== 基础数据计算 ====================

// 题目列表（包含"全部题目"选项）
const questionList = computed(() => {
  const questions = examDataStore.questions.map((q) => ({
    id: q.question_id,
    name: `Question ${q.question_id}`,
    score: q.score,
    content: q.question,
  }))

  return [
    {
      id: 0,
      name: 'All Questions',
      score: questions.reduce((sum, q) => sum + q.score, 0), // 所有题目总分
      content: 'View comprehensive statistics for all questions',
    },
    ...questions,
  ]
})

// 当前选中的题目
const currentQuestion = computed(() => {
  if (currentQuestionId.value === 0) return null
  return questionList.value.find((q) => q.id === currentQuestionId.value)
})

// 学生总数
const totalStudents = computed(() => examDataStore.studentCount)

// ==================== 评分数据计算 ====================

// 获取指定题目的已评分学生数量
const getGradedCount = (questionId: number): number => {
  if (questionId === 0) {
    // 全部题目：返回至少有一题评分的学生数
    const gradedStudents = new Set()
    examDataStore.highlightDataList.forEach((data) => {
      gradedStudents.add(data.student_id)
    })
    return gradedStudents.size
  }
  return examDataStore.highlightDataList.filter((data) => data.question_id === questionId).length
}

// 当前题目的已评分学生数
const currentGradedCount = computed(() => getGradedCount(currentQuestionId.value))

// 当前题目的分数数据
const currentQuestionScores = computed(() => {
  if (currentQuestionId.value === 0) {
    // 全部题目：计算每个学生的总分
    const studentTotalScores = new Map<number, number>()
    const maxTotalScore = examDataStore.questions.reduce((sum, q) => sum + q.score, 0)

    // 累加每个学生的各题分数
    examDataStore.highlightDataList.forEach((data) => {
      const current = studentTotalScores.get(data.student_id) || 0
      studentTotalScores.set(data.student_id, current + data.total_score)
    })

    return Array.from(studentTotalScores.entries()).map(([studentId, score]) => ({
      studentId,
      score,
      maxScore: maxTotalScore,
    }))
  } else {
    // 单个题目
    const question = examDataStore.getQuestionById(currentQuestionId.value)
    const maxScore = question?.score || 0

    return examDataStore.highlightDataList
      .filter((data) => data.question_id === currentQuestionId.value)
      .map((data) => ({
        studentId: data.student_id,
        score: data.total_score,
        maxScore,
      }))
  }
})

// ==================== 统计信息计算 ====================

// 统计信息计算
const statistics = computed(() => {
  const scores = currentQuestionScores.value
  if (scores.length === 0) {
    return { average: 0, highest: 0, lowest: 0, median: 0, passRate: 0 }
  }

  const scoreValues = scores.map((s) => s.score)
  const maxScore = scores[0]?.maxScore || 1

  // 基础统计
  const highest = Math.max(...scoreValues)
  const lowest = Math.min(...scoreValues)
  const average =
    Math.round((scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length) * 10) / 10

  // 中位数计算
  const sortedScores = [...scoreValues].sort((a, b) => a - b)
  const median =
    sortedScores.length % 2 === 0
      ? Math.round(
          ((sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) /
            2) *
            10,
        ) / 10
      : sortedScores[Math.floor(sortedScores.length / 2)]

  // 及格率（60%为及格线）
  const passCount = scoreValues.filter((score) => score / maxScore >= 0.6).length
  const passRate = Math.round((passCount / scoreValues.length) * 100)

  return { average, highest, lowest, median, passRate }
})

// 分数段数据
const scoreSegments = computed(() => {
  const scores = currentQuestionScores.value
  if (scores.length === 0) return []

  const maxScore = scores[0]?.maxScore || 1
  const segments = [
    { range: '90-100%', min: 0.9, max: 1, count: 0 },
    { range: '80-89%', min: 0.8, max: 0.89, count: 0 },
    { range: '70-79%', min: 0.7, max: 0.79, count: 0 },
    { range: '60-69%', min: 0.6, max: 0.69, count: 0 },
    { range: '0-59%', min: 0, max: 0.59, count: 0 },
  ]

  // 统计各分数段人数
  scores.forEach(({ score }) => {
    const rate = score / maxScore
    const segment = segments.find((s) => rate >= s.min && rate <= s.max)
    if (segment) segment.count++
  })

  return segments
})

// 计算最大计数用于直方图高度
const maxCount = computed(() => {
  if (scoreSegments.value.length === 0) return 1
  return Math.max(...scoreSegments.value.map((segment) => segment.count)) || 1
})

// ==================== 视图数据计算 ====================

// 各题目统计（用于全部题目视图）
const questionStats = computed(() => {
  return examDataStore.questions.map((question) => {
    const questionScores = examDataStore.highlightDataList
      .filter((data) => data.question_id === question.question_id)
      .map((data) => data.total_score)

    if (questionScores.length === 0) {
      return {
        id: question.question_id,
        name: `Question ${question.question_id}`,
        averageScore: 0,
        maxScore: question.score,
        scoreRate: 0,
        gradedCount: 0,
      }
    }

    const averageScore =
      Math.round(
        (questionScores.reduce((sum, score) => sum + score, 0) / questionScores.length) * 10,
      ) / 10
    const scoreRate = Math.round((averageScore / question.score) * 100)

    return {
      id: question.question_id,
      name: `Question ${question.question_id}`,
      averageScore,
      maxScore: question.score,
      scoreRate,
      gradedCount: questionScores.length,
    }
  })
})

// 学生成绩列表（用于单个题目视图）
const studentScores = computed(() => {
  if (currentQuestionId.value === 0) return []

  return currentQuestionScores.value
    .map(({ studentId, score, maxScore }) => ({
      studentId,
      score,
      scoreRate: Math.round((score / maxScore) * 100),
    }))
    .sort((a, b) => b.score - a.score) // 按分数降序排列
})

// 根据分数段筛选学生成绩
const filteredStudentScores = computed(() => {
  if (!selectedScoreRange.value) return studentScores.value

  const segment = scoreSegments.value.find((s) => s.range === selectedScoreRange.value)
  if (!segment) return studentScores.value

  return studentScores.value.filter((student) => {
    const rate = student.scoreRate / 100
    return rate >= segment.min && rate <= segment.max
  })
})

// ==================== 事件处理 ====================

// 选择题目
const selectQuestion = (questionId: number) => {
  currentQuestionId.value = questionId
  selectedScoreRange.value = '' // 切换题目时清除分数段筛选
  console.log('Selected question:', questionId === 0 ? 'All Questions' : `Question ${questionId}`)
}

// 选择分数段
const selectScoreRange = (range: string) => {
  selectedScoreRange.value = selectedScoreRange.value === range ? '' : range
  console.log('Selected score range:', selectedScoreRange.value || 'All')
}

// 点击空白区域清除筛选
const handleHistogramClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    selectedScoreRange.value = ''
  }
}

// 清除分数段筛选
const clearScoreFilter = () => {
  selectedScoreRange.value = ''
}

// 查看学生试卷
const viewStudentPaper = (studentId: number) => {
  selectedStudentId.value = studentId
  paperDialogVisible.value = true
  console.log('View student paper:', studentId)
}

// ==================== 初始化 ====================

onMounted(() => {
  // 从本地恢复数据
  examDataStore.loadFromLocal()

  // 默认选择第一个题目（如果有的话）
  if (examDataStore.questions.length > 0) {
    currentQuestionId.value = examDataStore.questions[0].question_id
  }
})
</script>

<style scoped>
/* ==================== 主布局 ==================== */
.report-page {
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

/* ==================== 通用卡片样式 ==================== */
.question-selection,
.current-question-info,
.statistics-overview,
.score-distribution,
.all-questions-statistics,
.student-scores-section {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-selection:hover,
.current-question-info:hover,
.statistics-overview:hover,
.score-distribution:hover,
.all-questions-statistics:hover,
.student-scores-section:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* ==================== 卡片标题 ==================== */
.question-selection h2,
.score-distribution h2,
.all-questions-statistics h2,
.student-scores-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
  padding: 16px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

/* ==================== 题目选择 ==================== */
.question-selection {
  overflow: hidden;
}

.question-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 20px;
}

.question-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-card:hover,
.question-card.active {
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

.question-card.active {
  background: rgba(0, 122, 255, 0.05);
}

.question-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
}

.question-score {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.question-stats {
  font-size: 12px;
  color: #007aff;
}

/* ==================== 当前题目信息 ==================== */
.current-question-info {
  padding: 24px;
}

.current-question-info h2 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.question-content {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.6;
  margin: 0 0 12px 0;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.question-detail {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

/* ==================== 统计概览 ==================== */
.statistics-overview {
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* ==================== 分数分布图表 ==================== */
.score-distribution,
.all-questions-statistics,
.student-scores-section {
  overflow: hidden;
}

.histogram {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 250px;
  padding: 20px;
  background: #fafafa;
  cursor: pointer;
  margin: 0;
  position: relative;
}

.histogram-bar {
  background: linear-gradient(to top, #409eff, #67c23a);
  border-radius: 6px;
  width: 60px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 40px;
}

.histogram-bar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.histogram-bar.active {
  background: linear-gradient(to top, #ff6b6b, #ffa500);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.bar-visual {
  height: 100%;
  width: 100%;
  border-radius: 6px;
  background: inherit;
}

.bar-info {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  white-space: nowrap;
}

.bar-range {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 2px;
}

.bar-count {
  font-size: 13px;
  font-weight: 500;
  color: #007aff;
}

.filter-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #f0f9ff;
  border-top: 1px solid #bae6fd;
}

.filter-text {
  color: #0369a1;
  font-weight: 500;
}

/* ==================== 题目统计网格 ==================== */
.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px;
}

.question-stat-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.question-stat-card:hover {
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.question-name {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.question-score {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.question-rate {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
}

.question-count {
  font-size: 12px;
  color: #007aff;
  margin-top: 8px;
}

.question-progress {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #409eff, #67c23a);
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* ==================== 学生成绩表格 ==================== */
.scores-table {
  margin: 0;
  border: none;
  border-radius: 0;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  background: #f5f5f5;
  border-bottom: 1px solid #e4e7ed;
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  border-right: 1px solid #e4e7ed;
}

.header-cell:last-child {
  border-right: none;
}

.table-body {
  max-height: 400px;
  overflow-y: auto;
  background: #ffffff;
}

.score-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.2s ease;
}

.score-row:hover {
  background-color: #f5f7fa;
}

.score-row.high-score {
  background-color: rgba(103, 194, 58, 0.1);
}

.score-row.low-score {
  background-color: rgba(220, 53, 69, 0.1);
}

.cell {
  padding: 12px 16px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
}

.cell:last-child {
  border-right: none;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pass {
  background-color: #f0f9ff;
  color: #1d4ed8;
}

.status-badge.fail {
  background-color: #fef2f2;
  color: #dc2626;
}

/* ==================== 滚动条样式 ==================== */
.report-page :deep(*)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.report-page :deep(*)::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 3px;
}

.report-page :deep(*)::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.report-page :deep(*)::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

/* ==================== 弹窗样式 ==================== */
.report-page :deep(.el-dialog) {
  border-radius: 12px;
}

.report-page :deep(.el-dialog__header) {
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

.report-page :deep(.el-dialog__body) {
  padding: 0;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1200px) {
  .report-page {
    padding: 16px;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .report-page {
    padding: 12px;
    gap: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .questions-grid,
  .question-cards {
    grid-template-columns: 1fr;
  }

  .histogram {
    height: 200px;
    padding: 15px;
  }

  .histogram-bar {
    width: 40px;
  }

  .table-header,
  .score-row {
    grid-template-columns: 2fr 1fr 1fr 2fr;
  }

  .header-cell:nth-child(4),
  .cell:nth-child(4) {
    display: none;
  }
}
</style>
