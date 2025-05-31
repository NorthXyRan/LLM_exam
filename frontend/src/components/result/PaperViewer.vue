<template>
  <div class="paper-viewer">
    <!-- 试卷头部信息 -->
    <div class="paper-header">
      <div class="paper-info">
        <h2 class="paper-title">{{ paperData.title || '试卷详情' }}</h2>
        <div class="paper-meta">
          <span class="exam-info">{{ paperData.examName }}</span>
          <span class="anonymous-info" v-if="paperData.anonymousId">
            学生{{ paperData.anonymousId }}
          </span>
        </div>
      </div>
      <div class="score-summary">
        <div class="total-score">
          <span class="label">总分</span>
          <span class="score">{{ paperData.totalScore }}</span>
          <span class="max-score">/ {{ paperData.maxScore }}</span>
        </div>
      </div>
    </div>

    <!-- 高亮图例 -->
    <div class="highlight-legend">
      <h4>高亮说明</h4>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color correct"></span>
          <span>正确要点</span>
        </div>
        <div class="legend-item">
          <span class="legend-color excellent"></span>
          <span>优秀表述</span>
        </div>
        <div class="legend-item">
          <span class="legend-color unclear"></span>
          <span>表述不清</span>
        </div>
        <div class="legend-item">
          <span class="legend-color wrong"></span>
          <span>错误内容</span>
        </div>
      </div>
    </div>

    <!-- 试卷内容 -->
    <div class="paper-content">
      <div
        v-for="(question, index) in paperData.questions"
        :key="question.id || index"
        class="question-section"
      >
        <!-- 题目标题 -->
        <div class="question-header">
          <h3 class="question-title">
            {{ question.title || `第${index + 1}题` }}
            <span class="question-score">({{ question.score }}/{{ question.maxScore }}分)</span>
          </h3>
        </div>

        <!-- 题目内容 -->
        <div class="question-content" v-if="question.content">
          <h4>题目内容</h4>
          <div class="content-text">{{ question.content }}</div>
        </div>

        <!-- 学生答案 -->
        <div class="answer-section">
          <h4>学生答案</h4>
          <div
            class="answer-content"
            v-html="highlightAnswer(question.answer, question.highlights)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 类型定义
interface Highlight {
  start: number
  end: number
  type: 'correct' | 'wrong' | 'unclear' | 'excellent'
  reason: string
}

interface Question {
  id?: string | number
  title?: string
  content?: string
  answer: string
  score: number
  maxScore: number
  highlights?: Highlight[]
}

interface PaperData {
  title?: string
  examName?: string
  anonymousId?: string
  totalScore: number
  maxScore: number
  questions: Question[]
}

// Props
interface Props {
  paperData: PaperData
}

defineProps<Props>()

// 方法
const highlightAnswer = (content: string, highlights?: Highlight[]): string => {
  if (!highlights || highlights.length === 0) return content
  
  let result = content
  const typeColors = {
    correct: '#52c41a',
    wrong: '#ff4d4f',
    unclear: '#faad14',
    excellent: '#1890ff'
  }

  // 按位置倒序排列，避免位置偏移
  const sortedHighlights = [...highlights].sort((a, b) => b.start - a.start)
  
  sortedHighlights.forEach(highlight => {
    const color = typeColors[highlight.type] || '#d9d9d9'
    const highlightedText = `<span style="background-color: ${color}20; border-left: 3px solid ${color}; padding: 2px 4px; margin: 0 2px;" title="${highlight.reason}">${content.substring(highlight.start, highlight.end)}</span>`
    result = result.substring(0, highlight.start) + highlightedText + result.substring(highlight.end)
  })
  
  return result
}
</script>

<style scoped>
.paper-viewer {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  margin: 0 auto;
}

/* 试卷头部 */
.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e5e5;
}

.paper-info {
  flex: 1;
}

.paper-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
}

.paper-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.exam-info {
  font-weight: 500;
  color: #007AFF;
}

.score-summary {
  text-align: right;
}

.total-score {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.score {
  font-size: 28px;
  font-weight: 600;
  color: #007AFF;
}

.max-score {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
}

/* 高亮图例 */
.highlight-legend {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.highlight-legend h4 {
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 12px;
  font-size: 16px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border-left: 3px solid;
}

.legend-color.correct {
  background-color: #52c41a20;
  border-color: #52c41a;
}

.legend-color.excellent {
  background-color: #1890ff20;
  border-color: #1890ff;
}

.legend-color.unclear {
  background-color: #faad1420;
  border-color: #faad14;
}

.legend-color.wrong {
  background-color: #ff4d4f20;
  border-color: #ff4d4f;
}

/* 试卷内容 */
.paper-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.question-section {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
}

.question-header {
  margin-bottom: 16px;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
}

.question-score {
  color: #007AFF;
  font-weight: 500;
  margin-left: 8px;
}

.question-content {
  margin-bottom: 20px;
}

.question-content h4,
.answer-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 12px;
  border-left: 4px solid #007AFF;
  padding-left: 12px;
}

.content-text,
.answer-content {
  background: white;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
  border: 1px solid #e5e5e5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .paper-viewer {
    padding: 16px;
  }
  
  .paper-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .score-summary {
    text-align: left;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 8px;
  }
}
</style>