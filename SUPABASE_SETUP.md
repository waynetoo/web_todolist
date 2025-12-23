# Supabase集成指南

## 概述
本指南将帮助您将待办事项应用从localStorage迁移到Supabase，实现跨浏览器、跨设备的数据同步。

## 步骤1：创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com)
2. 点击 "Start your project" 或 "Sign Up"
3. 使用GitHub账号登录或注册新账号
4. 点击 "New Project"
5. 选择组织（或创建新组织）
6. 设置项目名称（例如：todo-app）
7. 设置数据库密码（请记住此密码）
8. 选择地区（选择离您最近的地区）
9. 点击 "Create new project"

## 步骤2：创建数据库表

### 方法1：使用SQL编辑器（推荐）

1. 项目创建完成后，进入仪表盘
2. 点击左侧菜单的 "SQL Editor"
3. 点击 "New query"
4. 复制并粘贴 `create_todos_table.sql` 文件中的SQL代码
5. 点击 "Run" 执行SQL脚本

### 方法2：使用表编辑器

1. 点击左侧菜单的 "Table Editor"
2. 点击 "Create a new table"
3. 设置表名为 "todos"
4. 添加以下列：
   - id: 类型为 `uuid`，默认值为 `uuid_generate_v4()`，设置为主键
   - text: 类型为 `text`
   - completed: 类型为 `boolean`，默认值为 `false`
   - priority: 类型为 `int2`，默认值为 `1`（1-低,2-中,3-高）
   - due_date: 类型为 `timestamptz`，可以为空
   - created_at: 类型为 `timestamptz`，默认值为 `now()`
   - user_id: 类型为 `text`，可以为空（用于区分用户）

## 步骤3：获取API密钥

1. 点击左侧菜单的 "Settings"
2. 选择 "API"
3. 复制以下信息：
   - Project URL（项目URL）
   - anon public key（匿名公开密钥）

## 步骤4：配置应用

1. 打开 `supabase-config.js` 文件
2. 将以下变量替换为您的项目信息：
   ```javascript
   const SUPABASE_CONFIG = {
       URL: 'YOUR_SUPABASE_URL',
       ANON_KEY: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```

## 步骤5：配置认证

1. 在左侧菜单中，点击 "Authentication"
2. 在 "Settings" 选项卡中，启用 "Enable email confirmations"（可选）
3. 在 "URL Configuration" 部分，设置：
   - Site URL: `http://localhost:8000`（开发环境）
   - Redirect URLs: 添加 `http://localhost:8000`（开发环境）

## 步骤6：启用实时功能

1. 在左侧菜单中，点击 "Replication"
2. 在 "Tables" 部分，点击 "Enable" 按钮
3. 选择 `todos` 表
4. 点击 "Save" 保存设置

## 步骤7：运行应用

1. 在项目根目录运行一个简单的HTTP服务器：
   ```
   python -m http.server 8000
   ```
2. 在浏览器中访问 `http://localhost:8000`

## 步骤8：测试应用

1. 注册新账户或登录
2. 在不同浏览器中打开应用
3. 添加、编辑、删除任务
4. 验证数据是否实时同步

## 注意事项

1. Supabase免费版有请求限制（500MB存储，2GB带宽）
2. 应用已内置用户认证系统，每个用户只能看到自己的待办事项
3. 数据变更会实时同步到所有登录的设备
4. 如果遇到"Could not find the table 'public.todos'"错误，请确保已正确创建数据库表

## 故障排除

1. **CORS错误**：在Supabase设置中添加您的域名到CORS允许列表
2. **数据不同步**：检查实时订阅是否正确设置，确认Supabase项目已启用实时功能
3. **API调用失败**：验证URL和密钥是否正确
4. **表不存在错误**：确保已按照步骤2创建数据库表，可以使用`create_table.html`页面辅助创建

## 高级功能

### 用户认证

应用已内置完整的用户认证功能：
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