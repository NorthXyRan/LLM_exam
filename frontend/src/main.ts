import './assets/main.css'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus, { size: 'small', zIndex: 3000 }) // 使用ElementPlus，设置表单组件的默认尺寸为small，zIndex为3000
app.use(router)

app.mount('#app')
