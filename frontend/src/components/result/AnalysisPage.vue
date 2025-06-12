<template>
  <div class="analysis-page">
    <div class="empty-state">
      <div class="empty-icon">
        <el-icon size="64"><DataAnalysis /></el-icon>
      </div>
      <h2>详细分析功能</h2>
      <p>此功能正在开发中，敬请期待...</p>
      <div class="feature-preview">
        <h3>即将推出的功能：</h3>
        <ul>
          <li>学生答题行为分析</li>
          <li>知识点掌握情况统计</li>
          <li>答题时间分布分析</li>
          <li>错误模式识别</li>
          <li>个性化学习建议</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis } from '@element-plus/icons-vue'
</script>

<style scoped>
.analysis-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.empty-icon {
  margin-bottom: 24px;
  color: #409eff;
}

.empty-state h2 {
  font-size: 28px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 12px;
}

.empty-state > p {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 32px;
}

.feature-preview {
  text-align: left;
  background: #f8fafc;
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.feature-preview h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 16px;
}

.feature-preview ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-preview li {
  padding: 8px 0;
  color: rgba(0, 0, 0, 0.7);
  position: relative;
  padding-left: 20px;
}

.feature-preview li::before {
  content: '•';
  color: #409eff;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .analysis-page {
    padding: 12px;
  }

  .empty-state {
    padding: 40px 24px;
  }

  .empty-state h2 {
    font-size: 24px;
  }
}
</style>
