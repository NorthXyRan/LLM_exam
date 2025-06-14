import AnalysisPage from '../components/result/AnalysisPage.vue'
import ReportPage from '../components/result/ReportPage.vue'
import Grading from '../components/grading/Grading.vue'
import Home from '../components/Home.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import PromptSetting from '../components/PromptSetting.vue'
import Uploading from '../components/upload/Uploading.vue'

import { createRouter, createWebHistory} from 'vue-router'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: Home
        },
        {
          path: 'uploading',
          name: 'Uploading',
          component: Uploading
        },
        {
          path: 'grading',
          name: 'Grading',
          component: Grading
        },
        {
          path: '/result',
          redirect: '/result/report'
        },
        {
          path: '/result/report',
          name: 'ResultReport',
          component: ReportPage
        },
        {
          path: '/result/analysis',
          name: 'ResultAnalysis', 
          component: AnalysisPage
        },
        {
          path: 'prompt-setting',
          name: 'PromptSetting',
          component: PromptSetting
        },
      ]
    }
  ]
})

export default router