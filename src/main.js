import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router/index.js'

createApp(App).use(router).use(createPinia()).mount('#app')

