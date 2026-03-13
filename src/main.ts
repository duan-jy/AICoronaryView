import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initCornerstone } from './utils/cornerstone'

import './styles/main.less'

async function bootstrap() {
  // Initialize Cornerstone3D before mounting the app
  await initCornerstone()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

bootstrap().catch(console.error)
