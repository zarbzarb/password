import { createRouter, createWebHashHistory } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add',
    name: 'Add',
    component: () => import('@/views/Edit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: () => import('@/views/Edit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/Detail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/generator',
    name: 'Generator',
    component: () => import('@/views/Generator.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const settingsStore = useSettingsStore()
  
  if (to.meta.requiresAuth && !settingsStore.isLoggedIn) {
    next('/')
  } else if (to.path === '/' && settingsStore.isLoggedIn) {
    next('/home')
  } else {
    next()
  }
})

export default router
