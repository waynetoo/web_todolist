# Supabase集成指南

## 概述

本指南将帮助您将待办事项应用从localStorage迁移到Supabase，实现跨设备和浏览器的数据同步。

## 步骤1：创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com)
2. 点击 "Start your project" 或 "Sign Up" 创建账户
3. 登录后，点击 "New Project"
4. 选择您的组织（或创建新组织）
5. 输入项目名称（例如：todo-app）
6. 设置数据库密码（请记住此密码）
7. 选择区域（选择离您最近的区域）
8. 点击 "Create new project"

## 步骤2：创建数据库表

### 方法1：使用SQL编辑器（推荐）

1. 项目创建完成后，进入仪表盘
2. 在左侧菜单中，点击 "SQL Editor"
3. 点击 "New query"
4. 复制并粘贴 `create_todos_table.sql` 文件中的SQL代码
5. 点击 "Run" 执行SQL脚本

### 方法2：使用表编辑器

1. 在左侧菜单中，点击 "Table Editor"
2. 点击 "Create a new table"
3. 输入表名：`todos`
4. 添加以下列：

| 列名 | 类型 | 默认值 | 是否可空 | 说明 |
|------|------|--------|----------|------|
| id | uuid | uuid_generate_v4() | 否 | 主键 |
| text | text | - | 否 | 待办事项内容 |
| completed | boolean | false | 否 | 是否完成 |
| priority | int2 | 1 | 否 | 优先级(1-低,2-中,3-高) |
| due_date | timestamptz | - | 是 | 截止日期和时间 |
| created_at | timestamptz | now() | 否 | 创建时间 |
| user_id | text | - | 是 | 用户ID（用于多用户） |

5. 点击 "Save" 保存表

## 步骤3：获取API密钥

1. 在左侧菜单中，点击 "Settings"
2. 选择 "API" 选项卡
3. 复制以下信息：
   - Project URL（项目URL）
   - anon public（匿名公开密钥）

## 步骤4：配置应用

1. 打开 `supabase-config.js` 文件
2. 将 `YOUR_SUPABASE_URL` 替换为您的项目URL
3. 将 `YOUR_SUPABASE_ANON_KEY` 替换为您的匿名公开密钥

## 步骤5：启用实时功能

1. 在左侧菜单中，点击 "Replication"
2. 在 "Tables" 部分，点击 "Enable" 按钮
3. 选择 `todos` 表
4. 点击 "Save" 保存设置

## 步骤6：配置认证

1. 在左侧菜单中，点击 "Authentication"
2. 在 "Settings" 选项卡中，启用 "Enable email confirmations"（可选）
3. 在 "URL Configuration" 部分，设置：
   - Site URL: `http://localhost:8000`（开发环境）
   - Redirect URLs: 添加 `http://localhost:8000`（开发环境）

## 步骤7：测试应用

1. 在浏览器中打开 `index.html`
2. 注册新账户或登录
3. 添加一些待办事项
4. 在不同浏览器或设备上打开应用
5. 验证数据是否同步

## 故障排除

### 数据库表不存在错误

**错误信息：** `Could not find the table 'public.todos' in the schema cache`

**解决方案：** 这表示Supabase数据库中还没有创建todos表。请按照"步骤2：创建数据库表"部分的说明创建表。

### 数据不同步
- 检查Supabase配置是否正确
- 确认实时功能已启用
- 检查浏览器控制台是否有错误信息

### 连接错误
- 验证API密钥是否正确
- 检查网络连接
- 确认Supabase项目状态为"Active"

### 权限问题
- 确保表的RLS（行级安全）策略允许匿名访问
- 在左侧菜单中，点击 "Authentication" > "Policies"
- 为 `todos` 表添加允许匿名访问的策略

## 高级功能

### 用户认证

应用已内置用户认证功能，包括：
- 用户注册
- 用户登录
- 密码重置
- 用户登出

### 数据隔离

每个用户只能看到自己的待办事项，通过user_id字段实现数据隔离。

### 实时同步

数据变更会实时同步到所有登录的设备，包括：
- 添加新待办事项
- 修改待办事项
- 标记完成状态
- 删除待办事项

## 资源链接

- [Supabase文档](https://supabase.com/docs)
- [JavaScript客户端文档](https://supabase.com/docs/reference/javascript)
- [实时功能文档](https://supabase.com/docs/guides/realtime)
- [认证文档](https://supabase.com/docs/guides/auth)