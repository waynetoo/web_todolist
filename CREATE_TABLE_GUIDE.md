# 创建todos表指南

## 问题描述

当前应用出现错误：
```
添加待办事项失败: {code: 23502, details: null, hint: null, message: null value in column "id" of relation "todos" violates not-null constraint}
```

## 原因分析

Supabase数据库表中的id字段没有设置默认值，而应用代码在插入数据时没有提供id值。

## 解决方案

您需要在Supabase项目中执行以下SQL脚本来创建todos表。

### 方法1：使用Supabase仪表盘

1. 登录到您的[Supabase仪表盘](https://app.supabase.com)
2. 选择您的项目
3. 在左侧菜单中点击 "SQL Editor"
4. 点击 "New query"
5. 复制并粘贴下面的SQL代码
6. 点击 "Run" 执行SQL脚本

### 方法2：使用Supabase CLI

如果您已经安装了Supabase CLI，可以运行以下命令：

```bash
# 连接到您的Supabase项目
supabase link --project-ref YOUR_PROJECT_REF

# 执行SQL脚本
supabase db push
```

## SQL脚本

```sql
-- 启用uuid-ossp扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS public.todos CASCADE;

-- 创建todos表
CREATE TABLE public.todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  priority INT2 DEFAULT 1,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT
);

-- 为表添加注释
COMMENT ON TABLE public.todos IS '待办事项表';

-- 为列添加注释
COMMENT ON COLUMN public.todos.id IS '待办事项唯一标识';
COMMENT ON COLUMN public.todos.text IS '待办事项内容';
COMMENT ON COLUMN public.todos.completed IS '是否已完成';
COMMENT ON COLUMN public.todos.priority IS '优先级：1-低,2-中,3-高';
COMMENT ON COLUMN public.todos.due_date IS '截止日期和时间';
COMMENT ON COLUMN public.todos.created_at IS '创建时间';
COMMENT ON COLUMN public.todos.user_id IS '用户ID';

-- 创建索引以提高查询性能
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
CREATE INDEX idx_todos_completed ON public.todos(completed);
CREATE INDEX idx_todos_created_at ON public.todos(created_at);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);

-- 启用行级安全策略
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 创建策略，允许用户只能访问自己的待办事项
CREATE POLICY "Users can view own todos" ON public.todos
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
  FOR DELETE USING (auth.uid()::text = user_id);
```

## 验证表是否创建成功

1. 在Supabase仪表盘中，点击左侧菜单的 "Table Editor"
2. 您应该能看到 "todos" 表出现在列表中
3. 点击表名，您可以看到表的结构

## 完成后

创建表后，刷新您的应用页面，错误应该会消失，您可以正常使用待办事项应用了。

## 注意事项

- 表已启用行级安全策略(RLS)，确保用户只能访问自己的待办事项
- 如果您不需要用户认证，可以暂时禁用RLS或修改策略
- 表结构包含所有必要的字段和索引，以支持应用的所有功能
- 使用了`due_date`字段而不是分开的`date`和`time`字段，以匹配应用代码中的实际使用
- 使用UUID作为id字段类型，INT2作为priority字段类型，以匹配应用代码中的实际使用