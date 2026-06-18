import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser,
  getSession,
  updatePassword as updateAuthPassword,
  ensureProfile,
  getSettings,
  updateSettings
} from '@/utils/supabase'

const SESSION_KEY = 'password_manager_session'

export const useSettingsStore = defineStore('settings', () => {
  const categories = ref(['社交', '工作', '金融', '购物', '学习', '开发', '其他'])
  const autoLockTime = ref(5)
  const isLoggedIn = ref(false)
  const user = ref(null)
  const loading = ref(false)

  async function register(email, password) {
    loading.value = true
    try {
      const data = await signUp(email, password)
      if (data.user) {
        user.value = data.user
        await ensureProfile(data.user.id, email)
        isLoggedIn.value = true
        saveSession()
        return { success: true, user: data.user }
      }
      return { success: false, error: '注册失败' }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    loading.value = true
    try {
      const data = await signIn(email, password)
      if (data.user) {
        user.value = data.user
        
        await ensureProfile(data.user.id, email)
        
        const settings = await getSettings(data.user.id)
        if (settings) {
          categories.value = settings.categories || categories.value
          autoLockTime.value = settings.auto_lock_time || 5
        }
        
        isLoggedIn.value = true
        saveSession()
        return { success: true, user: data.user }
      }
      return { success: false, error: '登录失败' }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function checkSession() {
    try {
      const session = await getSession()
      if (session) {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          user.value = currentUser
          
          const settings = await getSettings(currentUser.id)
          if (settings) {
            categories.value = settings.categories || categories.value
            autoLockTime.value = settings.auto_lock_time || 5
          }
          
          const localSession = getSession_()
          if (localSession) {
            isLoggedIn.value = true
            return { hasSession: true, user: currentUser }
          }
        }
      }
      return { hasSession: false }
    } catch (error) {
      console.warn('检查会话失败:', error)
      return { hasSession: false }
    }
  }

  async function logout() {
    try {
      await signOut()
      user.value = null
      isLoggedIn.value = false
      clearSession()
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  async function changePassword(currentPassword, newPassword) {
    loading.value = true
    try {
      const { error: signInError } = await signIn(user.value.email, currentPassword)
      if (signInError) {
        return { success: false, error: '当前密码错误' }
      }
      
      await updateAuthPassword(newPassword)
      return { success: true }
    } catch (error) {
      console.error('修改密码失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  function saveSession() {
    const session = {
      timestamp: Date.now()
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  function getSession_() {
    try {
      const session = sessionStorage.getItem(SESSION_KEY)
      if (session) {
        const data = JSON.parse(session)
        const age = Date.now() - data.timestamp
        const maxAge = autoLockTime.value * 60 * 1000
        if (age < maxAge) {
          return data
        } else {
          clearSession()
        }
      }
    } catch {
      return null
    }
    return null
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY)
  }

  async function addCategory(name) {
    if (!categories.value.includes(name)) {
      categories.value.push(name)
      await saveSettings()
    }
  }

  async function removeCategory(name) {
    categories.value = categories.value.filter(c => c !== name)
    await saveSettings()
  }

  async function setAutoLockTime(time) {
    autoLockTime.value = time
    await saveSettings()
  }

  async function saveSettings() {
    if (user.value) {
      try {
        await updateSettings(user.value.id, {
          categories: categories.value,
          auto_lock_time: autoLockTime.value
        })
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    }
  }

  function exportDataFile(format = 'json', passwordItems = []) {
    const date = new Date().toISOString().split('T')[0]
    const data = {
      passwords: passwordItems,
      settings: {
        categories: categories.value,
        autoLockTime: autoLockTime.value
      }
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      downloadBlob(blob, `密码备份-${date}.json`)
    } else if (format === 'txt') {
      const content = generateTxt(passwordItems)
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      downloadBlob(blob, `密码备份-${date}.txt`)
    } else if (format === 'md') {
      const content = generateMarkdown(passwordItems)
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      downloadBlob(blob, `密码备份-${date}.md`)
    } else if (format === 'csv') {
      const content = generateCsv(passwordItems)
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
      downloadBlob(blob, `密码备份-${date}.csv`)
    }
  }

  function generateTxt(items) {
    let content = '密码备份（明文）\n'
    content += '==================\n'
    content += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`
    content += `共 ${items.length} 条记录\n\n`

    items.forEach((item, index) => {
      content += `${index + 1}. ${item.website}\n`
      content += `   账号: ${item.username}\n`
      content += `   密码: ${item.password}\n`
      if (item.url) content += `   网址: ${item.url}\n`
      if (item.category) content += `   分类: ${item.category}\n`
      if (item.notes) content += `   备注: ${item.notes}\n`
      content += '\n'
    })
    return content
  }

  function generateMarkdown(items) {
    let content = '# 密码备份（明文）\n\n'
    content += `> 导出时间: ${new Date().toLocaleString('zh-CN')}\n`
    content += `> 共 ${items.length} 条记录\n\n`

    items.forEach(item => {
      content += `## ${item.website}\n\n`
      content += `- **账号**: ${item.username}\n`
      content += `- **密码**: \`${item.password}\`\n`
      if (item.url) content += `- **网址**: ${item.url}\n`
      if (item.category) content += `- **分类**: ${item.category}\n`
      if (item.notes) content += `- **备注**: ${item.notes}\n`
      content += '\n'
    })

    content += '\n---\n'
    content += '*由密码管理器导出*\n'
    return content
  }

  function generateCsv(items) {
    let content = '\uFEFF'
    content += '网站,账号,密码,网址,分类,备注,创建时间\n'

    items.forEach(item => {
      const row = [
        escapeCsv(item.website),
        escapeCsv(item.username),
        escapeCsv(item.password),
        escapeCsv(item.url || ''),
        escapeCsv(item.category || ''),
        escapeCsv(item.notes || ''),
        escapeCsv(item.created_at || '')
      ]
      content += row.join(',') + '\n'
    })
    return content
  }

  function escapeCsv(str) {
    if (!str) return ''
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importDataFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target.result

          if (file.name.endsWith('.json')) {
            const data = JSON.parse(text)
            resolve({ type: 'json', data })
          } else if (file.name.endsWith('.csv')) {
            const items = parseCsv(text)
            resolve({ type: 'csv', items })
          } else {
            reject(new Error('不支持的文件格式'))
          }
        } catch (error) {
          reject(new Error('导入文件格式错误: ' + error.message))
        }
      }
      reader.onerror = () => reject(new Error('读取文件失败'))
      reader.readAsText(file)
    })
  }

  function parseCsv(text) {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    const items = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i])
      if (values.length < 4) continue

      const item = {
        id: Date.now().toString() + i,
        website: getValue(header, values, 'name') || values[0] || '',
        url: getValue(header, values, 'url') || values[1] || '',
        username: getValue(header, values, 'username') || values[2] || '',
        password: getValue(header, values, 'password') || values[3] || '',
        category: '导入',
        notes: getValue(header, values, 'note') || values[4] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      items.push(item)
    }

    return items
  }

  function getValue(header, values, key) {
    const index = header.indexOf(key)
    if (index >= 0 && index < values.length) {
      return values[index]
    }
    return ''
  }

  function parseCsvLine(line) {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  return {
    categories,
    autoLockTime,
    isLoggedIn,
    user,
    loading,
    register,
    login,
    checkSession,
    logout,
    saveSession,
    clearSession,
    addCategory,
    removeCategory,
    setAutoLockTime,
    saveSettings,
    changePassword,
    exportDataFile,
    importDataFile
  }
})
