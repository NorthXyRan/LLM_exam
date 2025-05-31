<template>
  <div class="action-section">
    <div class="action-group">
      <div class="score-item">
        <div class="action-buttons">
          <el-button type="primary" size="medium" @click="handleStartGrading">
            <el-icon><VideoPlay /></el-icon>
            开始评分
          </el-button>
          <el-button type="success" size="medium" @click="handleBatchGrading">
            <el-icon><Document /></el-icon>
            全部评分
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
/* === 操作区域内部布局样式 === */
.action-section {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.action-group {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.score-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

/* === 按钮样式重写 === */
.action-section :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.action-section :deep(.el-button--primary) {
  background: #007AFF;
  border-color: #007AFF;
}

.action-section :deep(.el-button--primary:hover) {
  background: #0056B3;
  border-color: #0056B3;
  transform: translateY(-1px);
}

.action-section :deep(.el-button--success) {
  background: #4CD964;
  border-color: #4CD964;
}

.action-section :deep(.el-button--success:hover) {
  background: #3AC85A;
  border-color: #3AC85A;
  transform: translateY(-1px);
}

/* === 响应式设计 === */
@media (max-width: 768px) {
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
</style> 