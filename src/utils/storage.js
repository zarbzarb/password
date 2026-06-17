const PASSWORD_KEY = 'password_manager_data'
const SETTINGS_KEY = 'password_manager_settings'

export function savePasswords(data) {
  try {
    localStorage.setItem(PASSWORD_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to save passwords:', error)
    return false
  }
}

export function loadPasswords() {
  try {
    const data = localStorage.getItem(PASSWORD_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load passwords:', error)
    return null
  }
}

export function saveSettings(data) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to save settings:', error)
    return false
  }
}

export function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load settings:', error)
    return null
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(PASSWORD_KEY)
    localStorage.removeItem(SETTINGS_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear data:', error)
    return false
  }
}

export function exportData() {
  const passwords = loadPasswords()
  const settings = loadSettings()
  return { passwords, settings }
}

export function importData(data) {
  if (data.passwords) savePasswords(data.passwords)
  if (data.settings) saveSettings(data.settings)
  return true
}
