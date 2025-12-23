-- 启用uuid-ossp扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建todos表
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
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
COMMENT ON COLUMN public.todos.title IS '待办事项标题';
COMMENT ON COLUMN public.todos.description IS '待办事项详情描述';
COMMENT ON COLUMN public.todos.completed IS '是否已完成';
COMMENT ON COLUMN public.todos.priority IS '优先级：1-低,2-中,3-高';
COMMENT ON COLUMN public.todos.due_date IS '截止日期和时间';
COMMENT ON COLUMN public.todos.created_at IS '创建时间';
COMMENT ON COLUMN public.todos.user_id IS '用户ID';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);

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

-- 如果表已存在，添加新字段（用于现有表升级）
DO $$
BEGIN
    -- 检查表是否存在
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'todos') THEN
        -- 检查title字段是否存在，如果不存在则添加
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'todos' AND column_name = 'title') THEN
            -- 如果有text字段，重命名为title
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'todos' AND column_name = 'text') THEN
                ALTER TABLE public.todos RENAME COLUMN text TO title;
            ELSE
                -- 否则添加title字段
                ALTER TABLE public.todos ADD COLUMN title TEXT NOT NULL DEFAULT '';
            END IF;
        END IF;
        
        -- 检查description字段是否存在，如果不存在则添加
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'todos' AND column_name = 'description') THEN
            ALTER TABLE public.todos ADD COLUMN description TEXT;
        END IF;
    END IF;
END $$;