<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1>密码管理器</h1>
      </div>

      <div v-if="isFirstTime" class="guide">
        <p class="guide-title">欢迎使用</p>
        <p class="guide-text">设置一个主密码来保护您的所有密码</p>
        <p class="guide-tip">主密码是解锁应用的唯一钥匙，请妥善保管</p>
      </div>

      <div v-else-if="hasSession" class="session-banner">
        <p>检测到最近会话</p>
        <p class="session-tip">输入主密码继续使用</p>
      </div>

      <div class="form">
        <div class="input-group">
          <label>{{ isFirstTime ? '设置主密码' : '输入主密码' }}</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="isFirstTime ? '至少4位字符' : '请输入主密码'"
            class="input"
            @keyup.enter="handleLogin"
          />
          <button class="toggle-btn" @click="showPassword = !showPassword">
            <svg v-if="showPassword" viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.45 3.54M1 1l22 22"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <div v-if="isFirstTime" class="input-group">
          <label>确认主密码</label>
          <input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="再次输入主密码"
            class="input"
            @keyup.enter="handleLogin"
          />
          <button class="toggle-btn" @click="showConfirmPassword = !showConfirmPassword">
            <svg v-if="showConfirmPassword" viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.45 3.54M1 1l22 22"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <button class="btn-primary" :disabled="loading" @click="handleLogin">
          {{ loading ? '处理中...' : (isFirstTime ? '创建' : '解锁') }}
        </button>

        <div v-if="!isFirstTime" class="forgot">
          <button class="btn-text" @click="handleReset">忘记密码？清除数据</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { usePasswordStore } from '@/stores/password'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const settingsStore = useSettingsStore()
const passwordStore = usePasswordStore()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const loading = ref(false)
const isFirstTime = ref(false)
const hasSession = ref(false)

onMounted(() => {
  settingsStore.load()
  isFirstTime.value = !settingsStore.hasMasterPassword()

  if (!isFirstTime.value && settingsStore.getSession()) {
    hasSession.value = true
  }
})

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    if (isFirstTime.value) {
      if (!password.value || password.value.length < 4) {
        error.value = '密码长度至少4位'
        return
      }
      if (password.value !== confirmPassword.value) {
        error.value = '两次输入的密码不一致'
        return
      }
      settingsStore.setMasterPassword(password.value)
      passwordStore.setMasterPassword(password.value)
      passwordStore.loadAll()
      showToast('创建成功')
    } else {
      if (!password.value || password.value.length < 4) {
        error.value = '请输入主密码'
        return
      }
      if (!settingsStore.verifyMasterPassword(password.value)) {
        error.value = '密码错误'
        return
      }
      settingsStore.isLoggedIn = true
      settingsStore.saveSession(password.value)
      passwordStore.setMasterPassword(password.value)
      passwordStore.loadAll()
      showToast('解锁成功')
    }
    router.push('/home')
  } catch (e) {
    error.value = '操作失败，请重试'
  } finally {
    loading.value = false
  }
}

async function handleReset() {
  const result = await showConfirmDialog({
    title: '清除数据',
    message: '确定要清除所有数据吗？此操作不可恢复。'
  })
  if (result) {
    settingsStore.clearData()
    passwordStore.items = []
    isFirstTime.value = true
    password.value = ''
    confirmPassword.value = ''
    showToast('数据已清除')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 360px;
}

.logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #f5f5f5;
  margin-bottom: 20px;
}

.logo-icon svg {
  color: #333;
}

.logo h1 {
  font-size: 22px;
  font-weight: 500;
  color: #1a1a1a;
}

.guide {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 12px;
}

.guide-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.guide-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.guide-tip {
  font-size: 12px;
  color: #999;
}

.session-banner {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f0f9f0;
  border-radius: 12px;
}

.session-banner p {
  font-size: 15px;
  color: #1a1a1a;
}

.session-tip {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.form {
  margin-top: 20px;
}

.input-group {
  margin-bottom: 16px;
  position: relative;
}

.input-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  height: 48px;
  padding: 0 48px 0 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 15px;
  background: #fff;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #1a1a1a;
}

.input::placeholder {
  color: #bbb;
}

.toggle-btn {
  position: absolute;
  right: 12px;
  bottom: 14px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.error {
  color: #e53935;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}

.btn-primary {
  width: 100%;
  height: 48px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #333;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.forgot {
  text-align: center;
  margin-top: 20px;
}

.btn-text {
  background: none;
  border: none;
  color: #999;
  font-size: 13px;
  cursor: pointer;
}

.btn-text:hover {
  color: #666;
}
</style>