<template>
  <div class="detail-page">
    <header class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>详情</h1>
      <button class="btn-edit" @click="goToEdit">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </header>

    <div v-if="item" class="detail-content">
      <div class="website-header">
        <div class="website-icon">{{ item.website.charAt(0).toUpperCase() }}</div>
        <div class="website-info">
          <h2>{{ item.website }}</h2>
          <span class="category-tag">{{ item.category }}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-item">
          <label>账号</label>
          <div class="info-value">
            <span>{{ item.username }}</span>
            <button class="copy-btn" @click="copyToClipboard(item.username)">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="info-item">
          <label>密码</label>
          <div class="info-value">
            <span class="password-value" :class="{ revealed: showPassword }">
              {{ showPassword ? item.password : '••••••••' }}
            </span>
            <button class="copy-btn" @click="copyToClipboard(item.password)">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button class="reveal-btn" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.45 3.54M1 1l22 22"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="item.url" class="info-item">
          <label>网址</label>
          <div class="info-value">
            <span class="url-link" @click="openUrl">{{ item.url }}</span>
            <button class="copy-btn" @click="copyToClipboard(item.url)">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="item.notes" class="info-item">
          <label>备注</label>
          <div class="info-value notes">{{ item.notes }}</div>
        </div>

        <div class="info-item time">
          <label>创建时间</label>
          <span>{{ formatDate(item.createdAt) }}</span>
        </div>
        <div class="info-item time">
          <label>更新时间</label>
          <span>{{ formatDate(item.updatedAt) }}</span>
        </div>
      </div>

      <button class="delete-btn" @click="handleDelete">删除此密码</button>
    </div>

    <div v-else class="empty-state">
      <p>密码不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePasswordStore } from '@/stores/password'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const passwordStore = usePasswordStore()

const item = ref(null)
const showPassword = ref(false)

onMounted(() => {
  loadItem()
})

function loadItem() {
  const id = route.params.id
  if (id) {
    item.value = passwordStore.getItem(id)
  }
}

function goBack() {
  router.back()
}

function goToEdit() {
  router.push(`/edit/${route.params.id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制')
  } catch {
    showToast('复制失败')
  }
}

function openUrl() {
  if (item.value?.url) {
    let url = item.value.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    window.open(url, '_blank')
  }
}

async function handleDelete() {
  const result = await showConfirmDialog({
    title: '删除',
    message: '确定要删除这个密码吗？'
  })
  if (result) {
    passwordStore.deleteItem(route.params.id)
    showToast('已删除')
    router.back()
  }
}
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.btn-back, .btn-edit {
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

.header h1 {
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
}

.website-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f8f8;
}

.website-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  border-radius: 14px;
  font-size: 24px;
  font-weight: 500;
}

.website-info {
  margin-left: 16px;
}

.website-info h2 {
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
}

.category-tag {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.info-section {
  padding: 20px;
}

.info-item {
  margin-bottom: 20px;
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value span {
  font-size: 15px;
  color: #1a1a1a;
}

.password-value {
  font-family: monospace;
  color: #999;
}

.password-value.revealed {
  color: #1a1a1a;
}

.url-link {
  color: #1a1a1a;
  cursor: pointer;
}

.copy-btn, .reveal-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.notes {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.info-item.time {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item.time span {
  font-size: 13px;
  color: #999;
}

.delete-btn {
  width: 100%;
  height: 48px;
  margin: 20px;
  background: #fff;
  color: #e53935;
  border: 1px solid #e53935;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}
</style>