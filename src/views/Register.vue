<template>
  <div class="register-page">
    <div class="register-container">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1>创建账号</h1>
        <p class="subtitle">注册新账号开始管理你的密码</p>
      </div>

      <div class="form">
        <div class="input-group">
          <label>邮箱</label>
          <input
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            class="input"
            @keyup.enter="handleSubmit"
          />
        </div>

        <div class="input-group">
          <label>密码</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="至少6位字符"
            class="input"
            @keyup.enter="handleSubmit"
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

        <div class="input-group">
          <label>确认密码</label>
          <input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="再次输入密码"
            class="input"
            @keyup.enter="handleSubmit"
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

        <button class="btn-primary" :disabled="loading" @click="handleSubmit">
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <div class="footer-link">
          已有账号？<router-link to="/">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { usePasswordStore } from '@/stores/password'
import { showToast } from 'vant'

const router = useRouter()
const settingsStore = useSettingsStore()
const passwordStore = usePasswordStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (!email.value) {
      error.value = '请输入邮箱'
      return
    }
    if (!password.value || password.value.length < 6) {
      error.value = '密码至少6位'
      return
    }
    if (password.value !== confirmPassword.value) {
      error.value = '两次输入的密码不一致'
      return
    }

    const result = await settingsStore.register(email.value, password.value)
    if (result.success) {
      passwordStore.setUserId(result.user.id)
      await passwordStore.loadAll()
      showToast('注册成功')
      router.push('/home')
    } else {
      error.value = result.error || '注册失败'
    }
  } catch (e) {
    error.value = '注册失败，请重试'
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 360px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
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

.subtitle {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
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
  margin-top: 8px;
}

.btn-primary:hover {
  background: #333;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.footer-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.footer-link a {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
}

.footer-link a:hover {
  text-decoration: underline;
}
</style>