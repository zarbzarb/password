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

      <!-- 注册/登录切换 -->
      <div class="tabs">
        <button :class="['tab', { active: mode === 'login' }]" @click="mode = 'login'">登录</button>
        <button :class="['tab', { active: mode === 'register' }]" @click="mode = 'register'">注册</button>
      </div>

      <!-- 注册模式 -->
      <div v-if="mode === 'register'" class="guide">
        <p class="guide-title">创建账号</p>
        <p class="guide-text">设置您的账号和主密码</p>
      </div>

      <!-- 登录模式 -->
      <div v-else-if="hasSession" class="session-banner">
        <p>检测到最近会话</p>
        <p class="session-tip">输入主密码继续使用</p>
      </div>

      <div class="form">
        <!-- 账号输入（注册和登录都需要） -->
        <div class="input-group">
          <label>邮箱账号</label>
          <input
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            class="input"
            @keyup.enter="handleSubmit"
          />
        </div>

        <!-- 登录密码（Supabase 账号密码） -->
        <div class="input-group">
          <label>账号密码</label>
          <input
            v-model="accountPassword"
            :type="showAccountPassword ? 'text' : 'password'"
            placeholder="请输入账号密码"
            class="input"
            @keyup.enter="handleSubmit"
          />
          <button class="toggle-btn" @click="showAccountPassword = !showAccountPassword">
            <svg v-if="showAccountPassword" viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.45 3.54M1 1l22 22"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <!-- 主密码 -->
        <div class="input-group">
          <label>{{ mode === 'register' ? '设置主密码' : '输入主密码' }}</label>
          <input
            v-model="masterPassword"
            :type="showMasterPassword ? 'text' : 'password'"
            :placeholder="mode === 'register' ? '至少4位字符' : '请输入主密码'"
            class="input"
            @keyup.enter="handleSubmit"
          />
          <button class="toggle-btn" @click="showMasterPassword = !showMasterPassword">
            <svg v-if="showMasterPassword" viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.45 3.54M1 1l22 22"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="20" height="20" stroke="#999" stroke-width="2" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <!-- 确认主密码（仅注册时） -->
        <div v-if="mode === 'register'" class="input-group">
          <label>确认主密码</label>
          <input
            v-model="confirmMasterPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="再次输入主密码"
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
          {{ loading ? '处理中...' : (mode === 'register' ? '创建账号' : '登录') }}
        </button>
      </div>

      <div class="tips">
        <p class="tip-item">账号密码用于登录云端账号</p>
        <p class="tip-item">主密码用于加密/解密您的密码数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { usePasswordStore } from '@/stores/password'
import { showToast } from 'vant'

const router = useRouter()
const settingsStore = useSettingsStore()
const passwordStore = usePasswordStore()

const mode = ref('login') // 'login' or 'register'
const email = ref('')
const accountPassword = ref('')
const masterPassword = ref('')
const confirmMasterPassword = ref('')
const showAccountPassword = ref(false)
const showMasterPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const loading = ref(false)
const hasSession = ref(false)

onMounted(async () => {
  try {
    const result = await settingsStore.checkSession()
    if (result.hasSession) {
      hasSession.value = true
      const session = settingsStore.getSession()
      if (session) {
        passwordStore.setMasterPassword(session.masterPassword)
        passwordStore.setUserId(result.user.id)
        await passwordStore.loadAll()
        router.push('/home')
      }
    }
  } catch (e) {
    console.warn('初始化会话检查失败:', e)
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    // 验证输入
    if (!email.value) {
      error.value = '请输入邮箱'
      return
    }
    if (!accountPassword.value || accountPassword.value.length < 6) {
      error.value = '账号密码至少6位'
      return
    }
    if (!masterPassword.value || masterPassword.value.length < 4) {
      error.value = '主密码至少4位'
      return
    }

    if (mode.value === 'register') {
      // 注册模式
      if (masterPassword.value !== confirmMasterPassword.value) {
        error.value = '两次输入的主密码不一致'
        return
      }

      const result = await settingsStore.register(email.value, accountPassword.value, masterPassword.value)
      if (result.success) {
        passwordStore.setMasterPassword(masterPassword.value)
        passwordStore.setUserId(result.user.id)
        await passwordStore.loadAll()
        showToast('注册成功')
        router.push('/home')
      } else {
        error.value = result.error || '注册失败'
      }
    } else {
      // 登录模式
      const result = await settingsStore.login(email.value, accountPassword.value, masterPassword.value)
      if (result.success) {
        passwordStore.setMasterPassword(masterPassword.value)
        passwordStore.setUserId(result.user.id)
        await passwordStore.loadAll()
        showToast('登录成功')
        router.push('/home')
      } else {
        error.value = result.error || '登录失败'
      }
    }
  } catch (e) {
    error.value = '操作失败，请重试'
    console.error(e)
  } finally {
    loading.value = false
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

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  height: 40px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #1a1a1a;
  color: #fff;
}

.guide {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
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
}

.session-banner {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
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

.tips {
  margin-top: 20px;
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
}

.tip-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.tip-item:last-child {
  margin-bottom: 0;
}
</style>