<template>
    <div class="home-layout">
      <el-container class="container">
        <!-- 头部 -->
        <el-header class="header">
          <span>人与大模型可视交互协同的智能阅卷系统</span>
          <!-- 在头部添加折叠按钮 -->
          <el-button 
            type="primary" 
            size="small" 
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
                default-active="1"
                class="sidebar-menu"
                :collapse="isCollapse"
                background-color="#3870a8"
                text-color="#ffffff"
                active-text-color="#ffd04b"
                @open="handleOpen"
                @close="handleClose"
                @select="handleSelect"
            >
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
                  <el-menu-item index="3-3">历史记录</el-menu-item>
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
          
          <!-- 主内容 -->
          <el-main class="main">
            <div class="main-content">
              <h2>欢迎使用智能阅卷系统</h2>
              <p>请从左侧菜单选择功能开始使用</p>
              <div class="feature-cards">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-card class="feature-card" @click="handleSelect('1')">
                      <el-icon class="card-icon"><Upload /></el-icon>
                      <h3>文件上传</h3>
                      <p>上传考试文件进行智能评分</p>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card class="feature-card" @click="handleSelect('2')">
                      <el-icon class="card-icon"><Document /></el-icon>
                      <h3>智能评分</h3>
                      <p>AI 自动评分，快速准确</p>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card class="feature-card" @click="handleSelect('3-1')">
                      <el-icon class="card-icon"><DataAnalysis /></el-icon>
                      <h3>结果分析</h3>
                      <p>详细的评分报告和数据分析</p>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  Upload,
  DataAnalysis,
  Setting,
  QuestionFilled,
  Expand,
  Fold,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isCollapse = ref(false)

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
      router.push('/result')
      break
    case '3-2':
      ElMessage.info('查看详细分析')
      router.push('/result')
      break
    case '3-3':
      ElMessage.info('查看历史记录')
      router.push('/result')
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
.home-layout {
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

.main-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.main-content h2 {
  color: #409eff;
  margin-bottom: 15px;
}

.main-content p {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
}

.feature-cards {
  margin-top: 20px;
}

.feature-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: #409eff;
  margin-bottom: 10px;
  font-size: 18px;
}

.feature-card p {
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>