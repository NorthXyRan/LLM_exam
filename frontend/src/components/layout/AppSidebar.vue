<template>
  <div class="sidebar" :class="{ collapsed: isCollapse }">
    <div class="sidebar-card hover">
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
              :class="{ active: isMenuActiveItem(item) }"
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
              <div class="menu-item" :class="{ active: isMenuActiveItem(item) }">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuItems, createRouteToIndexMap, isMenuActive, type MenuItem } from './menuConfig'

// Props
interface Props {
  isCollapse: boolean
}

defineProps<Props>()

// 路由相关
const router = useRouter()
const route = useRoute()

// 路由映射
const routeToIndexMap = createRouteToIndexMap()

// 根据当前路由计算激活的菜单项
const activeMenu = computed(() => {
  return routeToIndexMap[route.path] || '0'
})

// 判断菜单项是否激活
const isMenuActiveItem = (item: MenuItem): boolean => {
  return isMenuActive(item, activeMenu.value)
}

// 统一的路由导航处理
const navigateToRoute = (routePath: string) => {
  router.push(routePath)
}
</script>

<style scoped>
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

/* 所有菜单项基础样式 */
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

/* 子菜单容器 - 移除独立背景 */
.nav-menu :deep(.el-sub-menu .el-menu) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 子菜单项差异化样式 */
.nav-menu :deep(.el-sub-menu .el-menu-item) {
  color: #666;
  padding-left: 50px !important;
  font-size: 14px;
}

/* hover和激活的共同颜色 */
.nav-menu :deep(.el-menu-item:hover),
.nav-menu :deep(.el-sub-menu__title:hover),
.nav-menu :deep(.el-sub-menu .el-menu-item:hover),
.nav-menu :deep(.el-menu-item.is-active),
.nav-menu :deep(.el-sub-menu .el-menu-item.is-active),
.nav-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background: rgba(56, 112, 168, 0.1) !important;
  color: #3870a8 !important;
}

/* 激活状态的额外样式 */
.nav-menu :deep(.el-menu-item.is-active),
.nav-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background: #ffd04b !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 208, 75, 0.3);
}

/* 图标样式 */
.nav-menu :deep(.el-menu-item i),
.nav-menu :deep(.el-sub-menu__title i) {
  margin-right: 12px;
  font-size: 18px;
}

/* 禁用动画 */
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
</style>

<style>
/* 全局样式 - Popover 确保在折叠状态下也能正常显示毛玻璃效果 */
.submenu-popover {
  padding: 0 !important;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.submenu-popover .el-popper__arrow {
  display: none;
}
</style>