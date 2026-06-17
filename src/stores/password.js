import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { encrypt, decrypt } from '@/utils/crypto'
import { savePasswords, loadPasswords } from '@/utils/storage'

export const usePasswordStore = defineStore('password', () => {
  const items = ref([])
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const masterPassword = ref('')

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

    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  })

  const categories = computed(() => {
    const cats = new Set(items.value.map(item => item.category))
    return Array.from(cats)
  })

  function setMasterPassword(password) {
    masterPassword.value = password
  }

  function loadAll() {
    const stored = loadPasswords()
    if (stored && masterPassword.value) {
      try {
        const decrypted = decrypt(stored, masterPassword.value)
        items.value = JSON.parse(decrypted)
      } catch {
        items.value = []
      }
    }
  }

  function saveAll() {
    if (masterPassword.value && items.value.length > 0) {
      const encrypted = encrypt(JSON.stringify(items.value), masterPassword.value)
      savePasswords(encrypted)
    } else if (items.value.length === 0) {
      savePasswords(null)
    }
  }

  function addItem(item) {
    const newItem = {
      id: Date.now().toString(),
      website: item.website,
      url: item.url || '',
      username: item.username,
      password: item.password,
      category: item.category || '其他',
      notes: item.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    items.value.unshift(newItem)
    saveAll()
    return newItem
  }

  function updateItem(id, item) {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      items.value[index] = {
        ...items.value[index],
        ...item,
        updatedAt: new Date().toISOString()
      }
      saveAll()
    }
  }

  function deleteItem(id) {
    items.value = items.value.filter(i => i.id !== id)
    saveAll()
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
    filteredItems,
    categories,
    setMasterPassword,
    loadAll,
    saveAll,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    setSearchQuery,
    setSelectedCategory,
    clearSearch
  }
})
