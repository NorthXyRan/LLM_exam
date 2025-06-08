import { DataAnalysis, Document, House, Setting, Upload } from '@element-plus/icons-vue'

// 类型定义
export interface MenuChild {
  index: string
  title: string
  route: string
}

export interface MenuItem {
  index: string
  title: string
  icon: any
  route?: string
  children?: MenuChild[]
}

// 菜单配置数据
export const menuItems: MenuItem[] = [
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
export const createRouteToIndexMap = () => {
  const map: Record<string, string> = {}

  menuItems.forEach((item) => {
    if (item.route) {
      map[item.route] = item.index
    }
    if (item.children) {
      item.children.forEach((child) => {
        map[child.route] = child.index
      })
    }
  })

  return map
}

// 判断菜单项是否激活
export const isMenuActive = (item: MenuItem, activeMenu: string): boolean => {
  if (item.children) {
    return activeMenu.startsWith(item.index)
  }
  return activeMenu === item.index
}
