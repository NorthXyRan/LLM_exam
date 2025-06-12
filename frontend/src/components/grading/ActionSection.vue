<template>
  <div class="action-section">
    <div class="action-group">
      <div class="action-item">
        <div class="action-buttons">
          <el-button
            type="primary"
            size="default"
            @click="handleStartGrading"
            :loading="isGrading"
            :disabled="isGrading"
          >
            <el-icon v-if="!isGrading"><VideoPlay /></el-icon>
            {{ isGrading ? 'Grading...' : 'Start Grading' }}
          </el-button>

          <!-- TODO: 后续可以在这里添加其他评分相关功能按钮 -->
          <!-- 建议的功能按钮：
               1. 重新评分按钮 - 重新运行AI评分
               2. 导出结果按钮 - 导出当前评分结果
               3. 查看统计按钮 - 显示评分统计信息
               4. 批量操作按钮 - 批量确认/修改评分
               5. 设置按钮 - AI评分参数配置
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import { ref } from 'vue'

// 添加 loading 状态
const isGrading = ref(false)

const emits = defineEmits<{
  (e: 'startGrading'): void
  // TODO: 后续可能需要的事件
  // (e: 'reGrading'): void              // 重新评分
  // (e: 'exportResults'): void          // 导出结果
  // (e: 'viewStatistics'): void         // 查看统计
  // (e: 'batchConfirm'): void           // 批量确认评分
  // (e: 'openSettings'): void           // 打开评分设置
}>()

const handleStartGrading = () => {
  isGrading.value = true
  emits('startGrading')
}

// 重置评分状态的方法
const resetGradingState = () => {
  isGrading.value = false
}

// 暴露方法给父组件调用
defineExpose({
  resetGradingState,
})
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
