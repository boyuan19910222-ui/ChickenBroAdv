import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Import Bootstrap CSS/JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import router
import router from './router'

// Create Vue app instance for admin panel
const app = createApp(App)
app.use(router)
app.mount('#admin-app')
