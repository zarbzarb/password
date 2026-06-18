import { createRouter, createWebHashHistory } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { supabase } from '@/utils/supabase'

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

// 全局初始化标志
let isInitialized = false

router.beforeEach(async (to, from, next) => {
  const settingsStore = useSettingsStore()

  // 首次导航时初始化 Supabase 会话
  if (!isInitialized) {
    isInitialized = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const result = await settingsStore.checkSession()
        if (result.hasSession) {
          settingsStore.isLoggedIn = true
        }
      }
    } catch (error) {
      console.error('初始化会话失败:', error)
    }
  }

  if (to.meta.requiresAuth && !settingsStore.isLoggedIn) {
    next('/')
  } else if (to.path === '/' && settingsStore.isLoggedIn) {
    next('/home')
  } else {
    next()
  }
})

export default router