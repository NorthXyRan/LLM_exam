<template>
  <el-card class="paper-upload-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <el-icon class="card-icon"><document /></el-icon>
          </div>
          <h3>试卷管理</h3>
        </div>
        <el-tag 
          v-if="examPaper.status === 'ready'" 
          type="success" 
          effect="dark"
          class="status-tag"
        >
          <el-icon><check /></el-icon>
          已就绪
        </el-tag>
        <el-tag 
          v-else 
          type="info" 
          effect="plain"
          class="status-tag waiting-tag"
        >
          <el-icon><clock /></el-icon>
          待设置
        </el-tag>
      </div>
    </template>
    
    <div class="paper-content">
      <div class="upload-options">
        <!-- 选择已有试卷 -->
        <div class="option-item">
          <div class="option-header">
            <el-icon class="option-icon"><folder /></el-icon>
            <h4>选择已有试卷</h4>
          </div>
          <el-select 
            v-model="selectedExistingPaper" 
            placeholder="从试卷库中选择..."
            size="large"
            class="paper-select"
            @change="handleExistingPaperChange"
          >
            <el-option
              v-for="paper in existingPapers"
              :key="paper.id"
              :label="paper.name"
              :value="paper.id"
            >
              <div class="option-content">
                <span class="option-name">{{ paper.name }}</span>
                <span class="option-meta">{{ paper.questionCount }}道题目</span>
              </div>
            </el-option>
          </el-select>
        </div>
        
        <!-- 上传新试卷 -->
        <div class="option-item">
          <div class="option-header">
            <el-icon class="option-icon"><upload /></el-icon>
            <h4>上传新试卷</h4>
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
                <p class="upload-main">点击或拖拽文件到此处</p>
                <p class="upload-hint">支持 TXT、DOC、DOCX、PDF 格式</p>
              </div>
            </div>
          </el-upload>
        </div>
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
  Folder,
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
  },
  existingPapers: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'paper-selected',
  'paper-uploaded', 
  'paper-removed',
  'preview-paper',
  'reparse-paper'
])

// Local state
const selectedExistingPaper = ref('')
const paperFileList = ref([])

// Methods
const handleExistingPaperChange = (paperId) => {
  const paper = props.existingPapers.find(p => p.id === paperId)
  if (paper) {
    emit('paper-selected', paper)
    paperFileList.value = []
  }
}

const handlePaperUpload = (file, fileList) => {
  emit('paper-uploaded', file)
  selectedExistingPaper.value = ''
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
  border: 1px solid #e8f4fd;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.paper-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  margin: -20px -20px 0;
  color: white;
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
  color: white;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.status-tag {
  padding: 8px 16px;  /* 已就绪 */
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
  padding: 6px 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;  /* 文字框和两个按钮之间的间距 */
}

.upload-options {
  display: flex;
  align-items: stretch;
  gap: 24px;  /* 上传选项之间的间距 */
}

.option-item {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f4f8;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.option-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.option-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.option-icon {
  color: #4f46e5;
  font-size: 18px;
}

.option-item h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.paper-select {
  width: 100%;
  flex: 1;
}

.paper-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 2px solid #e0e7ff;
  transition: all 0.3s ease;
  min-height: 40px;
}

.paper-select :deep(.el-input__wrapper:hover) {
  border-color: #4f46e5;
}

.paper-select :deep(.el-input__wrapper.is-focus) {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-name {
  font-weight: 500;
  color: #2c3e50;
}

.option-meta {
  font-size: 12px;
  color: #8590a6;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 12px;
}

.paper-upload {
  width: 100%;
  flex: 1;
}

.paper-upload :deep(.el-upload-dragger) {
  border: 2px dashed #c7d2fe;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.3s ease;
  padding: 12px 16px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
}

.paper-upload :deep(.el-upload-dragger:hover) {
  border-color: #4f46e5;
  background: #f8fafc;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-icon {
  font-size: 20px;
  color: #4f46e5;
  opacity: 0.8;
  flex-shrink: 0;
}

.upload-text {
  text-align: left;
  flex: 1;
}

.upload-main {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 1px 0;
}

.upload-hint {
  font-size: 11px;
  color: #8590a6;
  margin: 0;
  line-height: 1.2;
}

.current-status {
  margin-top: 4px;
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
  .upload-options {
    flex-direction: column;
    gap: 24px;
  }
  
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