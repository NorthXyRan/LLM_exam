<template>
  <el-card :class="[cardClass, { disabled: disabled }]">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <el-icon class="card-icon">
              <component :is="icon" />
            </el-icon>
          </div>
          <h3>{{ title }}</h3>
        </div>
        <el-tag v-if="isReady" type="success" effect="dark" class="status-tag">
          <el-icon><check /></el-icon>
          Ready
        </el-tag>
        <el-tag v-else-if="disabled" type="info" effect="plain" class="status-tag waiting-tag">
          <el-icon><clock /></el-icon>
          Waiting for Paper
        </el-tag>
        <el-tag v-else type="warning" effect="plain" class="status-tag waiting-tag">
          <el-icon><clock /></el-icon>
          Waiting for Upload
        </el-tag>
      </div>
    </template>

    <div class="upload-content">
      <el-alert
        v-if="disabled"
        title="Please upload the exam paper first"
        type="warning"
        :closable="false"
        show-icon
        class="disabled-alert"
      />

      <template v-else>
        <!-- 文件上传区域 -->
        <div class="upload-section">
          <div class="section-header">
            <el-icon class="section-icon"><upload /></el-icon>
            <h4>{{ uploadTitle }}</h4>
          </div>
          <el-upload
            v-model:file-list="fileList"
            :class="uploadClass"
            :auto-upload="false"
            :on-change="handleFileUpload"
            :on-remove="handleFileRemove"
            :before-remove="confirmFileRemove"
            :show-file-list="false"
            :accept="accept"
            :limit="1"
            :on-exceed="handleFileExceed"
            :disabled="isProcessing"
            drag
          >
            <div class="upload-content-inner">
              <el-icon v-if="!isProcessing" class="upload-icon"><upload-filled /></el-icon>
              <el-icon v-else class="upload-icon loading"><loading /></el-icon>
              <div class="upload-text">
                <p class="upload-main">
                  {{ isProcessing ? 'Processing...' : 'Click or drag the file here' }}
                </p>
                <p class="upload-hint">
                  {{ isProcessing ? processingHint : uploadHint }}
                </p>
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 当前状态显示 -->
        <div v-if="currentFileName" class="current-status">
          <div class="status-card" :class="{ 'error-card': hasError }">
            <div class="status-content">
              <div class="status-info">
                <el-icon class="status-icon" :class="{ 'error-icon': hasError }">
                  <circle-check-filled />
                </el-icon>
                <span class="status-text" :class="{ 'error-text': hasError }">
                  {{ hasError ? errorMessage : statusText }}
                </span>
              </div>
              <div class="action-buttons">
                <el-button type="primary" link @click="handlePreview" class="action-btn">
                  <el-icon><view /></el-icon>
                  预览
                </el-button>
                <el-button type="danger" link @click="handleRemove" class="action-btn">
                  <el-icon><delete /></el-icon>
                  移除
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
  Clock,
  Delete,
  Loading,
  Upload,
  UploadFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, watch } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  uploadTitle: { type: String, required: true },
  icon: { type: [String, Object], required: true },
  cardClass: { type: String, required: true },
  uploadClass: { type: String, required: true },
  accept: { type: String, required: true },
  uploadHint: { type: String, required: true },
  processingHint: { type: String, required: true },
  currentFileName: { type: String, default: '' },
  statusText: { type: String, default: '' },
  isReady: { type: Boolean, default: false },
  hasError: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  resetTrigger: { type: Number, default: 0 },
})

const emit = defineEmits(['file-uploaded', 'file-removed', 'preview', 'remove'])

const fileList = ref([])
const isProcessing = ref(false)

// 监听重置触发器
watch(
  () => props.resetTrigger,
  () => {
    if (props.resetTrigger > 0) {
      fileList.value = []
    }
  },
)

const handleFileUpload = (uploadFile) => {
  emit('file-uploaded', uploadFile, isProcessing)
}

const handleFileRemove = () => {
  emit('file-removed')
}

const confirmFileRemove = async (file) => {
  try {
    await ElMessageBox.confirm(`确定要移除文件 ${file.name} 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}

const handleFileExceed = () => {
  ElMessage.warning('只能上传1个文件')
}

const handlePreview = () => {
  emit('preview')
}

const handleRemove = async () => {
  try {
    await ElMessageBox.confirm('确定要移除文件吗？', '移除确认', {
      confirmButtonText: '移除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    fileList.value = []
    emit('remove')
    ElMessage.success('文件已移除')
  } catch {
    // 用户取消了操作
  }
}

defineExpose({
  isProcessing,
})
</script>

<style scoped>
/* 共享样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 16px;
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

.upload-content {
  display: flex;
  flex-direction: column;
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
  font-size: 18px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.upload-content-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.upload-icon {
  font-size: 36px;
  opacity: 0.8;
}

.upload-icon.loading {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
  transition: all 0.3s ease;
}

/* 错误状态卡片 - 简化为红色版本 */
.status-card.error-card {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
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
  flex: 1;
}

.status-icon {
  font-size: 20px;
  color: #0ea5e9;
}

.error-icon {
  color: #ef4444;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0;
}

.status-text.error-text {
  color: #dc2626;
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

.action-btn[type='primary']:hover {
  background: #3b82f6;
  color: white;
}

.disabled {
  opacity: 0.7;
  pointer-events: none;
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
