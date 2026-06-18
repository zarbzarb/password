import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { encrypt, decrypt } from '@/utils/crypto'
import { getPasswords, createPassword, updatePassword, deletePassword, getPassword } from '@/utils/supabase'

export const usePasswordStore = defineStore('password', () => {
  const items = ref([])
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const masterPassword = ref('')
  const userId = ref('')
  const loading = ref(false)

  const filteredItems = computed(() => {
    let result = items.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item =>
        item.website.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query)
      )
    }

    if (selectedCategory.value) {
      result = result.filter(item => item.category === selectedCategory.value)
    }

    return result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  })

  const categories = computed(() => {
    const cats = new Set(items.value.map(item => item.category))
    return Array.from(cats)
  })

  function setMasterPassword(password) {
    masterPassword.value = password
  }

  function setUserId(id) {
    userId.value = id
  }

  async function loadAll() {
    if (!userId.value) return
    
    loading.value = true
    try {
      const data = await getPasswords(userId.value)
      if (data && masterPassword.value) {
        // 解密所有密码
        items.value = data.map(item => ({
          ...item,
          password: decryptPassword(item.password, masterPassword.value)
        }))
      } else {
        items.value = data || []
      }
    } catch (error) {
      console.error('加载密码失败:', error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  function decryptPassword(encryptedPassword, password) {
    try {
      // 如果密码已经是加密格式（对象），则解密
      if (typeof encryptedPassword === 'object' && encryptedPassword.ciphertext) {
        return decrypt(encryptedPassword, password)
      }
      // 如果是字符串，尝试解析后解密
      if (typeof encryptedPassword === 'string') {
        try {
          const parsed = JSON.parse(encryptedPassword)
          if (parsed.ciphertext) {
            return decrypt(parsed, password)
          }
        } catch {
          // 如果不是JSON，可能是明文（旧数据）
          return encryptedPassword
        }
      }
      return encryptedPassword
    } catch {
      return ''
    }
  }

  async function addItem(item) {
    if (!userId.value) return null
    
    loading.value = true
    try {
      // 加密密码
      const encryptedPassword = encrypt(item.password, masterPassword.value)
      
      const newItem = await createPassword(userId.value, {
        website: item.website,
        url: item.url || '',
        username: item.username,
        password: JSON.stringify(encryptedPassword),
        category: item.category || '其他',
        notes: item.notes || ''
      })
      
      if (newItem) {
        items.value.unshift({
          ...newItem,
          password: item.password // 本地保存明文用于显示
        })
      }
      return newItem
    } catch (error) {
      console.error('添加密码失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id, item) {
    if (!userId.value) return
    
    loading.value = true
    try {
      const index = items.value.findIndex(i => i.id === id)
      if (index !== -1) {
        // 加密密码
        const encryptedPassword = encrypt(item.password, masterPassword.value)
        
        const updatedItem = await updatePassword(id, {
          website: item.website,
          url: item.url || '',
          username: item.username,
          password: JSON.stringify(encryptedPassword),
          category: item.category || '其他',
          notes: item.notes || ''
        })
        
        if (updatedItem) {
          items.value[index] = {
            ...updatedItem,
            password: item.password // 本地保存明文用于显示
          }
        }
      }
    } catch (error) {
      console.error('更新密码失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteItem(id) {
    if (!userId.value) return
    
    loading.value = true
    try {
      await deletePassword(id)
      items.value = items.value.filter(i => i.id !== id)
    } catch (error) {
      console.error('删除密码失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function getItem(id) {
    return items.value.find(i => i.id === id)
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function setSelectedCategory(category) {
    selectedCategory.value = category
  }

  function clearSearch() {
    searchQuery.value = ''
    selectedCategory.value = ''
  }

  return {
    items,
    searchQuery,
    selectedCategory,
    masterPassword,
    userId,
    loading,
    filteredItems,
    categories,
    setMasterPassword,
    setUserId,
    loadAll,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    setSearchQuery,
    setSelectedCategory,
    clearSearch
  }
})