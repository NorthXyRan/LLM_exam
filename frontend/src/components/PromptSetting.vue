<template>
  <div class="prompt-setting-page">
    <div class="page-header">
      <h1>Prompt 设置</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 评分标准设置
const activePromptTab = ref('basic')
</script>

<style scoped>
</style>