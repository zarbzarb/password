<template>
  <div class="edit-page">
    <header class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>{{ isEdit ? '编辑' : '添加' }}</h1>
      <button class="btn-save" @click="handleSave">保存</button>
    </header>

    <div class="form-container">
      <div class="input-group">
        <label>网站名称 *</label>
        <input v-model="form.website" placeholder="如：GitHub" class="input" />
      </div>

      <div class="input-group">
        <label>网址</label>
        <div class="url-input-wrapper">
          <input v-model="form.url" :placeholder="urlPlaceholder" class="input url-input" />
          <button class="prefix-btn" @click="showUrlPrefixPicker = true">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>
        <div v-if="urlPrefixes.length > 0" class="prefix-tags">
          <span
            v-for="prefix in urlPrefixes"
            :key="prefix.value"
            class="prefix-tag"
            @click="addUrlPrefix(prefix.value)"
          >{{ prefix.label }}</span>
        </div>
      </div>

      <div class="input-group">
        <label>账号 *</label>
        <input v-model="form.username" placeholder="用户名或邮箱" class="input" />
      </div>

      <div class="input-group">
        <label>密码 *</label>
        <div class="password-input">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="输入密码"
            class="input"
          />
          <button class="toggle-btn" @click="showPassword = !showPassword">
            <svg v-if="showPassword" viewBox="0 0 24 24" width="18" height="18" stroke="#999" stroke-width="2" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.45 3.54M1 1l22 22"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="#999" stroke-width="2" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="generate-btn" @click="goToGenerator">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="#999" stroke-width="2" fill="none">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L7.5 21"/>
            </svg>
          </button>
        </div>
        <div v-if="form.password" class="strength-bar">
          <div class="strength-fill" :style="{ width: strengthPercent + '%', background: strength.color }"></div>
        </div>
        <div v-if="form.password" class="strength-label">强度：{{ strength.text }}</div>
      </div>

      <div class="input-group">
        <label>分类</label>
        <div class="category-select" @click="showCategoryPicker = true">
          <span>{{ form.category }}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      <div class="input-group">
        <label>备注</label>
        <textarea v-model="form.notes" placeholder="可选" class="textarea" rows="3"></textarea>
      </div>
    </div>

    <div v-if="showCategoryPicker" class="picker-overlay" @click="showCategoryPicker = false">
      <div class="picker-content" @click.stop>
        <div class="picker-title">选择分类</div>
        <div class="picker-options">
          <div
            v-for="cat in settingsStore.categories"
            :key="cat"
            class="picker-option"
            :class="{ selected: form.category === cat }"
            @click="selectCategory(cat)"
          >{{ cat }}</div>
        </div>
      </div>
    </div>

    <div v-if="showUrlPrefixPicker" class="picker-overlay" @click="showUrlPrefixPicker = false">
      <div class="picker-content" @click.stop>
        <div class="picker-title">选择网址前缀</div>
        <div class="picker-options">
          <div
            v-for="prefix in urlPrefixList"
            :key="prefix.value"
            class="picker-option"
            @click="addUrlPrefix(prefix.value)"
          >
            <span class="prefix-icon">{{ prefix.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePasswordStore } from '@/stores/password'
import { useSettingsStore } from '@/stores/settings'
import { checkPasswordStrength } from '@/utils/crypto'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const passwordStore = usePasswordStore()
const settingsStore = useSettingsStore()

const isEdit = ref(false)
const itemId = ref('')
const showPassword = ref(false)
const showCategoryPicker = ref(false)
const showUrlPrefixPicker = ref(false)

const urlPrefixList = [
  { label: 'https://', value: 'https://' },
  { label: 'http://', value: 'http://' },
  { label: 'mailto:', value: 'mailto:' },
  { label: 'ftp://', value: 'ftp://' },
  { label: 'git://', value: 'git://' },
  { label: 'ssh://', value: 'ssh://' }
]

const urlPrefixes = computed(() => {
  const hasPrefix = urlPrefixList.some(p => form.value.url.startsWith(p.value))
  if (hasPrefix) return []
  return urlPrefixList.slice(0, 4)
})

const urlPlaceholder = computed(() => {
  if (urlPrefixes.value.length > 0) {
    return 'github.com 或点击上方添加前缀'
  }
  return form.value.url || 'https://github.com'
})

const form = ref({
  website: '',
  url: '',
  username: '',
  password: '',
  category: '社交',
  notes: ''
})

const strength = computed(() => {
  if (!form.value.password) return { level: 'weak', text: '', color: '#ccc' }
  return checkPasswordStrength(form.value.password)
})

const strengthPercent = computed(() => {
  switch (strength.value.level) {
    case 'weak': return 33
    case 'medium': return 66
    case 'strong': return 100
    default: return 0
  }
})

onMounted(() => {
  if (settingsStore.categories.length === 0) {
    settingsStore.categories = ['社交', '工作', '金融', '购物']
  }
  const storedPassword = sessionStorage.getItem('generatedPassword')
  if (storedPassword) {
    form.value.password = storedPassword
    sessionStorage.removeItem('generatedPassword')
  }

  const id = route.params.id
  if (id) {
    isEdit.value = true
    itemId.value = id
    const item = passwordStore.getItem(id)
    if (item) {
      form.value = { ...item }
    }
  }
})

watch(() => route.params.id, (id) => {
  if (id) {
    isEdit.value = true
    itemId.value = id
    const item = passwordStore.getItem(id)
    if (item) {
      form.value = { ...item }
    }
  }
})

function goBack() {
  router.back()
}

function goToGenerator() {
  router.push('/generator')
}

function selectCategory(cat) {
  form.value.category = cat
  showCategoryPicker.value = false
}

function addUrlPrefix(prefix) {
  showUrlPrefixPicker.value = false
  const hasPrefix = urlPrefixList.some(p => form.value.url.startsWith(p.value))
  if (hasPrefix) {
    const currentPrefix = urlPrefixList.find(p => form.value.url.startsWith(p.value))
    form.value.url = form.value.url.replace(currentPrefix.value, prefix)
  } else {
    form.value.url = prefix + form.value.url
  }
}

async function handleSave() {
  if (!form.value.website.trim()) {
    showToast('请输入网站名称')
    return
  }
  if (!form.value.username.trim()) {
    showToast('请输入账号')
    return
  }
  if (!form.value.password.trim()) {
    showToast('请输入密码')
    return
  }

  try {
    if (isEdit.value) {
      passwordStore.updateItem(itemId.value, form.value)
      showToast('已保存')
    } else {
      passwordStore.addItem(form.value)
      showToast('已添加')
    }
    router.back()
  } catch (e) {
    showToast('操作失败')
  }
}
</script>

<style scoped>
.edit-page {
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

.btn-save {
  padding: 10px 20px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.form-container {
  padding: 20px;
}

.input-group {
  margin-bottom: 20px;
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
  padding: 0 16px;
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

.url-input-wrapper {
  position: relative;
}

.url-input {
  padding-right: 48px;
}

.prefix-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.prefix-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.prefix-tag {
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.prefix-tag:hover {
  background: #eee;
}

.password-input {
  position: relative;
}

.password-input .input {
  padding-right: 80px;
}

.toggle-btn, .generate-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.toggle-btn {
  right: 44px;
}

.generate-btn {
  right: 12px;
}

.strength-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s, background 0.3s;
}

.strength-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.category-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
}

.category-select span {
  font-size: 15px;
  color: #1a1a1a;
}

.textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 15px;
  resize: none;
}

.textarea:focus {
  outline: none;
  border-color: #1a1a1a;
}

.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.picker-content {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.picker-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.picker-option {
  padding: 12px 20px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.picker-option.selected {
  background: #1a1a1a;
  color: #fff;
}

.prefix-icon {
  font-family: monospace;
}
</style>