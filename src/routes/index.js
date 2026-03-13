import * as VueRouter from 'vue-router'

import { name } from '../setting'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/home.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home.vue')
  },
  {
    path: '/print',
    name: 'Print',
    component: () => import('../views/print.vue')
  },
  {
    path: '/push',
    name: 'PUSH',
    component: () => import('../views/push.vue')
  }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.query && to.query.patientId) {
    document.title = `${to.query.patientId}-${name}`
  }
  next()
})

export default router
