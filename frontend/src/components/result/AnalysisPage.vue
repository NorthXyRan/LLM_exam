<template>
    <div class="analysis-page">
      <!-- 题目选择 -->
      <div class="score-analysis">
        <h2>题目选择</h2>
        <div class="stats-cards">
          <div 
            v-for="question in questionList"
            :key="question.id"
            class="stat-card"
            @click="selectQuestion(question.id)"
          >
            <div class="stat-value">{{ question.name }}</div>
          </div>
        </div>
      </div>
  
      <!-- 题目信息 -->
      <div class="question-info">
        <h2>{{ currentQuestion.name }}</h2>
        <p>{{ currentQuestion.content }}</p>
      </div>
  
      <!-- 分数分布分析 -->
      <div class="score-analysis">
        <h2>分数分布分析</h2>
        
        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-value">{{ currentQuestion.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ currentQuestion.highestScore }}</div>
            <div class="stat-label">最高分</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ currentQuestion.lowestScore }}</div>
            <div class="stat-label">最低分</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ currentQuestion.scoreRate }}%</div>
            <div class="stat-label">得分率</div>
          </div>
        </div>
  
        <!-- 分布图表 -->
        <div class="distribution-chart">
          <div class="chart-container">
            <div 
              v-for="(range, index) in currentQuestion.scoreDistribution" 
              :key="index"
              class="chart-bar"
              :style="{ height: `${(range.count / maxDistributionCount) * 200}px` }"
            >
              <div class="bar-count">{{ range.count }}</div>
              <div class="bar-range">{{ range.range }}</div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 学生答案列表 -->
      <div class="answers-section">
        <h2>学生答案</h2>
        <div class="answers-list">
          <div 
            v-for="answer in studentAnswers" 
            :key="answer.studentId"
            class="answer-item"
          >
            <div class="answer-header">
              <span class="student-id">学生{{ answer.anonymousId }}</span>
              <span class="score">{{ answer.score }}分</span>
            </div>
            <div class="answer-preview">
              {{ answer.content.substring(0, 100) }}...
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue'
  
  // 题目列表
  const questionList = ref([
    { id: 1, name: '第一题' },
    { id: 2, name: '第二题' },
    { id: 3, name: '第三题' },
    { id: 4, name: '第四题' }
  ])
  
  // 当前题目数据
  const currentQuestion = ref({
    id: 1,
    name: '第一题',
    content: '请分析人工智能在教育领域的应用前景，并结合具体案例说明其优势和挑战。',
    maxScore: 30,
    averageScore: 22.5,
    highestScore: 30,
    lowestScore: 8,
    scoreRate: 75,
    scoreDistribution: [
      { range: '25-30', count: 12 },
      { range: '20-24', count: 18 },
      { range: '15-19', count: 15 },
      { range: '10-14', count: 8 },
      { range: '0-9', count: 3 }
    ]
  })
  
  // 学生答案数据
  const studentAnswers = ref([
    {
      studentId: '2024001',
      anonymousId: 'A001',
      score: 28,
      content: '人工智能在教育领域的应用前景广阔，主要体现在个性化学习、智能评估和教学辅助三个方面。首先，在个性化学习方面，AI可以根据学生的学习习惯和能力水平，提供定制化的学习路径。例如，Khan Academy使用机器学习算法分析学生的答题模式，为每个学生推荐最适合的练习题目和学习资源。'
    },
    {
      studentId: '2024002',
      anonymousId: 'A002',
      score: 15,
      content: '人工智能在教育方面有很多用途。比如可以帮助老师批改作业，这样老师就不用那么累了。还有就是可以给学生推荐学习资料，让学习更有针对性。另外AI还能回答学生的问题，就像一个智能老师一样。'
    },
    {
      studentId: '2024003',
      anonymousId: 'A003',
      score: 30,
      content: '人工智能在教育领域的应用前景极其广阔，正在深刻改变传统教育模式。本文将从个性化学习、智能评估、教学辅助三个核心应用场景进行深入分析。在个性化学习方面，AI技术能够基于大数据分析为每个学生量身定制学习方案。'
    },
    {
      studentId: '2024004',
      anonymousId: 'A004',
      score: 8,
      content: '人工智能就是机器人，可以帮助学习。'
    }
  ])
  
  // 选择题目
  const selectQuestion = (questionId: number) => {
    console.log('选择题目:', questionId)
    // 这里可以添加切换题目的逻辑
  }
  
  // 计算属性
  const maxDistributionCount = computed(() => 
    Math.max(...currentQuestion.value.scoreDistribution.map(r => r.count))
  )
  </script>
  
  <style scoped>
  .analysis-page {
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
  }
  
  /* 题目信息 */
  .question-info {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .question-info h2 {
    font-size: 20px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
    margin: 0 0 12px 0;
  }
  
  .question-info p {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    line-height: 1.6;
    margin: 0;
  }
  
  /* 分数分析区域 */
  .score-analysis,
  .answers-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .score-analysis h2,
  .answers-section h2 {
    font-size: 20px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
    margin-bottom: 20px;
    border-left: 4px solid #007AFF;
    padding-left: 12px;
  }
  
  /* 统计卡片 */
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    border: 1px solid #e4e7ed;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    border-color: #007AFF;
    transform: translateY(-2px);
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
  
  /* 分布图表 */
  .chart-container {
    display: flex;
    align-items: end;
    justify-content: space-around;
    height: 250px;
    padding: 20px 0;
    background: #fafafa;
    border-radius: 8px;
  }
  
  .chart-bar {
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
  
  .chart-bar:hover {
    transform: scale(1.05);
  }
  
  .bar-count {
    color: white;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .bar-range {
    position: absolute;
    bottom: -25px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    white-space: nowrap;
  }
  
  /* 答案列表 */
  .answers-list {
    display: grid;
    gap: 16px;
  }
  
  .answer-item {
    background: white;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e4e7ed;
  }
  
  .answer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .student-id {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
  }
  
  .score {
    font-size: 18px;
    font-weight: 600;
    color: #409eff;
  }
  
  .answer-preview {
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.6;
    font-size: 14px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .analysis-page {
      padding: 12px;
    }
    
    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .chart-container {
      height: 200px;
    }
    
    .chart-bar {
      width: 40px;
    }
  }
  </style>