# Supabase 部署指南

本指南将帮助您完成密码管理器的 Supabase 云数据库配置和部署。

---

## 第一步：创建 Supabase 项目

### 1. 注册 Supabase 账号

1. 访问 [Supabase 官网](https://supabase.com/)
2. 点击 "Start your project" 或 "Sign Up"
3. 使用 GitHub 账号或邮箱注册

### 2. 创建新项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Name**: `password-manager`（或您喜欢的名称）
   - **Database Password**: 设置一个强密码（请记住，用于数据库管理）
   - **Region**: 选择离您最近的区域（如 `East Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
3. 点击 "Create new project"
4. 等待项目创建完成（约 2-3 分钟）

---

## 第二步：配置数据库

### 1. 获取 API 密钥

1. 进入项目后，点击左侧菜单的 **Settings**（齿轮图标）
2. 点击 **API** 选项
3. 复制以下两个值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: 一个很长的 JWT 字符串

### 2. 执行数据库初始化 SQL

1. 点击左侧菜单的 **SQL Editor**
2. 点击 "New query"
3. 复制 `supabase/init.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行 SQL

执行成功后，您应该能看到：
- 3 个表已创建：`profiles`, `passwords`, `user_settings`
- 行级安全策略已启用
- 触发器已创建

### 3. 验证表结构

点击左侧菜单的 **Table Editor**，确认以下表已创建：

| 表名 | 说明 |
|------|------|
| profiles | 用户配置表（存储主密码哈希） |
| passwords | 密码条目表 |
| user_settings | 用户设置表 |

---

## 第三步：配置认证

### 1. 启用 Email 认证

Supabase 默认已启用 Email 认证，无需额外配置。

### 2. 配置邮件模板（可选）

1. 点击 **Settings** > **Authentication**
2. 在 **Email Templates** 部分，可以自定义：
   - 确认邮件模板
   - 重置密码模板
   - 邀请邮件模板

### 3. 关闭邮箱确认（开发环境推荐）

为了开发方便，可以暂时关闭邮箱确认：

1. 点击 **Settings** > **Authentication**
2. 找到 **Email** 部分
3. 关闭 "Enable email confirmations"（仅开发环境）

**注意**: 生产环境建议开启邮箱确认！

---

## 第四步：配置前端项目

### 1. 安装依赖

```bash
npm install @supabase/supabase-js
```

### 2. 创建环境配置文件

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**重要**: 
- `.env` 文件不要提交到 GitHub（已在 `.gitignore` 中排除）
- 使用 `.env.example` 作为模板

### 3. 运行项目

```bash
npm run dev
```

---

## 第五步：部署前端

### 方案一：部署到 Vercel（推荐）

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 部署项目：
   ```bash
   vercel
   ```

3. 配置环境变量：
   - 在 Vercel 项目设置中添加环境变量
   - `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

### 方案二：部署到 Netlify

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录上传到 Netlify

3. 配置环境变量（在 Netlify 项目设置中）

---

## 第六步：安全配置

### 1. 配置允许的域名

1. 点击 **Settings** > **Authentication**
2. 在 **URL Configuration** 部分：
   - **Site URL**: 您的生产环境 URL（如 `https://your-app.vercel.app`）
   - **Redirect URLs**: 添加允许的回调 URL

### 2. 行级安全策略验证

在 SQL Editor 中运行以下查询验证 RLS：

```sql
-- 查看表的 RLS 状态
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 查看策略
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## 常见问题

### Q1: 注册时提示 "User already registered"

说明该邮箱已被注册，请直接登录或使用其他邮箱。

### Q2: 登录后无法获取数据

检查：
1. RLS 策略是否正确配置
2. 用户是否在 `profiles` 和 `user_settings` 表中有记录
3. `user_id` 是否匹配 `auth.uid()`

### Q3: 如何重置用户密码

在 Supabase Dashboard 中：
1. 点击 **Authentication** > **Users**
2. 找到用户，点击 "Send password reset email"

### Q4: 如何查看数据库数据

点击 **Table Editor**，选择相应的表即可查看和编辑数据。

---

## 数据库表结构说明

### profiles 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户ID（关联 auth.users） |
| email | TEXT | 用户邮箱 |
| master_password_hash | TEXT | 主密码哈希值 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### passwords 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 密码条目ID |
| user_id | UUID | 所属用户ID |
| website | TEXT | 网站名称 |
| url | TEXT | 网站地址 |
| username | TEXT | 用户名 |
| password | TEXT | 加密后的密码 |
| category | TEXT | 分类 |
| notes | TEXT | 备注 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### user_settings 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 设置ID |
| user_id | UUID | 所属用户ID |
| categories | TEXT[] | 分类列表 |
| auto_lock_time | INTEGER | 自动锁定时间（分钟） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

## 安全建议

1. **生产环境必须开启邮箱确认**
2. **定期备份数据**（使用导出功能）
3. **主密码不要存储在云端**，仅在本地验证
4. **所有密码数据在前端加密后再上传**
5. **使用 HTTPS** 确保传输安全
6. **定期检查 RLS 策略**确保数据隔离

---

## 费用说明

Supabase 免费套餐包含：
- 500MB 数据库存储
- 5GB 带宽
- 50,000 月活用户

对于个人密码管理器使用完全足够！