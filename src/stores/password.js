import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPasswords, createPassword, updatePasswordEntry, deletePassword } from '@/utils/supabase'

export const usePasswordStore = defineStore('password', () => {
  const items = ref([])
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const userId = ref('')
  const loading = ref(false)

  const filteredItems = computed(() => {
    let result = items.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item =>
        (item.website || '').toLowerCase().includes(query) ||
        (item.username || '').toLowerCase().includes(query)
      )
    }

    if (selectedCategory.value) {
      result = result.filter(item => item.category === selectedCategory.value)
    }

    return result.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
  })

  const categories = computed(() => {
    const cats = new Set(items.value.map(item => item.category || '其他'))
    return Array.from(cats)
  })

  function setUserId(id) {
    userId.value = id
  }

  async function loadAll() {
    if (!userId.value) return
    
    loading.value = true
    try {
      const data = await getPasswords(userId.value)
      items.value = data || []
    } catch (error) {
      console.error('加载密码失败:', error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function addItem(item) {
    if (!userId.value) return null
    
    loading.value = true
    try {
      const newItem = await createPassword(userId.value, {
        website: item.website,
        url: item.url || '',
        username: item.username,
        password: item.password,
        category: item.category || '其他',
        notes: item.notes || ''
      })
      
      if (newItem) {
        items.value.unshift(newItem)
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
        const updatedItem = await updatePasswordEntry(id, {
          website: item.website,
          url: item.url || '',
          username: item.username,
          password: item.password,
          category: item.category || '其他',
          notes: item.notes || ''
        })
        
        if (updatedItem) {
          items.value[index] = updatedItem
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

  function clearAll() {
    items.value = []
    userId.value = ''
  }

  return {
    items,
    searchQuery,
    selectedCategory,
    userId,
    loading,
    filteredItems,
    categories,
    setUserId,
    loadAll,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    setSearchQuery,
    setSelectedCategory,
    clearSearch,
    clearAll
  }
})
