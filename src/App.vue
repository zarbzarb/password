<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { supabase } from '@/utils/supabase'

const settingsStore = useSettingsStore()

onMounted(async () => {
  // 监听 Supabase 认证状态变化
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      // 用户退出登录
      settingsStore.user = null
      settingsStore.isLoggedIn = false
    } else if (event === 'SIGNED_IN' && session) {
      // 用户登录
      settingsStore.user = session.user
    }
  })
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #fff;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>