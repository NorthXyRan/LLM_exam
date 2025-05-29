<template>
  <div id="app">
    <!-- 这里显示当前路由对应的页面组件 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 什么都不需要写，保持简单
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
}
</style>
