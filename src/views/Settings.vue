<template>
  <div class="settings-page">
    <header class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>设置</h1>
      <span></span>
    </header>

    <div class="settings-content">
      <div class="section">
        <div class="section-title">安全</div>
        <div class="setting-item" @click="showChangePassword = true">
          <span>修改主密码</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        <div class="setting-item">
          <span>自动锁定</span>
          <div class="setting-control">
            <span>{{ autoLockTime }} 分钟</span>
          </div>
        </div>
        <div class="slider-container">
          <input type="range" v-model="autoLockTime" min="1" max="30" class="slider" />
        </div>
      </div>

      <div class="section">
        <div class="section-title">数据</div>
        <div class="setting-item" @click="showExportPicker = true">
          <span>导出备份</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
        <div class="setting-item" @click="triggerImport">
          <span>导入恢复</span>
          <span class="import-tip">支持 JSON / CSV</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <div class="section">
        <div class="section-title">分类</div>
        <div class="category-list">
          <div v-for="cat in categories" :key="cat" class="category-item">
            <span>{{ cat }}</span>
            <button class="remove-btn" @click="handleRemoveCategory(cat)">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="add-category">
            <input v-model="newCategory" placeholder="新增分类" class="category-input" />
            <button class="add-btn" @click="handleAddCategory">添加</button>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">其他</div>
        <div class="setting-item" @click="showAbout = true">
          <span>关于</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="#999" stroke-width="2" fill="none">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      <button class="clear-btn" @click="handleClearData">清除所有数据</button>
    </div>

    <input ref="fileInput" type="file" accept=".json,.csv" style="display: none" @change="handleFileSelect" />

    <div v-if="showExportPicker" class="modal-overlay" @click="showExportPicker = false">
      <div class="modal-content" @click.stop>
        <div class="modal-title">选择导出格式</div>
        <div class="export-options">
          <div class="export-option" @click="handleExport('json')">
            <div class="export-icon">JSON</div>
            <div class="export-info">
              <span class="export-name">JSON</span>
              <span class="export-desc">明文格式，可导入恢复</span>
            </div>
          </div>
          <div class="export-option" @click="handleExport('md')">
            <div class="export-icon">MD</div>
            <div class="export-info">
              <span class="export-name">Markdown</span>
              <span class="export-desc">明文展示，适合阅读</span>
            </div>
          </div>
          <div class="export-option" @click="handleExport('txt')">
            <div class="export-icon">TXT</div>
            <div class="export-info">
              <span class="export-name">文本文件</span>
              <span class="export-desc">明文展示，简单通用</span>
            </div>
          </div>
          <div class="export-option" @click="handleExport('csv')">
            <div class="export-icon">CSV</div>
            <div class="export-info">
              <span class="export-name">表格文件</span>
              <span class="export-desc">可用 Excel 打开</span>
            </div>
          </div>
        </div>
        <button class="btn-cancel-full" @click="showExportPicker = false">取消</button>
      </div>
    </div>

    <div v-if="showImportPreview" class="modal-overlay" @click="showImportPreview = false">
      <div class="modal-content import-preview" @click.stop>
        <div class="modal-title">导入预览</div>
        <p class="import-count">共 {{ importItems.length }} 条记录</p>
        <div class="preview-list">
          <div v-for="item in importItems.slice(0, 5)" :key="item.id" class="preview-item">
            <span class="preview-name">{{ item.website }}</span>
            <span class="preview-user">{{ item.username }}</span>
          </div>
          <p v-if="importItems.length > 5" class="preview-more">还有 {{ importItems.length - 5 }} 条...</p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showImportPreview = false">取消</button>
          <button class="btn-confirm" @click="confirmImport">确认导入</button>
        </div>
      </div>
    </div>

    <div v-if="showChangePassword" class="modal-overlay" @click="showChangePassword = false">
      <div class="modal-content" @click.stop>
        <div class="modal-title">修改主密码</div>
        <div class="input-group">
          <label>当前密码</label>
          <input v-model="oldPassword" type="password" class="input" />
        </div>
        <div class="input-group">
          <label>新密码</label>
          <input v-model="newPassword" type="password" class="input" />
        </div>
        <div class="input-group">
          <label>确认新密码</label>
          <input v-model="confirmPassword" type="password" class="input" />
        </div>
        <div v-if="passwordError" class="error">{{ passwordError }}</div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showChangePassword = false">取消</button>
          <button class="btn-confirm" @click="handleChangePassword">确认</button>
        </div>
      </div>
    </div>

    <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
      <div class="modal-content about" @click.stop>
        <div class="modal-title">关于</div>
        <p>密码管理器 v1.0.0</p>
        <p>安全的云端密码管理工具</p>
        <p>数据存储在 Supabase 云端</p>
        <p>采用 AES-256 加密保护</p>
        <p>支持多设备同步</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { usePasswordStore } from '@/stores/password'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const settingsStore = useSettingsStore()
const passwordStore = usePasswordStore()

