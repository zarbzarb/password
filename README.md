# Password Manager

一个基于 Vue 3 的密码管理器，采用白色极简风格设计，使用 Supabase 云数据库存储数据，支持多设备同步访问。

## 功能特性

### 核心功能
- **云端存储**：使用 Supabase PostgreSQL 数据库，数据安全存储在云端
- **账号密码登录**：支持邮箱注册和登录，多设备同步
- **密码加密**：使用 AES-256 加密算法保护您的密码数据
- **主密码验证**：通过 SHA-256 双重哈希验证主密码，确保安全
- **分类管理**：支持按类别（社交、工作、金融、购物、学习、开发、其他）管理密码
- **搜索过滤**：快速搜索和过滤密码条目
- **自动锁定**：支持自动锁定功能，保护隐私
- **多设备同步**：数据存储在云端，支持多设备访问

### 数据导入/导出
- **多格式导出**：支持导出为 JSON、Markdown、TXT、CSV 格式
- **明文导出**：可直接导出明文密码，方便查看和使用
- **数据导入**：支持导入 JSON 格式的密码数据
- **Edge 密码导入**：支持将 Microsoft Edge 浏览器导出的 CSV 密码文件转换为系统可导入的格式

### 用户体验
- **白色极简风格**：简洁美观的界面设计
- **网址前缀补全**：添加密码时自动补全网站前缀（https、http、mailto 等）
- **会话保持**：刷新页面后保持登录状态，无需重新输入主密码
- **响应式设计**：适配桌面和移动设备

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **UI 组件库**：Vant 4
- **状态管理**：Pinia
- **路由管理**：Vue Router（Hash 模式）
- **云数据库**：Supabase（PostgreSQL）
- **用户认证**：Supabase Auth
- **数据安全**：Row Level Security（行级安全策略）
- **加密技术**：AES-256 + SHA-256

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Supabase 账号（免费）

### 安装依赖

```bash
npm install
```

### 配置 Supabase

1. 访问 [Supabase](https://supabase.com/) 创建账号
2. 创建新项目
3. 在项目设置中获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
4. 创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 数据库初始化

在 Supabase SQL 编辑器中执行 `supabase/init.sql` 文件的内容，创建数据库表和安全策略。

详细部署步骤请查看 [Supabase 部署指南](docs/SUPABASE_DEPLOY.md)

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 使用说明

### 首次使用

1. 打开应用后，点击"注册"标签
2. 输入邮箱账号和账号密码（用于云端登录）
3. 设置主密码（用于加密/解密密码数据）
4. 注册成功后自动跳转到首页

### 登录使用

1. 输入邮箱账号
2. 输入账号密码（Supabase 登录密码）
3. 输入主密码（解密密码数据）
4. 登录成功后查看密码列表

### 添加密码

1. 点击页面底部的 "+" 按钮
2. 填写网站名称、网址、用户名、密码等信息
3. 选择分类，添加备注（可选）
4. 点击保存，数据自动同步到云端

### 导入密码

1. 点击页面右上角的设置图标
2. 选择 "导入数据"
3. 选择准备好的 JSON 文件

### 导出密码

1. 点击页面右上角的设置图标
2. 选择 "导出数据"
3. 选择导出格式（JSON/Markdown/TXT/CSV）

## 安全说明

- 所有密码数据使用 AES-256 加密后存储在 Supabase 云数据库中
- 主密码使用 SHA-256 哈希验证，不存储明文
- 使用 Supabase Row Level Security 实现用户级数据隔离
- 数据传输使用 HTTPS 加密
- 建议定期导出数据备份
- 请妥善保管您的主密码，丢失后无法找回

## 项目结构

```
password-manager/
├── docs/
│   └── SUPABASE_DEPLOY.md    # Supabase 部署指南
├── supabase/
│   └── init.sql              # 数据库初始化 SQL
├── src/
│   ├── router/
│   │   └── index.js          # 路由配置
│   ├── stores/
│   │   ├── password.js       # 密码数据管理
│   │   └── settings.js       # 系统设置管理
│   ├── utils/
│   │   ├── crypto.js         # 加密解密工具
│   │   ├── storage.js        # 本地存储工具
│   │   └ supabase.js         # Supabase SDK 配置
│   ├── views/
│   │   ├── Detail.vue        # 详情页面
│   │   ├── Edit.vue          # 添加/编辑页面
│   │   ├── Generator.vue     # 密码生成器
│   │   ├── Home.vue          # 首页
│   │   ├── Login.vue         # 登录页面
│   │   └── Settings.vue      # 设置页面
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── .env.example              # 环境变量示例
├── package.json
├── vite.config.js
└ README.md
```

## 数据库表结构

### profiles（用户配置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户ID |
| email | TEXT | 用户邮箱 |
| master_password_hash | TEXT | 主密码哈希值 |

### passwords（密码条目表）

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

### user_settings（用户设置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 设置ID |
| user_id | UUID | 所属用户ID |
| categories | TEXT[] | 分类列表 |
| auto_lock_time | INTEGER | 自动锁定时间 |

## 部署

推荐使用 Vercel 部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 配置环境变量
# 在 Vercel 项目设置中添加 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
```

## 许可证

MIT License