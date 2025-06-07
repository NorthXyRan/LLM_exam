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
          <div class="answer-content">{{ question.answer }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 类型定义
interface Question {
  id?: string | number
  title?: string
  content?: string
  answer: string
  score: number
  maxScore: number
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
  color: #007aff;
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
  color: #007aff;
}

.max-score {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
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
  color: #007aff;
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
  border-left: 4px solid #007aff;
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
}
</style>
