<template>
  <el-card class="paper-upload-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <el-icon class="card-icon"><document /></el-icon>
          </div>
          <h3>Paper Management</h3>
        </div>
        <el-tag 
          v-if="examPaper.status === 'ready'" 
          type="success" 
          effect="dark"
          class="status-tag"
        >
          <el-icon><check /></el-icon>
          Ready
        </el-tag>
        <el-tag 
          v-else 
          type="info" 
          effect="plain"
          class="status-tag waiting-tag"
        >
          <el-icon><clock /></el-icon>
          Waiting for Setting
        </el-tag>
      </div>
    </template>
    
    <div class="paper-content">
      <!-- 上传新试卷 -->
      <div class="upload-section">
        <div class="section-header">
          <el-icon class="section-icon"><upload /></el-icon>
          <h4>Upload Paper File</h4>
        </div>
        <el-upload
          v-model:file-list="paperFileList"
          class="paper-upload"
          :auto-upload="false"
          :on-change="handlePaperUpload"
          :on-remove="handlePaperRemove"
          :before-remove="beforePaperRemove"
          accept=".txt,.doc,.docx,.pdf"
          :limit="1"
          :on-exceed="handlePaperExceed"
          drag
        >
          <div class="upload-content">
            <el-icon class="upload-icon"><upload-filled /></el-icon>
            <div class="upload-text">
              <p class="upload-main">Click or drag the file here</p>
              <p class="upload-hint">Support TXT, DOC, DOCX, PDF format</p>
            </div>
          </div>
        </el-upload>
      </div>
      
      <!-- 当前试卷状态 -->
      <div v-if="examPaper.name" class="current-status">
        <div class="status-card">
          <div class="status-content">
            <div class="status-info">
              <el-icon class="status-icon"><circle-check-filled /></el-icon>
              <span class="status-text">当前试卷：{{ examPaper.name }}。解析完成，共{{ examPaper.questionCount }}道题目</span>
            </div>
            <div class="action-buttons">
              <el-button 
                type="primary" 
                link 
                @click="$emit('preview-paper')"
                class="action-btn"
              >
                <el-icon><view /></el-icon>
                预览
              </el-button>
              <el-button 
                type="warning" 
                link 
                @click="$emit('reparse-paper')"
                class="action-btn"
              >
                <el-icon><refresh /></el-icon>
                重新解析
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import {
  Check,
  CircleCheckFilled,
  Clock,
  Document,
  Refresh,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'

// Props
const props = defineProps({
  examPaper: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'paper-uploaded', 
  'paper-removed',
  'preview-paper',
  'reparse-paper'
])

// Local state
const paperFileList = ref([])

// Methods
const handlePaperUpload = (file, fileList) => {
  emit('paper-uploaded', file)
}

const handlePaperRemove = () => {
  emit('paper-removed')
}

const beforePaperRemove = (file) => {
  return ElMessageBox.confirm(
    `确定要移除试卷文件 ${file.name} 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => true, () => false)
}

const handlePaperExceed = () => {
  ElMessage.warning('只能上传1个试卷文件')
}
</script>

<style scoped>
.paper-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 0px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.paper-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.paper-upload-card :deep(.el-card__header) {
  border-bottom: none;  /* 去掉卡片头部下划线 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 16px;  /* 试卷上传卡片头部的间距 */
  background: #e6d8c9;
  margin: -20px -20px 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.card-icon {
  font-size: 20px;
  color: rgb(0, 0, 0);
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: rgb(0, 0, 0);
}

.status-tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.waiting-tag {
  background: rgba(255, 255, 255, 0.9);
  color: #909399;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.paper-content {
  /* 移除外部padding，由父组件统一管理 */
  display: flex;
  flex-direction: column;
}

.upload-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f4f8;
  transition: all 0.3s ease;
}

.upload-section:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  color: #4f46e5;
  font-size: 18px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.paper-upload {
  width: 100%;
}

.paper-upload :deep(.el-upload-dragger) {
  border: 2px dashed #c7d2fe;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  min-height: 100px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-upload :deep(.el-upload-dragger:hover) {
  border-color: #4f46e5;
  background: #f8fafc;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-icon {
  font-size: 36px;
  color: #4f46e5;
  opacity: 0.8;
}

.upload-text {
  text-align: center;
}

.upload-main {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.upload-hint {
  font-size: 14px;
  color: #8590a6;
  margin: 0;
}

.current-status {
  margin-top: 20px;
}

.status-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #bae6fd;
  box-shadow: 0 2px 12px rgba(14, 165, 233, 0.08);
}

.status-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  font-size: 20px;
  color: #0ea5e9;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn[type="primary"]:hover {
  background: #3b82f6;
  color: white;
}

.action-btn[type="warning"]:hover {
  background: #f59e0b;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .action-buttons {
    align-self: flex-start;
  }
}
</style> 