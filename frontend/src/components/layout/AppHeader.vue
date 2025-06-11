<template>
  <div class="header-container">
    <div class="header-card">
      <span>Human-AI Collaborative Intelligent Grading with Visual Interaction</span>
      <div class="header-controls">
        <!-- 主题选择器 -->
        <div class="theme-dropdown" ref="dropdownRef">
          <button 
            class="control-button" 
            @click="toggleDropdown"
            :class="{ 'dropdown-open': isDropdownOpen }"
          >
            <Brush class="icon" />
            Theme
          </button>
          
          <!-- 下拉菜单 -->
          <div v-show="isDropdownOpen" class="dropdown-menu">
            <button
              v-for="theme in themeOptions"
              :key="theme"
              class="dropdown-item"
              :class="{ active: selectedTheme === theme }"
              @click="changeTheme(theme)"
            >
              {{ theme }}
              <span v-if="selectedTheme === theme" class="check-mark">✓</span>
            </button>
          </div>
        </div>
        
        <!-- 折叠按钮 -->
        <button class="control-button" @click="$emit('toggleCollapse')">
          <component :is="isCollapse ? Expand : Fold" class="icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Brush, Expand, Fold } from '@element-plus/icons-vue'

// 接收参数
interface Props {
  isCollapse: boolean
}
defineProps<Props>()

// 事件发送
defineEmits<{
  toggleCollapse: []
}>()

// 配置数据
const themeOptions = ['default', 'nature', 'vibrant']
const themeBackgrounds: Record<string, string> = {
  default: '/src/assets/background_image/BlueLandscapeLight.png',
  nature: '/src/assets/background_image/MojaveDesert.png', 
  vibrant: '/src/assets/background_image/BigSur.png'
}

// 响应式状态
const selectedTheme = ref<string>('default')
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

// 应用背景
const applyBackground = (background: string) => {
  Object.assign(document.documentElement.style, {
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  })
}

// 切换主题
const changeTheme = (theme: string) => {
  selectedTheme.value = theme
  applyBackground(themeBackgrounds[theme])
  localStorage.setItem('exam-theme', theme)
  isDropdownOpen.value = false
}

// 切换下拉菜单
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  const savedTheme = localStorage.getItem('exam-theme')
  const theme = (savedTheme && savedTheme in themeBackgrounds) ? savedTheme : 'default'
  changeTheme(theme)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>

/* 头部容器 */
.header-container {
  height: 70px;
  padding: 10px 20px;
}

/* 头部卡片 */
.header-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  font-size: 25px;
  font-weight: bold;
  color: #333;
  transition: all 0.3s ease;
}

.header-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

/* 头部控制区域 */
.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 通用图标样式 */
.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 通用控制按钮样式 */
.control-button {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #333;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* 主题下拉组件 */
.theme-dropdown {
  position: relative;
}

.theme-dropdown .control-button {
  padding: 8px 16px;
}

.control-button.dropdown-open {
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid transparent;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-top: none;
  border-radius: 0 0 12px 12px;
  z-index: 1000;
  margin-top: -1px;
}

/* 下拉菜单项 */
.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  text-transform: capitalize;
  font-size: 14px;
}

.dropdown-item:first-child {
  padding-top: 16px;
}

.dropdown-item:last-child {
  padding-bottom: 16px;
  border-radius: 0 0 12px 12px;
}

.dropdown-item:hover {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
}

.dropdown-item.active {
  background: rgba(74, 144, 226, 0.15);
  color: #4a90e2;
  font-weight: 600;
}

/* 选中标记 */
.check-mark {
  color: #4a90e2;
  font-weight: bold;
}
</style>