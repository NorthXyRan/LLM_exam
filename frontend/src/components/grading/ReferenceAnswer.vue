<template>
    <div class="reference-answer">
      <div class="reference-content">
        {{ referenceAnswer }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  interface Props {
    referenceAnswer?: string
  }
  
  const props = withDefaults(defineProps<Props>(), {
    referenceAnswer: ''
  })
  </script>
  
  <style scoped>
  /* === 参考答案组件样式 === */
  .reference-answer {
    flex: 1;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  /* 内容容器，提供实际的内边距 */
  .reference-content {
    padding: 20px;
    flex: 1;
    min-height: 0;
    white-space: pre-wrap;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.87);
    font-size: 14px;
    word-break: break-word;
  }
  
  /* === 响应式调整 === */
  @media (max-width: 768px) {
    .reference-content {
      padding: 15px;
      font-size: 13px;
    }
  }
  
  @media (max-width: 480px) {
    .reference-content {
      padding: 12px;
      font-size: 12px;
    }
  }
  </style>