import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 配置缺失，请检查 .env 文件')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// 用户认证相关
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// 用户配置相关
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createProfile(userId, email, masterPasswordHash) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      master_password_hash: masterPasswordHash
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// 密码条目相关
export async function getPasswords(userId) {
  const { data, error } = await supabase
    .from('passwords')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getPassword(id) {
  const { data, error } = await supabase
    .from('passwords')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createPassword(userId, passwordData) {
  const { data, error } = await supabase
    .from('passwords')
    .insert({
      user_id: userId,
      website: passwordData.website,
      url: passwordData.url || '',
      username: passwordData.username,
      password: passwordData.password,
      category: passwordData.category || '其他',
      notes: passwordData.notes || ''
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePassword(id, updates) {
  const { data, error } = await supabase
    .from('passwords')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePassword(id) {
  const { error } = await supabase
    .from('passwords')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// 用户设置相关
export async function getSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateSettings(userId, updates) {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .insert({ user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}