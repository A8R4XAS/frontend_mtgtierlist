import './assets/main.css'
// main.js oder main.ts


import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Bootstrap CSS und JavaScript importieren 
import '@/assets/bootstrap-5.3.3-dist/js/bootstrap.bundle.min.js'
import '@/assets/bootstrap-5.3.3-dist/css/bootstrap.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
