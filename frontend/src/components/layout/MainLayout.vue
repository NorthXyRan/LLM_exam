<template>
  <div class="main-layout">
    <el-container class="container">
      <!-- 头部 -->
      <el-header class="header">
        <span>人与大模型可视交互协同的智能阅卷系统</span>
        <!-- 在头部添加折叠按钮 -->
        <el-button 
          type="primary" 
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
            background-color="#3870a8"
            text-color="#ffffff"
            active-text-color="#ffd04b"
            @open="handleOpen"
            @close="handleClose"
            @select="handleSelect"
          >
            <!-- 主界面 -->
            <el-menu-item index="0">
              <el-icon><House /></el-icon>
              <template #title>主界面</template>
            </el-menu-item>
            
            <!-- 文件上传 -->
            <el-menu-item index="1">
              <el-icon><Upload /></el-icon>
              <template #title>文件上传</template>
            </el-menu-item>
            
            <!-- 智能评分 -->
            <el-menu-item index="2">
              <el-icon><Document /></el-icon>
              <template #title>智能评分</template>
            </el-menu-item>
            
            <!-- 结果查看 -->
            <el-sub-menu index="3">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>结果查看</span>
              </template>
              <el-menu-item index="3-1">评分报告</el-menu-item>
              <el-menu-item index="3-2">详细分析</el-menu-item>
            </el-sub-menu>
            
            <!-- 系统设置 -->
            <el-menu-item index="4">
              <el-icon><Setting /></el-icon>
              <template #title>prompt设置</template>
            </el-menu-item>
            
            <!-- 帮助中心 -->
            <el-menu-item index="5">
              <el-icon><QuestionFilled /></el-icon>
              <template #title>帮助中心</template>
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
  QuestionFilled,
  Setting,
  Upload,
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
    case '/help':
      return '5'
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
    case '5':
      ElMessage.info('跳转到帮助中心')
      router.push('/help')
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
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 18px;
  font-weight: bold;
  height: 70px;
}

.aside {
  background-color: #3870a8;
  color: white;
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
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ffd04b;
  color: #3870a8;
  font-weight: bold;
}

.main {
  background-color: #f5f5f5;
  height: 100%;
  padding: 20px;
  transition: margin-left 0.3s ease;
}
</style> 