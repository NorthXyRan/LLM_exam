<template>
  <el-card class="student-upload-card" :class="{ disabled: disabled }">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <el-icon class="card-icon"><user /></el-icon>
          </div>
          <h3>学生答卷</h3>
        </div>
        <el-tag 
          v-if="studentPapers.length > 0 && validStudentPapers > 0" 
          type="success" 
          effect="dark"
          class="status-tag"
        >
          <el-icon><check /></el-icon>
          {{ validStudentPapers }}份有效
        </el-tag>
        <el-tag 
          v-else-if="disabled" 
          type="info" 
          effect="plain"
          class="status-tag waiting-tag"
        >
          <el-icon><clock /></el-icon>
          等待上传
        </el-tag>
        <el-tag 
          v-else 
          type="warning" 
          effect="plain"
          class="status-tag waiting-tag"
        >
          <el-icon><clock /></el-icon>
          待上传
        </el-tag>
      </div>
    </template>
    
    <div class="student-content">
      <el-alert 
        v-if="disabled" 
        title="请先完成试卷和参考答案的设置" 
        type="warning" 
        :closable="false"
        show-icon
        class="disabled-alert"
      />
      
      <template v-else>
        <!-- 批量上传学生答卷 -->
        <div class="upload-section">
          <div class="section-header">
            <el-icon class="section-icon"><upload /></el-icon>
            <h4>批量上传答卷</h4>
          </div>
          <el-upload
            class="student-upload"
            drag
            multiple
            :auto-upload="false"
            :on-change="handleStudentPapersUpload"
            accept=".txt,.csv"
            :show-file-list="false"
          >
            <div class="upload-content">
              <el-icon class="upload-icon"><upload-filled /></el-icon>
              <div class="upload-text">
                <p class="upload-main">批量上传学生答卷</p>
                <p class="upload-hint">支持多文件拖拽，TXT、CSV 格式</p>
              </div>
            </div>
          </el-upload>
          
          <div v-if="parsing" class="parsing-status">
            <el-icon class="is-loading"><loading /></el-icon>
            <span>正在解析答卷文件...</span>
          </div>
        </div>
        
        <!-- 解析结果 -->
        <div v-if="studentPapers.length > 0" class="results-section">
          <div class="status-card">
            <div class="status-content">
              <div class="status-info">
                <el-icon class="status-icon">
                  <circle-check-filled v-if="validStudentPapers > 0" />
                  <circle-close-filled v-else />
                </el-icon>
                <span class="status-text">
                  解析完成：共上传 {{ studentPapers.length }} 份答卷，其中 {{ validStudentPapers }} 份有效
                </span>
              </div>
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  link 
                  @click="$emit('preview-papers')"
                  class="action-btn"
                >
                  <el-icon><view /></el-icon>
                  预览
                </el-button>
                <el-button 
                  type="warning" 
                  link 
                  @click="$emit('manage-papers')"
                  class="action-btn"
                >
                  <el-icon><setting /></el-icon>
                  管理
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 详细列表 -->
          <div class="results-list">
            <div 
              v-for="paper in studentPapers" 
              :key="paper.id"
              class="result-item"
              :class="{ success: paper.valid, error: !paper.valid }"
            >
              <el-icon v-if="paper.valid" class="item-status-icon success"><check /></el-icon>
              <el-icon v-else class="item-status-icon error"><close /></el-icon>
              <span class="filename">{{ paper.filename }}</span>
              <span class="status-text">
                {{ paper.valid ? `${paper.questionCount}题完整` : paper.error }}
              </span>
              <el-button 
                v-if="!paper.valid" 
                link 
                type="primary" 
                size="small"
                @click="$emit('reparse-paper', paper)"
                class="reparse-btn"
              >
                重新解析
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </el-card>
</template>

<script setup>
import {
  Check,
  CircleCheckFilled,
  CircleCloseFilled,
  Clock,
  Close,
  Loading,
  Setting,
  Upload,
  UploadFilled,
  User
} from '@element-plus/icons-vue'
import { computed } from 'vue'

// Props
const props = defineProps({
  studentPapers: {
    type: Array,
    required: true
  },
  parsing: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  examPaper: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'papers-uploaded',
  'reparse-paper',
  'preview-papers',
  'manage-papers'
])

// Computed
const validStudentPapers = computed(() => {
  return props.studentPapers.filter(paper => paper.valid).length
})

// Methods
const handleStudentPapersUpload = (file, fileList) => {
  emit('papers-uploaded', fileList)
}
</script>

<style scoped>
.student-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8f4fd;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.student-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.student-upload-card.disabled {
  opacity: 0.7;
  filter: grayscale(0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 16px;
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
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

.student-content {
  padding: 4px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.disabled-alert {
  border-radius: 12px;
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
  color: #7c3aed;
  font-size: 18px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.student-upload {
  width: 100%;
}

.student-upload :deep(.el-upload-dragger) {
  border: 2px dashed #c4b5fd;
  border-radius: 8px;
  background: #faf5ff;
  transition: all 0.3s ease;
  padding: 4px;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-upload :deep(.el-upload-dragger:hover) {
  border-color: #7c3aed;
  background: #f3f4f6;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-icon {
  font-size: 28px;
  color: #7c3aed;
  opacity: 0.8;
  flex-shrink: 0;
}

.upload-text {
  text-align: left;
  flex: 1;
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

.parsing-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7c3aed;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #bbf7d0;
  box-shadow: 0 2px 12px rgba(34, 197, 94, 0.08);
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
  color: #22c55e;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #166534;
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

.results-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f4f8;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f8fafc;
  transition: all 0.3s ease;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: #f8fafc;
}

.result-item.success {
  background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%);
}

.result-item.error {
  background: linear-gradient(90deg, #fef2f2 0%, #ffffff 100%);
}

.item-status-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.item-status-icon.success {
  color: #22c55e;
}

.item-status-icon.error {
  color: #ef4444;
}

.filename {
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.result-item .status-text {
  color: #8590a6;
  font-size: 14px;
  font-weight: 400;
}

.reparse-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
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
  
  .upload-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .upload-text {
    text-align: center;
  }
}
</style> 