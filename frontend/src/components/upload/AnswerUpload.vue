<template>
  <el-card class="answer-upload-card" :class="{ disabled: disabled }">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <el-icon class="card-icon"><document-checked /></el-icon>
          </div>
          <h3>参考答案</h3>
        </div>
        <el-tag 
          v-if="referenceAnswer.status === 'ready'" 
          type="success" 
          effect="dark"
          class="status-tag"
        >
          <el-icon><check /></el-icon>
          已就绪
        </el-tag>
        <el-tag 
          v-else-if="disabled" 
          type="info" 
          effect="plain"
          class="status-tag waiting-tag"
        >
          <el-icon><clock /></el-icon>
          等待试卷
        </el-tag>
        <el-tag 
          v-else 
          type="warning" 
          effect="plain"
          class="status-tag waiting-tag"
        >
          <el-icon><clock /></el-icon>
          待设置
        </el-tag>
      </div>
    </template>
    
    <div class="answer-content">
      <el-alert 
        v-if="disabled" 
        title="请先完成试卷设置" 
        type="warning" 
        :closable="false"
        show-icon
        class="disabled-alert"
      />
      
      <template v-else>
        <div class="upload-options">
          <!-- 选择已有答案 -->
          <div class="option-item">
            <div class="option-header">
              <el-icon class="option-icon"><folder /></el-icon>
              <h4>选择已有答案</h4>
            </div>
            <el-select 
              v-model="selectedExistingAnswer" 
              placeholder="从答案库中选择..."
              size="large"
              class="answer-select"
              @change="handleExistingAnswerChange"
            >
              <el-option
                v-for="answer in availableAnswers"
                :key="answer.id"
                :label="answer.name"
                :value="answer.id"
              >
                <div class="option-content">
                  <span class="option-name">{{ answer.name }}</span>
                  <span class="option-meta">{{ answer.answerCount }}道答案</span>
                </div>
              </el-option>
            </el-select>
          </div>
          
          <!-- 上传新答案 -->
          <div class="option-item">
            <div class="option-header">
              <el-icon class="option-icon"><upload /></el-icon>
              <h4>上传新答案</h4>
            </div>
            <el-upload
              v-model:file-list="answerFileList"
              class="answer-upload"
              :auto-upload="false"
              :on-change="handleAnswerUpload"
              :on-remove="handleAnswerRemove"
              :before-remove="beforeAnswerRemove"
              accept=".txt,.doc,.docx"
              :limit="1"
              :on-exceed="handleAnswerExceed"
              drag
            >
              <div class="upload-content">
                <el-icon class="upload-icon"><upload-filled /></el-icon>
                <div class="upload-text">
                  <p class="upload-main">点击或拖拽文件到此处</p>
                  <p class="upload-hint">支持 TXT、DOC、DOCX 格式</p>
                </div>
              </div>
            </el-upload>
          </div>
        </div>
        
        <!-- 当前答案状态 -->
        <div v-if="referenceAnswer.name" class="current-status">
          <div class="status-card" :class="{ 'status-error': !referenceAnswer.matched }">
            <div class="status-content">
              <div class="status-info">
                <el-icon class="status-icon" :class="{ 'status-error-icon': !referenceAnswer.matched }">
                  <circle-check-filled v-if="referenceAnswer.matched" />
                  <circle-close-filled v-else />
                </el-icon>
                <span class="status-text">
                  当前答案：{{ referenceAnswer.name }}。
                  <span v-if="referenceAnswer.matched">匹配成功，共{{ referenceAnswer.answerCount }}道答案</span>
                  <span v-else>与试卷不匹配，请检查题目编号</span>
                </span>
              </div>
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  link 
                  @click="$emit('preview-answer')"
                  class="action-btn"
                >
                  <el-icon><view /></el-icon>
                  预览
                </el-button>
                <el-button 
                  type="warning" 
                  link 
                  @click="$emit('edit-answer')"
                  class="action-btn"
                >
                  <el-icon><edit /></el-icon>
                  编辑
                </el-button>
              </div>
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
  DocumentChecked,
  Edit,
  Folder,
  Upload,
  UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  referenceAnswer: {
    type: Object,
    required: true
  },
  existingAnswers: {
    type: Array,
    required: true
  },
  examPaper: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'answer-selected',
  'answer-uploaded',
  'answer-removed',
  'preview-answer',
  'edit-answer'
])

// Local state
const selectedExistingAnswer = ref('')
const answerFileList = ref([])

// Computed
const availableAnswers = computed(() => {
  // 这里可以根据当前试卷过滤相关答案
  return props.existingAnswers
})

// Methods
const handleExistingAnswerChange = (answerId) => {
  const answer = props.existingAnswers.find(a => a.id === answerId)
  if (answer) {
    emit('answer-selected', answer)
    // 清空文件列表
    answerFileList.value = []
  }
}

const handleAnswerUpload = (file, fileList) => {
  emit('answer-uploaded', file)
  // 清空选择的已有答案
  selectedExistingAnswer.value = ''
}

const handleAnswerRemove = (file, fileList) => {
  emit('answer-removed')
}

const beforeAnswerRemove = (file, fileList) => {
  return ElMessageBox.confirm(
    `确定要移除答案文件 ${file.name} 吗？`
  ).then(
    () => true,
    () => false
  )
}

const handleAnswerExceed = (files, fileList) => {
  ElMessage.warning('只能上传1个答案文件')
}
</script>

<style scoped>
.answer-upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8f4fd;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.answer-upload-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.answer-upload-card.disabled {
  opacity: 0.7;
  filter: grayscale(0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
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

.answer-content {
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.disabled-alert {
  border-radius: 12px;
}

.upload-options {
  display: flex;
  align-items: stretch;
  gap: 24px;
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
  color: #0891b2;
  font-size: 18px;
}

.option-item h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.answer-select {
  width: 100%;
  flex: 1;
}

.answer-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 2px solid #cffafe;
  transition: all 0.3s ease;
  min-height: 40px;
}

.answer-select :deep(.el-input__wrapper:hover) {
  border-color: #0891b2;
}

.answer-select :deep(.el-input__wrapper.is-focus) {
  border-color: #0891b2;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
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

.answer-upload {
  width: 100%;
  flex: 1;
}

.answer-upload :deep(.el-upload-dragger) {
  border: 2px dashed #a5f3fc;
  border-radius: 8px;
  background: #f0fdfa;
  transition: all 0.3s ease;
  padding: 16px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
}

.answer-upload :deep(.el-upload-dragger:hover) {
  border-color: #0891b2;
  background: #ecfdf5;
}

.upload-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-icon {
  font-size: 24px;
  color: #0891b2;
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
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #bbf7d0;
  box-shadow: 0 2px 12px rgba(34, 197, 94, 0.08);
}

.status-card.status-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.08);
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

.status-error-icon {
  color: #ef4444;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #166534;
}

.status-error .status-text {
  color: #991b1b;
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