import { createRouter, createWebHistory } from 'vue-router'
import Grading from '../components/Grading.vue'
import Help from '../components/Help.vue'
import Home from '../components/Home.vue'
import PromptSetting from '../components/PromptSetting.vue'
import Result from '../components/Result.vue'
import Uploading from '../components/Uploading.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/uploading',
      name: 'Uploading',
      component: Uploading
    },
    {
      path: '/grading',
      name: 'Grading',
      component: Grading
    },
    {
      path: '/result',
      name: 'Result',
      component: Result
    },
    {
      path: '/prompt-setting',
      name: 'PromptSetting',
      component: PromptSetting
    },
    {
      path: '/help',
      name: 'Help',
      component: Help
    }
  ]
})

export default router