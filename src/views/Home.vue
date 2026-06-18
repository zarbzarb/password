<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <div class="navbar">
      <div class="navbar-title">密码管理器</div>
      <div class="navbar-actions">
        <van-icon name="setting-o" size="22" @click="goToSettings" />
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <van-search
        v-model="searchQuery"
        placeholder="搜索密码"
        shape="round"
        background="#f5f5f5"
        @update:model-value="handleSearch"
      />
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <div
        v-for="(cat, index) in displayCategories"
        :key="cat"
        :class="['category-tab', { active: activeCategory === index }]"
        @click="activeCategory = index"
      >
        {{ cat }}
      </div>
    </div>

    <!-- 密码列表 -->
    <div class="password-list">
      <div v-if="loading" class="empty">
        <div class="empty-icon">⏳</div>
        <p>加载中...</p>
      </div>

      <div v-else-if="displayItems.length === 0" class="empty">
        <div class="empty-icon">🔒</div>
        <p>还没有密码</p>
        <p class="empty-tip">点击下方按钮添加</p>
      </div>

      <div
        v-for="item in displayItems"
        :key="item.id"
        class="password-item"
        @click="goToDetail(item.id)"
      >
        <div class="item-icon">{{ (item.website || '?').charAt(0).toUpperCase() }}</div>
        <div class="item-content">
          <div class="item-name">{{ item.website }}</div>
          <div class="item-account">{{ item.username }}</div>
        </div>
        <div class="item-category">{{ item.category || '其他' }}</div>
      </div>
    </div>

    <!-- 浮动添加按钮 -->
    <van-floating-bubble icon="plus" @click="goToAdd" />

    <!-- 底部提示 -->
    <div class="footer">
      <p>数据存储在 Supabase 云端 · 已加密传输</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePasswordStore } from '@/stores/password'
import { useSettingsStore } from '@/stores/settings'
import { showConfirmDialog, showToast } from 'vant'

const router = useRouter()
const passwordStore = usePasswordStore()
const settingsStore = useSettingsStore()

const searchQuery = ref('')
const activeCategory = ref(0)
const loading = ref(false)
let autoLockTimer = null

const allCategories = computed(() => {
  const cats = new Set(['全部'])
  passwordStore.items.forEach(item => cats.add(item.category || '其他'))
  return Array.from(cats)
})

const displayCategories = computed(() => allCategories.value)

const displayItems = computed(() => {
  let result = passwordStore.items

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      (item.website || '').toLowerCase().includes(query) ||
      (item.username || '').toLowerCase().includes(query)
    )
  }

  if (activeCategory.value > 0 && allCategories.value[activeCategory.value]) {
    const targetCategory = allCategories.value[activeCategory.value]
    result = result.filter(item => (item.category || '其他') === targetCategory)
  }

  return result
})

onMounted(async () => {
  loading.value = true
  try {
    await passwordStore.loadAll()
  } finally {
    loading.value = false
  }
  resetAutoLockTimer()
  document.addEventListener('click', resetAutoLockTimer)
})

onUnmounted(() => {
  document.removeEventListener('click', resetAutoLockTimer)
  if (autoLockTimer) clearTimeout(autoLockTimer)
})

function resetAutoLockTimer() {
  if (autoLockTimer) clearTimeout(autoLockTimer)
  const minutes = settingsStore.autoLockTime || 5
  autoLockTimer = setTimeout(() => {
    handleAutoLock()
  }, minutes * 60 * 1000)
}

function handleSearch(value) {
  passwordStore.setSearchQuery(value)
}

function goToAdd() {
  router.push('/add')
}

function goToDetail(id) {
  router.push(`/detail/${id}`)
}

function goToSettings() {
  router.push('/settings')
}

function handleAutoLock() {
  settingsStore.clearSession()
  settingsStore.isLoggedIn = false
  passwordStore.clearAll()
  router.push('/')
  showToast('已自动锁定')
}

async function handleLogout() {
  const result = await showConfirmDialog({
    title: '退出登录',
    message: '确定要退出登录吗？'
  })
  if (result) {
    await settingsStore.logout()
    passwordStore.clearAll()
    router.push('/')
    showToast('已退出登录')
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 80px;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.navbar-title {
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
}

.navbar-actions {
  display: flex;
  gap: 16px;
}

.search-bar {
  padding: 12px 16px;
  background: #fff;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto;
  white-space: nowrap;
}

.category-tab {
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tab.active {
  background: #1a1a1a;
  color: #fff;
}

.password-list {
  padding: 0 16px;
}

.password-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.password-item:active {
  background: #fafafa;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #1a1a1a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  margin-right: 12px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-account {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-tip {
  font-size: 12px;
  color: #ccc;
  margin-top: 4px;
}

.footer {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: #ccc;
}
</style>