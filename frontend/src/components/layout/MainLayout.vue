<template>
  <div class="main-layout">
    <div class="container">
      <!-- 头部 -->
      <div class="header">
        <span>🎓 AI Grading</span>
        <el-button
          class="collapse-button"
          size="default"
          @click="toggleCollapse"
          :icon="isCollapse ? Expand : Fold"
        />
      </div>
      
      <div class="body-container">
        <div class="sidebar" :class="{ collapsed: isCollapse }">
          <div class="sidebar-card">
            <!-- 展开状态的菜单 -->
            <el-menu
              v-if="!isCollapse"
              :default-active="activeMenu"
              class="nav-menu"
              :router="true"
            >
              <template v-for="item in menuItems" :key="item.index">
                <!-- 普通菜单项 -->
                <el-menu-item
                  v-if="!item.children"
                  :index="item.index"
                  :route="item.route"
                >
                  <el-icon><component :is="item.icon" /></el-icon>
                  <span>{{ item.title }}</span>
                </el-menu-item>
                
                <!-- 带子菜单的项目 -->
                <el-sub-menu v-else :index="item.index">
                  <template #title>
                    <el-icon><component :is="item.icon" /></el-icon>
                    <span>{{ item.title }}</span>
                  </template>
                  <el-menu-item
                    v-for="child in item.children"
                    :key="child.index"
                    :index="child.index"
                    :route="child.route"
                  >
                    {{ child.title }}
                  </el-menu-item>
                </el-sub-menu>
              </template>
            </el-menu>
            
            <!-- 折叠状态的自定义菜单 -->
            <div v-else class="nav-menu collapsed-menu">
              <template v-for="item in menuItems" :key="item.index">
                <!-- 普通菜单项 -->
                <el-tooltip v-if="!item.children" :content="item.title" placement="right">
                  <div
                    class="menu-item"
                    :class="{ active: isMenuActive(item) }"
                    @click="navigateToRoute(item.route!)"
                  >
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                </el-tooltip>
                
                <!-- 带子菜单的项目 -->
                <el-popover
                  v-else
                  placement="right-start"
                  :width="180"
                  trigger="hover"
                  :offset="10"
                  popper-class="submenu-popover"
                >
                  <template #reference>
                    <div class="menu-item" :class="{ active: isMenuActive(item) }">
                      <el-icon><component :is="item.icon" /></el-icon>
                    </div>
                  </template>
                  <div class="popover-menu">
                    <div
                      v-for="child in item.children"
                      :key="child.index"
                      class="popover-menu-item"
                      :class="{ active: activeMenu === child.index }"
                      @click="navigateToRoute(child.route)"
                    >
                      {{ child.title }}
                    </div>
                  </div>
                </el-popover>
              </template>
            </div>
          </div>
        </div>
        
        <!-- 主内容区域 -->
        <div class="main-content">
          <router-view></router-view>
        </div>
      </div>
    </div>
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
  Upload,
} from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 类型定义
interface MenuChild {
  index: string
  title: string
  route: string
}

interface MenuItem {
  index: string
  title: string
  icon: any
  route?: string
  children?: MenuChild[]
}

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

// 统一的菜单配置
const menuItems: MenuItem[] = [
  { index: '0', title: 'Home', icon: House, route: '/' },
  { index: '1', title: 'File Upload', icon: Upload, route: '/uploading' },
  { index: '2', title: 'Intelligent Grading', icon: Document, route: '/grading' },
  {
    index: '3',
    title: 'Result View',
    icon: DataAnalysis,
    children: [
      { index: '3-1', title: 'Score Report', route: '/result/report' },
      { index: '3-2', title: 'Detailed Analysis', route: '/result/analysis' },
    ],
  },
  { index: '4', title: 'Prompt Setting', icon: Setting, route: '/prompt-setting' },
]

// 创建路由到菜单索引的映射
const createRouteToIndexMap = () => {
  const map: Record<string, string> = {}
  
  menuItems.forEach(item => {
    if (item.route) {
      map[item.route] = item.index
    }
    if (item.children) {
      item.children.forEach(child => {
        map[child.route] = child.index
      })
    }
  })
  
  return map
}

const routeToIndexMap = createRouteToIndexMap()