const showChangePassword = ref(false)
const showAbout = ref(false)
const showExportPicker = ref(false)
const showImportPreview = ref(false)
const fileInput = ref(null)
const importItems = ref([])

const autoLockTime = ref(5)
const categories = ref(['社交', '工作', '金融', '购物'])
const newCategory = ref('')

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

settingsStore.load()
autoLockTime.value = settingsStore.autoLockTime
categories.value = [...settingsStore.categories]

watch(autoLockTime, (val) => {
  settingsStore.setAutoLockTime(val)
})

function goBack() {
  router.back()
}

function triggerImport() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) handleImport(file)
  event.target.value = ''
}

function handleExport(format) {
  showExportPicker.value = false
  settingsStore.exportDataFile(format, passwordStore.items)
  showToast('已导出')
}

async function handleImport(file) {
  try {
    const result = await settingsStore.importDataFile(file, passwordStore.masterPassword)

    if (result.type === 'json') {
      if (result.data.passwords && Array.isArray(result.data.passwords)) {
        importItems.value = result.data.passwords
        showImportPreview.value = true
      } else {
        showToast('JSON 文件格式不正确')
      }
    } else if (result.type === 'csv') {
      importItems.value = result.items
      showImportPreview.value = true
    }
  } catch (e) {
    showToast(e.message || '导入失败')
  }
}

async function confirmImport() {
  showImportPreview.value = false

  for (const item of importItems.value) {
    try {
      await passwordStore.addItem({
        website: item.website,
        url: item.url,
        username: item.username,
        password: item.password,
        category: item.category || '导入',
        notes: item.notes || ''
      })
    } catch (e) {
      console.error('导入失败:', e)
    }
  }

  showToast(`已导入 ${importItems.value.length} 条记录`)
  importItems.value = []
}

function handleAddCategory() {
  if (!newCategory.value.trim()) {
    showToast('请输入分类名称')
    return
  }
  settingsStore.addCategory(newCategory.value)
  categories.value = [...settingsStore.categories]
  newCategory.value = ''
  showToast('已添加')
}

async function handleRemoveCategory(name) {
  const result = await showConfirmDialog({
    title: '删除分类',
    message: `确定删除 "${name}"？`
  })
  if (result) {
    settingsStore.removeCategory(name)
    categories.value = [...settingsStore.categories]
    showToast('已删除')
  }
}

function handleChangePassword() {
  passwordError.value = ''

  if (!settingsStore.verifyMasterPassword(oldPassword.value)) {
    passwordError.value = '当前密码错误'
    return
  }
  if (!newPassword.value || newPassword.value.length < 4) {
    passwordError.value = '新密码至少4位'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = '两次密码不一致'
    return
  }

  settingsStore.setMasterPassword(newPassword.value)
  passwordStore.setMasterPassword(newPassword.value)
  passwordStore.saveAll()

  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showChangePassword.value = false
  showToast('已修改')
}

async function handleClearData() {
  const result = await showConfirmDialog({
    title: '清除数据',
    message: '确定清除所有数据？此操作不可恢复。'
  })
  if (result) {
    settingsStore.clearData()
    passwordStore.items = []
    passwordStore.masterPassword = ''
    router.push('/')
    showToast('已清除')
  }
}
</script>

<style scoped>
.settings-page {
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

.settings-content {
  padding: 20px;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
}

.setting-item span {
  font-size: 15px;
  color: #1a1a1a;
}

.import-tip {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.setting-control span {
  color: #666;
  font-size: 14px;
}

.slider-container {
  padding: 8px 16px;
}

.slider {
  width: 100%;
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

.category-list {
  background: #f8f8f8;
  border-radius: 10px;
  padding: 12px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.category-item:last-of-type {
  border-bottom: none;
}

.category-item span {
  font-size: 15px;
  color: #1a1a1a;
}

.remove-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}

.add-category {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.category-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
}

.add-btn {
  padding: 10px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.clear-btn {
  width: 100%;
  height: 48px;
  background: #fff;
  color: #e53935;
  border: 1px solid #e53935;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 20px;
}

.modal-overlay {
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

.modal-content {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.export-options {
  margin-bottom: 16px;
}

.export-option {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.export-option:hover {
  background: #f0f0f0;
}

.export-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.export-info {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.export-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
}

.export-desc {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

.import-preview .import-count {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.preview-list {
  background: #f8f8f8;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.preview-item:last-of-type {
  border-bottom: none;
}

.preview-name {
  font-size: 14px;
  color: #1a1a1a;
}

.preview-user {
  font-size: 13px;
  color: #666;
}

.preview-more {
  font-size: 13px;
  color: #999;
  text-align: center;
  padding-top: 8px;
}

.btn-cancel-full {
  width: 100%;
  height: 48px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.input-group {
  margin-bottom: 16px;
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
}

.input:focus {
  outline: none;
  border-color: #1a1a1a;
}

.error {
  color: #e53935;
  font-size: 13px;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: #1a1a1a;
  color: #fff;
}

.about p {
  font-size: 14px;
  color: #666;
  line-height: 2;
  text-align: center;
}
</style>