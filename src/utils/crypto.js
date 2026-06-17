import CryptoJS from 'crypto-js'

const SALT = 'password-manager-salt'
const ITERATIONS = 1000

export function generateKey(password) {
  const salt = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(SALT).toString())
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: ITERATIONS
  })
  return key
}

export function encrypt(text, password) {
  const key = generateKey(password)
  const iv = CryptoJS.lib.WordArray.random(128 / 8)
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return {
    ciphertext: encrypted.ciphertext.toString(),
    iv: iv.toString()
  }
}

export function decrypt(data, password) {
  const key = generateKey(password)
  const iv = CryptoJS.enc.Hex.parse(data.iv)
  const ciphertext = CryptoJS.enc.Hex.parse(data.ciphertext)
  const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export function hashPassword(password) {
  const salt = CryptoJS.SHA256(SALT).toString()
  const hash = CryptoJS.SHA256(password + salt).toString()
  return CryptoJS.SHA256(hash + password).toString()
}

export function generateSessionToken(password) {
  const timestamp = Date.now().toString()
  const token = CryptoJS.SHA256(password + timestamp + SALT).toString()
  return token
}

export function generatePassword(length = 16, options = {}) {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = options

  let charset = ''
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (numbers) charset += '0123456789'
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz'

  let password = ''
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}

export function checkPasswordStrength(password) {
  let score = 0

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 2) return { level: 'weak', text: '弱', color: '#ef4444' }
  if (score <= 4) return { level: 'medium', text: '中', color: '#f59e0b' }
  return { level: 'strong', text: '强', color: '#22c55e' }
}
