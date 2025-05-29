<template>
  <div class="grading-page">
    <div class="page-header">
      <h1>智能评分</h1>
      <el-button @click="goBack" type="primary">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </el-button>
    </div>
    
    <div class="page-content">
      <el-card>
        <h2>AI 智能评分系统</h2>
        <p>使用先进的人工智能技术，为您的考试文件提供快速、准确的评分服务</p>
        
        <div class="grading-status">
          <el-steps :active="1" finish-status="success">
            <el-step title="文件上传" description="上传考试文件"></el-step>
            <el-step title="智能分析" description="AI 分析文件内容"></el-step>
            <el-step title="评分计算" description="计算分数和评语"></el-step>
            <el-step title="生成报告" description="生成详细报告"></el-step>
          </el-steps>
        </div>
        
        <div class="grading-actions">
          <el-button type="primary" size="large">
            <el-icon><VideoPlay /></el-icon>
            开始评分
          </el-button>
          <el-button size="large">
            <el-icon><Setting /></el-icon>
            评分设置
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Setting, VideoPlay } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.grading-page {
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

.grading-status {
  margin: 30px 0;
}

.grading-actions {
  text-align: center;
  margin-top: 30px;
}

.grading-actions .el-button {
  margin: 0 10px;
}
</style>
