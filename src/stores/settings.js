import { defineStore } from 'pinia'
import { ref } from 'vue'
import { hashPassword, generateSessionToken } from '@/utils/crypto'
import { saveSettings, loadSettings, clearAllData, savePasswords, loadPasswords } from '@/utils/storage'

const SESSION_KEY = 'password_manager_session'

export const useSettingsStore = defineStore('settings', () => {
  const masterPasswordHash = ref('')
  const categories = ref(['社交', '工作', '金融', '购物'])
  const autoLockTime = ref(5)
  const isLoggedIn = ref(false)

  function load() {
    const stored = loadSettings()
    if (stored) {
      masterPasswordHash.value = stored.masterPasswordHash || ''
      categories.value = stored.categories || ['社交', '工作', '金融', '购物']
      autoLockTime.value = stored.autoLockTime || 5
    }
  }

  function save() {
    saveSettings({
      masterPasswordHash: masterPasswordHash.value,
      categories: categories.value,
      autoLockTime: autoLockTime.value
    })
  }

  function setMasterPassword(password) {
    masterPasswordHash.value = hashPassword(password)
    isLoggedIn.value = true
    save()
    saveSession(password)
  }

  function verifyMasterPassword(password) {
    return hashPassword(password) === masterPasswordHash.value
  }

  function hasMasterPassword() {
    return !!masterPasswordHash.value
  }

  function saveSession(password) {
    const session = {
      token: generateSessionToken(password),
      timestamp: Date.now()
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  function getSession() {
    try {
      const session = sessionStorage.getItem(SESSION_KEY)
      if (session) {
        const data = JSON.parse(session)
        const age = Date.now() - data.timestamp
        const maxAge = autoLockTime.value * 60 * 1000
        if (age < maxAge) {
          return data
        }
      }
    } catch (e) {
      return null
    }
    return null
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY)
  }

  function logout() {
    isLoggedIn.value = false
    clearSession()
  }

  function addCategory(name) {
    if (!categories.value.includes(name)) {
      categories.value.push(name)
      save()
    }
  }

  function removeCategory(name) {
    categories.value = categories.value.filter(c => c !== name)
    save()
  }

  function setAutoLockTime(time) {
    autoLockTime.value = time
    save()
  }

  function clearData() {
    clearAllData()
    clearSession()
    masterPasswordHash.value = ''
    categories.value = ['社交', '工作', '金融', '购物']
    autoLockTime.value = 5
    isLoggedIn.value = false
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
        escapeCsv(item.createdAt || '')
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

  async function importDataFile(file, masterPassword) {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
    masterPasswordHash,
    categories,
    autoLockTime,
    isLoggedIn,
    load,
    save,
    setMasterPassword,
    verifyMasterPassword,
    hasMasterPassword,
    saveSession,
    getSession,
    clearSession,
    logout,
    addCategory,
    removeCategory,
    setAutoLockTime,
    clearData,
    exportDataFile,
    importDataFile
  }
})