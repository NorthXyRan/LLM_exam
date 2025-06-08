<template>
  <div class="header-container">
    <div class="header-card hover">
      <span>Human-AI Collaborative Intelligent Grading with Visual Interaction</span>
      <el-button
        class="collapse-button"
        size="default"
        @click="handleToggleCollapse"
        :icon="isCollapse ? Expand : Fold"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'

// Props
interface Props {
  isCollapse: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggleCollapse: []
}>()

// 处理折叠切换
const handleToggleCollapse = () => {
  emit('toggleCollapse')
}
</script>

<style scoped>
.header-container {
  height: 70px;
  padding: 10px 20px;
}

.header-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  font-size: 25px;
  font-weight: bold;
  color: rgb(0, 0, 0);
}

.collapse-button {
  background: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  color: #333 !important;
}

.collapse-button:hover {
  background: rgba(255, 255, 255, 0.5) !important;
  transform: scale(1.05);
}
</style>
