<template>
  <div class="result-page">
    <div class="page-header">
      <h1>评分结果</h1>
      <el-button @click="goBack" type="primary">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </el-button>
    </div>
    
    <div class="page-content">
      <el-row :gutter="20">
        <!-- 评分概览 -->
        <el-col :span="8">
          <el-card class="score-card">
            <h3>总体评分</h3>
            <div class="score-display">
              <span class="score">85</span>
              <span class="score-unit">分</span>
            </div>
            <el-progress :percentage="85" color="#67c23a" />
          </el-card>
        </el-col>
        
        <!-- 评分详情 -->
        <el-col :span="16">
          <el-card>
            <h3>评分详情</h3>
            <el-table :data="scoreDetails" style="width: 100%">
              <el-table-column prop="item" label="评分项目" width="150" />
              <el-table-column prop="score" label="得分" width="80" />
              <el-table-column prop="total" label="总分" width="80" />
              <el-table-column prop="comment" label="评语" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 详细报告 -->
      <el-card style="margin-top: 20px;">
        <h3>详细分析报告</h3>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="评分报告" name="report">
            <p>这里显示详细的评分报告内容...</p>
          </el-tab-pane>
          <el-tab-pane label="改进建议" name="suggestions">
            <p>这里显示改进建议...</p>
          </el-tab-pane>
          <el-tab-pane label="历史对比" name="history">
            <p>这里显示历史评分对比...</p>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      
      <!-- 操作按钮 -->
      <div class="result-actions">
        <el-button type="primary">
          <el-icon><Download /></el-icon>
          下载报告
        </el-button>
        <el-button>
          <el-icon><Share /></el-icon>
          分享结果
        </el-button>
        <el-button>
          <el-icon><Refresh /></el-icon>
          重新评分
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Download, Refresh, Share } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('report')

const scoreDetails = ref([
  { item: '内容准确性', score: 20, total: 25, comment: '内容基本准确，有少量错误' },
  { item: '逻辑结构', score: 18, total: 20, comment: '逻辑清晰，结构合理' },
  { item: '语言表达', score: 22, total: 25, comment: '表达流畅，用词恰当' },
  { item: '创新性', score: 15, total: 20, comment: '有一定创新思路' },
  { item: '完整性', score: 10, total: 10, comment: '内容完整' }
])

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.result-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #409eff;
}

.page-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.score-card {
  text-align: center;
}

.score-display {
  margin: 20px 0;
}

.score {
  font-size: 48px;
  font-weight: bold;
  color: #67c23a;
}

.score-unit {
  font-size: 18px;
  color: #666;
  margin-left: 5px;
}

.result-actions {
  text-align: center;
  margin-top: 30px;
}

.result-actions .el-button {
  margin: 0 10px;
}
</style>
