<template>
  <div class="home-page">
    <header class="header">
      <h1>密码</h1>
      <div class="header-actions">
        <button class="btn-icon" @click="goToSettings">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button class="btn-icon" @click="handleLogout">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </button>
      </div>
    </header>

    <div class="search-bar">
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="#999" stroke-width="2" fill="none">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="searchQuery"
        placeholder="搜索"
        class="search-input"
        @input="handleSearch"
      />
      <button v-if="searchQuery" class="clear-btn" @click="handleClear">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div v-if="allCategories.length > 0" class="category-tabs">
      <button
        class="tab"
        :class="{ active: activeCategory === 0 }"
        @click="handleCategoryChange(0)"
      >全部</button>
      <button
        v-for="(cat, index) in allCategories"
        :key="cat"
        class="tab"
        :class="{ active: activeCategory === index + 1 }"
        @click="handleCategoryChange(index + 1)"
      >{{ cat }}</button>
    </div>

    <div class="password-list">
      <div v-if="displayItems.length === 0 && passwordStore.items.length === 0" class="empty-guide">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ccc" stroke-width="1.5" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <p class="empty-title">还没有密码</p>
        <p class="empty-text">点击下方按钮添加第一个密码</p>
      </div>

      <div v-else-if="displayItems.length === 0" class="empty-guide">
        <p class="empty-text">没有找到匹配的密码</p>
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

    <button class="add-btn" @click="goToAdd">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePasswordStore } from '@/stores/password'
import { useSettingsStore } from '@/stores/settings'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const passwordStore = usePasswordStore()
const settingsStore = useSettingsStore()

const searchQuery = ref('')
const activeCategory = ref(0)

const allCategories = computed(() => {
  const cats = new Set(passwordStore.items.map(item => item.category))
  return Array.from(cats)
})

const displayItems = computed(() => {
  let result = passwordStore.items

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.website.toLowerCase().includes(query) ||
      item.username.toLowerCase().includes(query)
    )
  }

  if (activeCategory.value > 0 && allCategories.value[activeCategory.value - 1]) {
    result = result.filter(item => item.category === allCategories.value[activeCategory.value - 1])
  }

  return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

let autoLockTimer = null

function resetAutoLockTimer() {
  if (autoLockTimer) clearTimeout(autoLockTimer)
  autoLockTimer = setTimeout(() => {
    handleAutoLock()
  }, settingsStore.autoLockTime * 60 * 1000)
}

function handleActivity() {
  resetAutoLockTimer()
}

onMounted(() => {
  passwordStore.loadAll()
  document.addEventListener('mousemove', handleActivity)
  document.addEventListener('keydown', handleActivity)
  document.addEventListener('click', handleActivity)
  resetAutoLockTimer()
})

onUnmounted(() => {
  if (autoLockTimer) clearTimeout(autoLockTimer)
  document.removeEventListener('mousemove', handleActivity)
  document.removeEventListener('keydown', handleActivity)
  document.removeEventListener('click', handleActivity)
})

function handleAutoLock() {
  passwordStore.items = []
  passwordStore.masterPassword = ''
  passwordStore.userId = ''
  settingsStore.clearSession()
  settingsStore.isLoggedIn = false
  router.push('/')
  showToast('已自动锁定')
}

function handleSearch() {
  passwordStore.setSearchQuery(searchQuery.value)
}

function handleClear() {
  searchQuery.value = ''
  passwordStore.setSearchQuery('')
}

function handleCategoryChange(index) {
  activeCategory.value = index
}

function goToDetail(id) {
  router.push(`/detail/${id}`)
}

function goToAdd() {
  router.push('/add')
}

function goToSettings() {
  router.push('/settings')
}

async function handleLogout() {
  const result = await showConfirmDialog({
    title: '锁定',
    message: '确定要锁定密码管理器吗？'
  })
  if (result) {
    passwordStore.items = []
    passwordStore.masterPassword = ''
    passwordStore.userId = ''
    settingsStore.clearSession()
    settingsStore.isLoggedIn = false
    router.push('/')
    showToast('已锁定')
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #666;
}

.btn-icon:hover {
  background: #eee;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 20px 20px 0;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 10px;
}

.search-input {
  flex: 1;
  margin-left: 10px;
  border: none;
  background: none;
  font-size: 15px;
  color: #1a1a1a;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0;
  overflow-x: auto;
}

.tab {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
}

.tab.active {
  background: #1a1a1a;
  color: #fff;
}

.password-list {
  padding: 16px 20px 0;
}

.empty-guide {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-title {
  font-size: 16px;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.password-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}

.password-item:hover {
  background: #f0f0f0;
}

.item-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
}

.item-content {
  flex: 1;
  margin-left: 12px;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
}

.item-account {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.item-category {
  font-size: 12px;
  color: #999;
  padding: 4px 10px;
  background: #fff;
  border-radius: 6px;
}

.add-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-btn:hover {
  background: #333;
}
</style>