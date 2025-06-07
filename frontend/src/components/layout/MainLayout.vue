<template>
  <div class="main-layout">
    <el-container class="container">
      <!-- 头部 -->
      <el-header class="header">
        <span>🎓 AI Grading</span>
        <!-- 在头部添加折叠按钮 -->
        <el-button
          class="collapse-button"
          size="large"
          @click="toggleCollapse"
          style="margin-left: auto;"
        >
          <el-icon>
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
        </el-button>
      </el-header>
      
      <el-container class="body-container">
        <!-- 动态宽度的侧边栏 -->
        <el-aside class="aside" :width="isCollapse ? '64px' : '200px'">
          <!-- 导航菜单 -->
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            :collapse="isCollapse"
            background-color="transparent"
            text-color="#000000"
            @open="handleOpen"
            @close="handleClose"
            @select="handleSelect"
          >
            <!-- 主界面 -->
            <el-menu-item index="0">
              <el-icon><House /></el-icon>
              <template #title>Home</template>
            </el-menu-item>
            
            <!-- 文件上传 -->
            <el-menu-item index="1">
              <el-icon><Upload /></el-icon>
              <template #title>File Upload</template>
            </el-menu-item>
            
            <!-- 智能评分 -->
            <el-menu-item index="2">
              <el-icon><Document /></el-icon>
              <template #title>Intelligent Grading</template>
            </el-menu-item>
            
            <!-- 结果查看 -->
            <el-sub-menu index="3">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>Result View</span>
              </template>
              <el-menu-item index="3-1">Score Report</el-menu-item>
              <el-menu-item index="3-2">Detailed Analysis</el-menu-item>
            </el-sub-menu>
            
            <!-- 系统设置 -->
            <el-menu-item index="4">
              <el-icon><Setting /></el-icon>
              <template #title>Prompt Setting</template>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <!-- 主内容区域 -->
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {
  DataAnalysis,
  Document,
  Expand,
  Fold,
  House,
  Setting,
  Upload
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

// 根据当前路由计算激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  switch (path) {
    case '/':
      return '0'
    case '/uploading':
      return '1'
    case '/grading':
      return '2'
    case '/result/report':
      return '3-1'
    case '/result/analysis':
      return '3-2'
    case '/prompt-setting':
      return '4'
    default:
      return '0'
  }
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleOpen = (key: string, keyPath: string[]) => {
  console.log('打开菜单:', key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log('关闭菜单:', key, keyPath)
}

const handleSelect = (index: string) => {
  console.log('选择菜单:', index)
  
  // 根据选择的菜单项跳转到对应页面
  switch(index) {
    case '0':
      ElMessage.info('跳转到主界面')
      router.push('/')
      break
    case '1':
      ElMessage.info('跳转到文件上传页面')
      router.push('/uploading')
      break
    case '2':
      ElMessage.info('跳转到智能评分页面')
      router.push('/grading')
      break
    case '3-1':
      ElMessage.info('查看评分报告')
      router.push('/result/report')
      break
    case '3-2':
      ElMessage.info('查看详细分析')
      router.push('/result/analysis')
      break
    case '4':
      ElMessage.info('跳转到Prompt设置页面')
      router.push('/prompt-setting')
      break
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.container {
  height: 100%;
}

.body-container {
  height: calc(100vh - 70px);
}

.header {
  background: transparent;
  backdrop-filter: blur(10px);
  color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 25px;
  font-weight: bold;
  height: 70px;
}

.collapse-button {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  color: white;
  transition: all 0.3s ease;
}

.aside {
  background: transparent;
  backdrop-filter: blur(10px);
  color: rgb(0, 0, 0);
  height: 100%;
  overflow: hidden;
  transition: width 0.3s ease;
}

.sidebar-menu {
  border: none;
  background-color: transparent;
  height: 100%;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #000000 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}


.sidebar-menu .el-menu-item.is-active {
  background-color: #ffd04b !important;
  color: #3870a8 !important;
  font-weight: bold;
}

.main {
  background-color: transparent;
  height: 100%;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

</style>

<!-- 全局样式 - 修复折叠状态下的子菜单样式 -->
<style>
.el-menu--popup-container {
  background: linear-gradient(135deg, #F6736B, #934F91) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}
</style>