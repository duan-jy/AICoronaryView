import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import 'element-plus/dist/index.css'

import 'swiper/swiper.min.css'
import 'swiper/modules/mousewheel/mousewheel.min.css'
import 'swiper/modules/navigation/navigation.min.css'

import Menus from 'vue3-menus'

import App from './App.vue'

import router from './routes'

import './assets/fonts/artery-icon/iconfont.css'

import './styles/reset.less'

import './styles/select.less'

import './styles/main.less'

import PushPreview from './components/preview'

import store from './store'

createApp(App)
  .use(ElementPlus, {
    locale: zhCn
  })
  .use(Menus)
  .use(router)
  .use(store)
  .use(PushPreview)
  .mount('#app')
