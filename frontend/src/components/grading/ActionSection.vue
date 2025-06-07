<template>
  <div class="action-section">
    <div class="action-group">
      <div class="action-item">
        <div class="action-buttons">
          <el-button type="primary" size="default" @click="handleStartGrading">
            <el-icon><VideoPlay /></el-icon>
            Start Grading
          </el-button>
          <el-button type="success" size="default" @click="handleBatchGrading">
            <el-icon><Document /></el-icon>
            Batch Grading
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, VideoPlay } from '@element-plus/icons-vue';

const emits = defineEmits<{
  (e: 'startGrading'): void
  (e: 'batchGrading'): void
}>()

const handleStartGrading = () => {
  emits('startGrading')
}

const handleBatchGrading = () => {
  emits('batchGrading')
}
</script>

<style scoped>
/* === 操作区域：适配父组件的卡片容器 === */
.action-section {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  
  background: rgba(255, 255, 255, 0.9) !important;
  
  border: none;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.action-group {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px; /* 内部留点边距 */
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

/* === 按钮样式适配 === */
.action-section :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-section :deep(.el-button--primary) {
  background: #007AFF;
  border-color: #007AFF;
  color: #FFFFFF;
}

.action-section :deep(.el-button--primary:hover:not(.is-disabled)) {
  background: #0056B3;
  border-color: #0056B3;
  transform: translateY(-1px);
}

.action-section :deep(.el-button--success) {
  background: #4CD964;
  border-color: #4CD964;
  color: #FFFFFF;
}

.action-section :deep(.el-button--success:hover:not(.is-disabled)) {
  background: #3AC85A;
  border-color: #3AC85A;
  transform: translateY(-1px);
}

.action-section :deep(.el-button:disabled) {
  opacity: 0.4;
  transform: none !important;
}

/* === 图标样式 === */
.action-section :deep(.el-button .el-icon) {
  margin-right: 6px;
  font-size: 14px;
}

/* === 响应式设计 === */
@media (max-width: 768px) {
  .action-group {
    padding: 8px 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .action-section :deep(.el-button) {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .action-group {
    padding: 6px 8px;
  }
  
  .action-buttons {
    gap: 6px;
  }
  
  .action-section :deep(.el-button) {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .action-section :deep(.el-button .el-icon) {
    margin-right: 4px;
    font-size: 12px;
  }
}
</style>