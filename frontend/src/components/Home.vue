<template>
  <div class="main-content">
    <h2>欢迎使用智能阅卷系统</h2>
    <p>请从左侧菜单选择功能开始使用</p>
    <div class="feature-cards">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="feature-card" @click="handleCardClick('uploading')">
            <el-icon class="card-icon"><Upload /></el-icon>
            <h3>文件上传</h3>
            <p>上传考试文件进行智能评分</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="feature-card" @click="handleCardClick('grading')">
            <el-icon class="card-icon"><Document /></el-icon>
            <h3>智能评分</h3>
            <p>AI 自动评分，快速准确</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="feature-card" @click="handleCardClick('result')">
            <el-icon class="card-icon"><DataAnalysis /></el-icon>
            <h3>结果分析</h3>
            <p>详细的评分报告和数据分析</p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis, Document, Upload } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleCardClick = (path: string) => {
  router.push(`/${path}`)
}
</script>

<style scoped>
.main-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.main-content h2 {
  color: #409eff;
  margin-bottom: 15px;
}

.main-content p {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
}

.feature-cards {
  margin-top: 20px;
}

.feature-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: #409eff;
  margin-bottom: 10px;
  font-size: 18px;
}

.feature-card p {
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>