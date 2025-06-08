<template>
  <div class="main-layout">
    <div class="container">
      <!-- 头部组件 -->
      <AppHeader 
        :is-collapse="isCollapse" 
        @toggle-collapse="toggleCollapse" 
      />
      
      <div class="body-container">
        <!-- 侧边栏组件 -->
        <AppSidebar :is-collapse="isCollapse" />
        
        <!-- 主内容区域 -->
        <div class="main-content">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

// 折叠状态管理
const isCollapse = ref(false)

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.body-container {
  flex: 1;
  display: flex;
  height: calc(100vh - 70px);
}

.main-content {
  flex: 1;
  background: transparent;
  padding: 20px;
  overflow-y: auto;
}

/* 全局hover效果 - 适用于所有带有hover类的元素 */
:deep(.hover) {
  transition: all 0.3s ease;
}

:deep(.hover:hover) {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px) scale(1.005);
}
</style>