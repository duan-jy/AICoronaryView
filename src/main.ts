import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './styles/main.less'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Initialize Cornerstone3D lazily after app mount (non-blocking)
// This prevents WebGL errors from crashing the entire app
import('./utils/cornerstone/init')
  .then(({ initCornerstone }) => initCornerstone())
  .then(() => console.log('[v0] Cornerstone3D initialized'))
  .catch((err) => console.warn('[v0] Cornerstone3D init skipped (no WebGL?):', err))
