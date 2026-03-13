import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '诊断分析'
    }
  },
  {
    path: '/print',
    name: 'Print',
    component: () => import('@/views/PrintView.vue'),
    meta: {
      title: '打印胶片'
    }
  },
  {
    path: '/push',
    name: 'Push',
    component: () => import('@/views/PushView.vue'),
    meta: {
      title: '推送服务'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI冠脉分析系统`
  }
  next()
})

export default router
