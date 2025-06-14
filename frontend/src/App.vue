<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useExamDataStore } from './stores/useExamDataStore'
import { useUploadStatusStore } from './stores/useUploadStatusStore'

const examDataStore = useExamDataStore()
const uploadStatusStore = useUploadStatusStore()

onMounted(() => {
  try {
    // 恢复本地数据
    examDataStore.loadFromLocal()
    uploadStatusStore.loadFromLocal()

  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
