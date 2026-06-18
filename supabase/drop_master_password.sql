-- ============================================
-- 修复 SQL 脚本：移除主密码字段
-- ============================================

-- 1. 删除 profiles 表中的 master_password_hash 字段
ALTER TABLE profiles DROP COLUMN IF EXISTS master_password_hash;

-- 2. 验证表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- ============================================
-- 如果上面的 ALTER TABLE 失败（字段不存在则忽略）
-- 现在的 profiles 表结构应该是：
-- id, email, created_at, updated_at
-- ============================================
