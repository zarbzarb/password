<template>
  <div class="generator-page">
    <header class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>生成密码</h1>
      <button class="btn-use" @click="usePassword">使用</button>
    </header>

    <div class="generator-content">
      <div class="password-display">
        <span class="password-text">{{ generatedPassword || '点击生成' }}</span>
        <button class="copy-btn" @click="copyPassword">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="#999" stroke-width="2" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>

      <div v-if="generatedPassword" class="strength-section">
        <div class="strength-bar">
          <div class="strength-fill" :style="{ width: strengthPercent + '%', background: strength.color }"></div>
        </div>
        <span class="strength-label">{{ strength.text }}</span>
      </div>

      <button class="generate-btn" @click="generate">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l5.64 5.64A9 9 0 0 0 20.49 15"/>
        </svg>
        生成
      </button>

      <div class="options-section">
        <div class="option-item">
          <span>长度</span>
          <div class="option-control">
            <span class="length-value">{{ length }}</span>
            <input type="range" v-model="length" min="4" max="32" class="slider" />
          </div>
        </div>

        <div class="option-item">
          <span>大写字母</span>
          <button class="toggle" :class="{ active: options.uppercase }" @click="options.uppercase = !options.uppercase">
            <svg v-if="options.uppercase" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>

        <div class="option-item">
          <span>小写字母</span>
          <button class="toggle" :class="{ active: options.lowercase }" @click="options.lowercase = !options.lowercase">
            <svg v-if="options.lowercase" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>

        <div class="option-item">
          <span>数字</span>
          <button class="toggle" :class="{ active: options.numbers }" @click="options.numbers = !options.numbers">
            <svg v-if="options.numbers" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>

        <div class="option-item">
          <span>特殊字符</span>
          <button class="toggle" :class="{ active: options.symbols }" @click="options.symbols = !options.symbols">
            <svg v-if="options.symbols" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { generatePassword, checkPasswordStrength } from '@/utils/crypto'
import { showToast } from 'vant'

const router = useRouter()

const length = ref(16)
const generatedPassword = ref('')

const options = ref({
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true
})

const strength = computed(() => {
  if (!generatedPassword.value) return { level: 'weak', text: '', color: '#ccc' }
  return checkPasswordStrength(generatedPassword.value)
})

const strengthPercent = computed(() => {
  switch (strength.value.level) {
    case 'weak': return 33
    case 'medium': return 66
    case 'strong': return 100
    default: return 0
  }
})

function goBack() {
  router.back()
}

function generate() {
  generatedPassword.value = generatePassword(length.value, options.value)
}

async function copyPassword() {
  if (!generatedPassword.value) {
    showToast('请先生成密码')
    return
  }
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    showToast('已复制')
  } catch {
    showToast('复制失败')
  }
}

function usePassword() {
  if (!generatedPassword.value) {
    showToast('请先生成密码')
    return
  }
  sessionStorage.setItem('generatedPassword', generatedPassword.value)
  router.back()
}

watch([length, options], () => {
  if (generatedPassword.value) generate()
}, { deep: true })

generate()
</script>

<style scoped>
.generator-page {
  min-height: 100vh;
  background: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.btn-back {
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

.btn-use {
  padding: 10px 20px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.generator-content {
  padding: 20px;
}

.password-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 16px;
}

.password-text {
  font-size: 18px;
  font-family: monospace;
  color: #1a1a1a;
  word-break: break-all;
}

.copy-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.strength-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s, background 0.3s;
}

.strength-label {
  font-size: 13px;
  color: #666;
}

.generate-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 30px;
}

.options-section {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.option-item:last-child {
  border-bottom: none;
}

.option-item span {
  font-size: 15px;
  color: #1a1a1a;
}

.option-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.length-value {
  font-size: 14px;
  color: #666;
  width: 30px;
}

.slider {
  width: 100px;
  height: 4px;
  background: #e5e5e5;
  border-radius: 2px;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #1a1a1a;
  border-radius: 8px;
  cursor: pointer;
}

.toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e5e5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.toggle.active {
  background: #1a1a1a;
  color: #fff;
}
</style>