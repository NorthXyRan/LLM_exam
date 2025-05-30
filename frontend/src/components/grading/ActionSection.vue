<template>
  <div class="action-section">
    <div class="action-group">
      <div class="score-item">
        <span class="score-label">操作模式</span>
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
  /* 移除所有装饰性样式，只保留布局 */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.score-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
</style> 