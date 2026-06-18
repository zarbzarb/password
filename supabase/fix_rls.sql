-- ============================================
-- 修复 RLS 策略脚本
-- 用于解决注册时 profiles 表的 409 Conflict 错误
-- ============================================

-- 1. 删除旧的 INSERT 策略（如果存在）
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;

-- 2. 创建新的 UPSERT 策略（使用 WITH CHECK 允许插入）
-- profiles 表：允许用户插入自己的记录
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. 修改更新策略为 UPSERT 模式
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. user_settings 表
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 验证策略
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_settings', 'passwords')
ORDER BY tablename, cmd;

-- ============================================
-- 如果还有问题，可以临时禁用 RLS 进行调试
-- （仅用于开发环境！）
-- ============================================
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE passwords DISABLE ROW LEVEL SECURITY;
