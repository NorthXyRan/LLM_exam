<template>
  <div class="report-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>考试成绩报告</h1>
    </div>

    <!-- 统计概览 -->
    <div class="statistics-overview">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ statistics.average }}</div>
          <div class="stat-label">平均分</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.highest }}</div>
          <div class="stat-label">最高分</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.lowest }}</div>
          <div class="stat-label">最低分</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ statistics.median }}</div>
          <div class="stat-label">中位数</div>
        </div>
      </div>
    </div>

    <!-- 分数分布 -->
    <div class="score-distribution">
      <h2>分数分布</h2>
      <div class="histogram">
        <div 
          v-for="segment in scoreSegments" 
          :key="segment.range"
          class="histogram-bar"
          :style="{ height: `${(segment.count / maxCount) * 200}px` }"
        >
          <div class="bar-count">{{ segment.count }}</div>
          <div class="bar-label">{{ segment.range }}</div>
        </div>
      </div>
    </div>

    <!-- 题目统计 -->
    <div class="question-statistics">
      <h2>各题平均分统计</h2>
      <div class="question-grid">
        <div 
          v-for="question in questionStats" 
          :key="question.id"
          class="question-card"
        >
          <div class="question-header">
            <span class="question-name">{{ question.name }}</span>
            <span class="question-score">{{ question.averageScore }}/{{ question.maxScore }}</span>
          </div>
          <div class="question-rate">得分率: {{ question.scoreRate }}%</div>
          <div class="question-progress">
            <div class="progress-bar" :style="{ width: `${question.scoreRate}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 模拟统计数据
const statistics = ref({
  average: 75.5,
  highest: 98,
  lowest: 45,
  median: 76
})

// 分数段数据
const scoreSegments = ref([
  { range: '90-100', count: 10 },
  { range: '80-89', count: 15 },
  { range: '70-79', count: 12 },
  { range: '60-69', count: 8 },
  { range: '0-59', count: 5 }
])

// 题目统计数据
const questionStats = ref([
  {
    id: 1,
    name: '第一题',
    averageScore: 22.5,
    maxScore: 30,
    scoreRate: 75
  },
  {
    id: 2,
    name: '第二题',
    averageScore: 18.8,
    maxScore: 25,
    scoreRate: 75.2
  },
  {
    id: 3,
    name: '第三题',
    averageScore: 19.2,
    maxScore: 25,
    scoreRate: 76.8
  },
  {
    id: 4,
    name: '第四题',
    averageScore: 15.0,
    maxScore: 20,
    scoreRate: 75
  }
])

// 计算最大计数用于直方图高度
const maxCount = computed(() => {
  return Math.max(...scoreSegments.value.map(segment => segment.count))
})
</script>

<style scoped>
.report-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
}

/* 统计概览 */
.statistics-overview {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e4e7ed;
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

/* 分数分布 */
.score-distribution,
.question-statistics {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.score-distribution h2,
.question-statistics h2 {
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 20px;
  border-left: 4px solid #007AFF;
  padding-left: 12px;
}

.histogram {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 250px;
  padding: 20px 0;
}

.histogram-bar {
  background: linear-gradient(to top, #409eff, #67c23a);
  border-radius: 4px 4px 0 0;
  width: 60px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  transition: all 0.3s ease;
}

.histogram-bar:hover {
  transform: scale(1.05);
}

.bar-count {
  color: white;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

/* 题目统计 */
.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.question-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .report-page {
    padding: 12px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .question-grid {
    grid-template-columns: 1fr;
  }
  
  .histogram {
    height: 200px;
  }
  
  .histogram-bar {
    width: 40px;
  }
}
</style>