// Supabase配置文件
// 请替换以下变量为您的Supabase项目信息

const SUPABASE_CONFIG = {
    // 您的Supabase项目URL
    // 在Supabase仪表盘 > Settings > API 中找到
    URL: 'https://kxygsiuviumujciptvme.supabase.co',
    
    // 您的Supabase匿名公开密钥
    // 在Supabase仪表盘 > Settings > API 中找到
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eWdzaXV2aXVtdWpjaXB0dm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODU1MTEsImV4cCI6MjA4MTk2MTUxMX0.EwZiItTcL7avt0hVLjiWUF0Ni-hftNjdu19Y1S84-zU'
};

// 数据库表结构
const DB_SCHEMA = {
    // 表名
    TABLE_NAME: 'todos',
    
    // 表字段
    FIELDS: {
        ID: 'id',
        TEXT: 'text',
        COMPLETED: 'completed',
        PRIORITY: 'priority',
        DATE: 'date',
        TIME: 'time',
        CREATED_AT: 'created_at',
        USER_ID: 'user_id'
    }
};

// 初始化Supabase客户端
function initSupabase() {
    // 检查Supabase是否已加载
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase库未加载，请检查script标签');
        // 尝试等待一段时间再检查
        setTimeout(() => {
            if (typeof window.supabase === 'undefined') {
                console.error('Supabase库仍未加载');
                // 显示错误消息给用户
                const dbError = document.getElementById('db-error');
                if (dbError) {
                    dbError.style.display = 'block';
                    const errorMsg = dbError.querySelector('p');
                    if (errorMsg) {
                        errorMsg.textContent = '无法加载Supabase库，请检查网络连接或刷新页面重试。';
                    }
                }
            }
        }, 2000);
        return null;
    }
    
    // 检查配置是否有效
    if (!SUPABASE_CONFIG.URL || SUPABASE_CONFIG.URL === 'https://your-project-id.supabase.co') {
        console.warn('Supabase配置未完成，请配置有效的URL和API密钥');
        return null;
    }
    
    try {
        // 创建全局supabase变量，避免重复声明
        if (typeof window.globalSupabase === 'undefined') {
            window.globalSupabase = window.supabase.createClient(
                SUPABASE_CONFIG.URL,
                SUPABASE_CONFIG.ANON_KEY
            );
        }
        return window.globalSupabase;
    } catch (error) {
        console.error('创建Supabase客户端失败:', error);
        return null;
    }
}

// 导出配置（如果使用模块系统）
// export { SUPABASE_CONFIG, DB_SCHEMA, initSupabase };