// 根据当前路由计算激活的菜单项
const activeMenu = computed(() => {
  return routeToIndexMap[route.path] || '0'
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 判断菜单项是否激活
const isMenuActive = (item: MenuItem): boolean => {
  if (item.children) {
    return activeMenu.value.startsWith(item.index)
  }
  return activeMenu.value === item.index
}

// 统一的路由导航处理
const navigateToRoute = (routePath: string) => {
  router.push(routePath)
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

.header {
  height: 70px;
  background: transparent;
  backdrop-filter: blur(10px);
  color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 25px;
  font-weight: bold;
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

.body-container {
  flex: 1;
  display: flex;
  height: calc(100vh - 70px);
}

.sidebar {
  width: 280px;
  padding: 20px 15px;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 100px;
}

.sidebar-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  overflow: hidden;
  padding: 20px 0;
}

.nav-menu {
  border: none;
  background: transparent;
  padding: 0 20px;
}

/* 统一菜单项基础样式 */
.nav-menu :deep(.el-menu-item),
.nav-menu :deep(.el-sub-menu__title),
.nav-menu :deep(.el-sub-menu .el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 6px 0;
  border-radius: 10px;
  transition: background-color 0.2s ease, color 0.2s ease;
  color: #333;
}

/* 移除子菜单的独立背景框，让它融入侧边栏 */
.nav-menu :deep(.el-sub-menu .el-menu) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 子菜单项特殊样式 - 增加缩进体现层级 */
.nav-menu :deep(.el-sub-menu .el-menu-item) {
  color: #666;
  padding-left: 50px !important;
  font-size: 14px;
}

/* 统一hover效果 */
.nav-menu :deep(.el-menu-item:hover),
.nav-menu :deep(.el-sub-menu__title:hover),
.nav-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background: rgba(56, 112, 168, 0.1) !important;
  color: #3870a8 !important;
}

/* 统一激活状态 */
.nav-menu :deep(.el-menu-item.is-active),
.nav-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background: #ffd04b !important;
  color: #3870a8 !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
}

.nav-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #3870a8 !important;
}

/* 统一图标样式 */
.nav-menu :deep(.el-menu-item i),
.nav-menu :deep(.el-sub-menu__title i) {
  margin-right: 12px;
  font-size: 18px;
}

/* 禁用子菜单展开动画避免跳动 */
.nav-menu :deep(.el-sub-menu),
.nav-menu :deep(.el-sub-menu .el-menu) {
  transition: none !important;
}

/* 折叠状态的菜单样式 */
.collapsed-menu {
  padding: 0 10px;
}

.collapsed-menu .menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin: 8px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
}

.collapsed-menu .menu-item:hover {
  background: rgba(56, 112, 168, 0.1);
  color: #3870a8;
  transform: scale(1.05);
}

.collapsed-menu .menu-item.active {
  background: #ffd04b !important;
  color: #3870a8 !important;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
}

.collapsed-menu .menu-item .el-icon {
  font-size: 20px;
}

/* Popover 菜单样式 */
.popover-menu {
  padding: 8px 0;
}

.popover-menu-item {
  padding: 10px 16px;
  margin: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 14px;
}

.popover-menu-item:hover {
  background: rgba(56, 112, 168, 0.1);
  color: #3870a8;
}

.popover-menu-item.active {
  background: #ffd04b !important;
  color: #3870a8 !important;
  font-weight: bold;
}

.main-content {
  flex: 1;
  background: transparent;
  padding: 20px;
  overflow-y: auto;
}
</style>

<style>
/* 全局样式 - Popover 确保在折叠状态下也能正常显示毛玻璃效果 */
.submenu-popover {
  padding: 0 !important;
  background: rgba(255, 255, 255, 0.8) !important; /* 与 sidebar-card 相同的背景色 */
  backdrop-filter: blur(10px) !important; /* 与 sidebar-card 相同的毛玻璃效果 */
  border-radius: 16px !important; /* 与 sidebar-card 相同的圆角 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important; /* 与 sidebar-card 相同的阴影 */
  border: 1px solid rgba(255, 255, 255, 0.2) !important; /* 与 sidebar-card 相同的边框 */
}

.submenu-popover .el-popper__arrow {
  display: none;
}
</style>