<template>
  <div class="scoring-section">
    <div class="score-group">
      <div class="score-item">
        <span class="score-label">LLM批改分数</span>
        <div class="score-display">
          <span class="score-value">{{ llmScore }}</span>
          <span class="score-unit">分</span>
        </div>
      </div>
      
      <el-divider direction="vertical" />
      
      <div class="score-item">
        <span class="score-label">最终评分</span>
        <div class="score-input-group">
          <el-input
            v-model="teacherScore"
            type="number"
            size="medium"
            class="score-input"
            @input="handleTeacherScoreInput"
          />
          <span class="score-unit">分</span>
        </div>
      </div>
      
      <el-divider direction="vertical" />
      
      <div class="score-item">
        <span class="score-label">操作</span>
        <div class="score-actions-inline">
          <el-button 
            type="primary" 
            size="medium"
            @click="saveScore"
            :disabled="!teacherScore"
          >
            保存并提交
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

interface Props {
  llmScore?: number
  maxScore?: number
}

const props = withDefaults(defineProps<Props>(), {
  llmScore: 0,
  maxScore: 100
})

const emits = defineEmits<{
  (e: 'scoreChange', data: { teacherScore: number, llmScore: number }): void
}>()

// 评分相关数据
const teacherScore = ref<number | string>()

// 处理教师评分变化
const handleTeacherScoreInput = (value: string) => {
  const numericValue = parseFloat(value)
  if (!isNaN(numericValue)) {
    teacherScore.value = numericValue
    emits('scoreChange', {
      teacherScore: numericValue,
      llmScore: props.llmScore || 0
    })
  } else {
    teacherScore.value = value
  }
}

// 保存评分
const saveScore = () => {
  const score = typeof teacherScore.value === 'string' ? parseFloat(teacherScore.value) : teacherScore.value
  if (score !== undefined && !isNaN(score)) {
    ElMessage.success(`评分已保存并提交: ${score}分`)
    emits('scoreChange', {
      teacherScore: score,
      llmScore: props.llmScore || 0
    })
  }
}
</script>

<style scoped>
/* === 评分区域内部布局样式 === */
.scoring-section {
  /* 移除所有装饰性样式，只保留布局 */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-group {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 0;
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

.score-display {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.score-unit {
  font-size: 12px;
  color: #999;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-input {
  width: 100px;
}

.score-input :deep(.el-input__inner) {
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}

.score-actions-inline {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}
</style> 