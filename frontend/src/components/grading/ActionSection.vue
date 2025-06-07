<template>
  <div class="action-section">
    <div class="action-group">
      <div class="action-item">
        <div class="action-buttons">
          <el-button type="primary" size="default" @click="handleStartGrading">
            <el-icon><VideoPlay /></el-icon>
            Start Grading
          </el-button>

          <!-- 批改按钮改为下拉菜单 -->
          <el-dropdown @command="handleBatchGrading" trigger="click">
            <el-button type="success" size="default">
              <el-icon><Document /></el-icon>
              Batch Grading
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="5">5</el-dropdown-item>
                <el-dropdown-item command="10">10</el-dropdown-item>
                <el-dropdown-item command="20">20</el-dropdown-item>
                <el-dropdown-item command="all" divided>All</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, VideoPlay } from '@element-plus/icons-vue'

const emits = defineEmits<{
  (e: 'startGrading'): void
  (e: 'batchGrading', count: string | number): void
}>()

const handleStartGrading = () => {
  emits('startGrading')
}

const handleBatchGrading = (command: string) => {
  const count = command === 'all' ? 'all' : parseInt(command)
  emits('batchGrading', count)
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
  gap: 6px; /* 按钮之间的间距 */
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px; /* 确保容器有足够高度 */
}

/* === 按钮样式适配 === */
.action-section :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px; /* 设置最小宽度，保证按钮一致性 */
  height: 40px; /* 固定高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-section :deep(.el-button--primary) {
  background: #007aff;
  border-color: #007aff;
  color: #ffffff;
}

.action-section :deep(.el-button--primary:hover:not(.is-disabled)) {
  background: #0056b3;
  border-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.action-section :deep(.el-button--success) {
  background: #4cd964;
  border-color: #4cd964;
  color: #ffffff;
}

.action-section :deep(.el-button--success:hover:not(.is-disabled)) {
  background: #3ac85a;
  border-color: #3ac85a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
}

.action-section :deep(.el-button:disabled) {
  opacity: 0.4;
  transform: none !important;
  box-shadow: none !important;
}

/* === 图标样式 === */
.action-section :deep(.el-button .el-icon) {
  margin-right: 6px;
  font-size: 14px;
}

/* === 下拉菜单样式 === */
.action-section :deep(.el-dropdown) {
  display: inline-block;
}

.action-section :deep(.el-dropdown-menu) {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-section :deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;
  text-align: center;
}

.action-section :deep(.el-dropdown-menu__item:hover) {
  background-color: #f3f4f6;
  color: #4cd964;
}

/* === 响应式设计：中等屏幕 === */
@media (max-width: 768px) {
  .action-group {
    padding: 12px 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
    width: 100%;
    align-items: stretch; /* 让按钮在垂直布局时拉伸到相同宽度 */
  }

  .action-section :deep(.el-button) {
    width: 100%;
    min-width: unset;
    max-width: 260px; /* 限制最大宽度 */
    justify-content: center;
    margin: 0 auto; /* 居中对齐 */
  }

  .action-section :deep(.el-dropdown) {
    width: 100%;
    max-width: 260px;
    margin: 0 auto;
  }
}
</style>
