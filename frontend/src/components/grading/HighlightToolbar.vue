<template>
  <div class="highlight-toolbar">
    <div class="tool-section">
      <div class="tool-group">
        <el-button 
          :type="highlightMode ? 'primary' : 'default'"
          :class="{ 'active': highlightMode }"
          @click="toggleHighlightMode"
          size="medium"
        >
          <el-icon><Edit /></el-icon>
          高亮笔
        </el-button>
      </div>
      
      <el-divider direction="vertical" />
      
      <div class="tool-group">
        <el-button 
          type="success" 
          size="medium"
          @click="() => handleMarkAnswer('correct')"
          :disabled="!hasSelectedText"
        >
          <el-icon><Check /></el-icon>
          正确
        </el-button>
        <el-button 
          type="danger" 
          size="medium"
          @click="() => handleMarkAnswer('wrong')"
          :disabled="!hasSelectedText"
        >
          <el-icon><Close /></el-icon>
          错误
        </el-button>
        <el-button 
          type="warning" 
          size="medium"
          @click="() => handleMarkAnswer('unclear')"
          :disabled="!hasSelectedText"
        >
          <el-icon><QuestionFilled /></el-icon>
          模糊
        </el-button>
        <el-button 
          type="info" 
          size="medium"
          @click="() => handleMarkAnswer('redundant')"
          :disabled="!hasSelectedText"
        >
          <el-icon><RemoveFilled /></el-icon>
          冗余
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Close, Edit, QuestionFilled, RemoveFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

interface Props {
  hasSelectedText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasSelectedText: false
})

const emits = defineEmits<{
  (e: 'highlightModeChange', mode: boolean): void
  (e: 'markAnswer', type: 'correct' | 'wrong' | 'unclear' | 'redundant'): void
}>()

// 高亮模式状态
const highlightMode = ref(false)

// 切换高亮模式
const toggleHighlightMode = () => {
  highlightMode.value = !highlightMode.value
  emits('highlightModeChange', highlightMode.value)
  
  if (highlightMode.value) {
    ElMessage.info('高亮模式已开启，选中文本进行标记')
  } else {
    ElMessage.info('高亮模式已关闭')
  }
}

// 标记答案
const handleMarkAnswer = (type: 'correct' | 'wrong' | 'unclear' | 'redundant') => {
  emits('markAnswer', type)
}
</script>

<style scoped>
/* === 高亮工具栏内部样式 === */
.highlight-toolbar {
  /* 移除装饰性样式，让父容器控制外观 */
  padding: 10px 15px;
  width: 100%;
  box-sizing: border-box;
}

.tool-section {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
  width: 100%;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* === 按钮状态样式 === */
.active {
  background-color: #409eff !important;
  color: white !important;
}

.el-button:disabled {
  opacity: 0.5;
}

/* === 响应式调整 === */
@media (max-width: 768px) {
  .tool-section {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .tool-group {
    gap: 4px;
  }
}
</style> 