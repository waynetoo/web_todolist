// 初始化Supabase客户端
let currentUser = null;
let todos = [];

// DOM元素
const authModal = document.getElementById('auth-modal');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authMessage = document.getElementById('auth-message');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const mainContent = document.getElementById('main-content');
const todoForm = document.getElementById('todo-form');
const todoTitle = document.getElementById('todo-title');
const todoDescription = document.getElementById('todo-description');
const todoDate = document.getElementById('todo-date');
const todoTime = document.getElementById('todo-time');
const todoPriority = document.getElementById('todo-priority');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const clearCompletedBtn = document.getElementById('clear-completed');
const totalCount = document.getElementById('total-count');
const activeCount = document.getElementById('active-count');
const completedCount = document.getElementById('completed-count');

// 详情折叠相关元素
const toggleDescriptionBtn = document.getElementById('toggle-description');
const descriptionContainer = document.getElementById('description-container');

// 编辑模态框相关元素
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTitle = document.getElementById('edit-title');
const editDescription = document.getElementById('edit-description');
const editDate = document.getElementById('edit-date');
const editTime = document.getElementById('edit-time');
const editPriority = document.getElementById('edit-priority');
const cancelEditBtn = document.getElementById('cancel-edit');

// 当前编辑的待办事项ID
let editingTodoId = null;

// 获取Supabase客户端实例
function getSupabase() {
    // 如果全局变量未初始化，尝试初始化
    if (typeof window.globalSupabase === 'undefined') {
        return initSupabase();
    }
    return window.globalSupabase;
}

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 等待Supabase库加载完成
        let attempts = 0;
        const maxAttempts = 10;
        
        while (typeof window.supabase === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase库加载失败');
            showAuthMessage('无法加载Supabase库，请检查网络连接或刷新页面重试', 'error');
            return;
        }
        
        // 初始化Supabase - 使用supabase-config.js中的initSupabase函数
        const supabase = initSupabase();
        
        if (!supabase) {
            showAuthMessage('无法连接到数据库，请检查配置', 'error');
            return;
        }
        
        // 检查用户认证状态
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            currentUser = session.user;
            showMainContent();
            await fetchTodos();
            setupRealtimeSubscription();
        } else {
            showAuthModal();
        }
        
        // 设置事件监听器
        setupEventListeners();
        
        // 监听认证状态变化
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                showMainContent();
                await fetchTodos();
                setupRealtimeSubscription();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                todos = [];
                showAuthModal();
                hideMainContent();
            }
        });
    } catch (error) {
        console.error('初始化应用失败:', error);
        showAuthMessage('初始化应用失败，请刷新页面重试', 'error');
    }
});

// 设置事件监听器
function setupEventListeners() {
    // 认证相关事件
    loginTab.addEventListener('click', () => {
        showTab('login');
    });
    
    signupTab.addEventListener('click', () => {
        showTab('signup');
    });
    
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    
    // 待办事项相关事件
    todoForm.addEventListener('submit', handleAddTodo);
    clearCompletedBtn.addEventListener('click', handleClearCompleted);
    
    // 详情折叠相关事件
    toggleDescriptionBtn.addEventListener('click', toggleDescriptionForm);
    
    // 编辑相关事件
    editForm.addEventListener('submit', handleEditTodo);
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    // 筛选和排序事件
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
            updateActiveFilterBtn(btn);
        });
    });
    
    sortSelect.addEventListener('change', () => {
        renderTodos();
    });
}

// 显示认证模态框
function showAuthModal() {
    authModal.style.display = 'flex';
}

// 隐藏认证模态框
function hideAuthModal() {
    authModal.style.display = 'none';
}

// 显示主内容
function showMainContent() {
    userInfo.style.display = 'flex';
    mainContent.style.display = 'block';
    hideAuthModal();
    userEmail.textContent = currentUser.email;
}

// 隐藏主内容
function hideMainContent() {
    userInfo.style.display = 'none';
    mainContent.style.display = 'none';
}

// 显示标签页
function showTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }
    hideAuthMessage();
}

// 显示认证消息
function showAuthMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
}

// 隐藏认证消息
function hideAuthMessage() {
    authMessage.style.display = 'none';
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            showAuthMessage(error.message, 'error');
        } else {
            showAuthMessage('登录成功！', 'success');
            setTimeout(() => {
                hideAuthMessage();
            }, 1000);
        }
    } catch (error) {
        console.error('登录错误:', error);
        showAuthMessage('登录失败，请重试', 'error');
    }
}

// 处理注册
async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) {
            showAuthMessage(error.message, 'error');
        } else {
            showAuthMessage('注册成功！请检查邮箱并确认注册', 'success');
            // 切换到登录标签
            setTimeout(() => {
                showTab('login');
            }, 2000);
        }
    } catch (error) {
        console.error('注册错误:', error);
        showAuthMessage('注册失败，请重试', 'error');
    }
}

// 处理登出
async function handleLogout() {
    try {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('登出错误:', error);
        }
    } catch (error) {
        console.error('登出错误:', error);
    }
}

// 获取待办事项
async function fetchTodos() {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('获取待办事项失败:', error);
            
            // 如果是表不存在的错误，显示错误提示
            if (error.code === 'PGRST205') {
                document.getElementById('db-error').style.display = 'block';
                document.getElementById('todo-list').style.display = 'none';
            }
            
            return;
        }
        
        // 隐藏错误提示
        document.getElementById('db-error').style.display = 'none';
        document.getElementById('todo-list').style.display = 'block';
        
        todos = data || [];
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('获取待办事项错误:', error);
    }
}

// 设置实时订阅
function setupRealtimeSubscription() {
    const supabase = getSupabase();
    const channel = supabase
        .channel('todos')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'todos',
                filter: `user_id=eq.${currentUser.id}`
            }, 
            (payload) => {
                handleRealtimeChange(payload);
            }
        )
        .subscribe();
}

// 处理实时变更
function handleRealtimeChange(payload) {
    const { eventType, new: newTodo, old: oldTodo } = payload;
    
    switch (eventType) {
        case 'INSERT':
            todos.unshift(newTodo);
            break;
        case 'UPDATE':
            const updateIndex = todos.findIndex(todo => todo.id === newTodo.id);
            if (updateIndex !== -1) {
                todos[updateIndex] = newTodo;
            }
            break;
        case 'DELETE':
            todos = todos.filter(todo => todo.id !== oldTodo.id);
            break;
    }
    
    renderTodos();
    updateStats();
}

// 处理添加待办事项
async function handleAddTodo(e) {
    e.preventDefault();
    
    const title = todoTitle.value.trim();
    if (!title) return;
    
    const description = todoDescription.value.trim();
    const date = todoDate.value;
    const time = todoTime.value;
    const priorityValue = todoPriority.value;
    
    // 将字符串优先级转换为整数
    let priority = 2; // 默认为中等优先级
    if (priorityValue === 'low') priority = 1;
    else if (priorityValue === 'medium') priority = 2;
    else if (priorityValue === 'high') priority = 3;
    
    let due_date = null;
    if (date) {
        due_date = new Date(date);
        if (time) {
            const [hours, minutes] = time.split(':');
            due_date.setHours(hours, minutes);
        }
        due_date = due_date.toISOString();
    }
    
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('todos')
            .insert([
                {
                    title,
                    description,
                    user_id: currentUser.id,
                    completed: false,
                    due_date,
                    priority
                }
            ]);
        
        if (error) {
            console.error('添加待办事项失败:', error);
            return;
        }
        
        // 重置表单
        todoForm.reset();
        todoPriority.value = 'medium';
        
        // 立即刷新列表，不等待实时订阅
        await fetchTodos();
    } catch (error) {
        console.error('添加待办事项错误:', error);
    }
}

// 处理切换待办事项状态
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('todos')
            .update({ completed: !todo.completed })
            .eq('id', id);
        
        if (error) {
            console.error('更新待办事项状态失败:', error);
            return;
        }
        
        // 立即刷新列表，不等待实时订阅
        await fetchTodos();
    } catch (error) {
        console.error('更新待办事项状态错误:', error);
    }
}

// 处理删除待办事项
async function deleteTodo(id) {
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('删除待办事项失败:', error);
            return;
        }
        
        // 立即刷新列表，不等待实时订阅
        await fetchTodos();
    } catch (error) {
        console.error('删除待办事项错误:', error);
    }
}

// 处理清除已完成待办事项
async function handleClearCompleted() {
    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) return;
    
    if (confirm(`确定要清除 ${completedTodos.length} 个已完成的待办事项吗？`)) {
        try {
            const supabase = getSupabase();
            const ids = completedTodos.map(todo => todo.id);
            const { error } = await supabase
                .from('todos')
                .delete()
                .in('id', ids);
            
            if (error) {
                console.error('清除已完成待办事项失败:', error);
                return;
            }
            
            // 立即刷新列表，不等待实时订阅
            await fetchTodos();
        } catch (error) {
            console.error('清除已完成待办事项错误:', error);
        }
    }
}

// 设置筛选器
let currentFilter = 'all';
function setFilter(filter) {
    currentFilter = filter;
    renderTodos();
}

// 更新活动筛选按钮
function updateActiveFilterBtn(activeBtn) {
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// 排序待办事项
function sortTodos(todos) {
    const sortBy = sortSelect.value;
    const sortedTodos = [...todos];
    
    switch (sortBy) {
        case 'newest':
            return sortedTodos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'oldest':
            return sortedTodos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'priority':
            return sortedTodos.sort((a, b) => a.priority - b.priority);
        case 'due_date':
            return sortedTodos.sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            });
        default:
            return sortedTodos;
    }
}

// 筛选待办事项
function filterTodos(todos) {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 渲染待办事项列表
function renderTodos() {
    const filteredTodos = filterTodos(todos);
    const sortedTodos = sortTodos(filteredTodos);
    
    todoList.innerHTML = '';
    
    if (sortedTodos.length === 0) {
        todoList.innerHTML = `
            <li class="empty-message">
                <div class="empty-state">
                    <h3>暂无待办事项</h3>
                    <p>添加您的第一个待办事项吧！</p>
                </div>
            </li>
        `;
        return;
    }
    
    sortedTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        // 检查是否过期
        let isOverdue = false;
        if (todo.due_date && !todo.completed) {
            const dueDate = new Date(todo.due_date);
            isOverdue = dueDate < new Date();
            if (isOverdue) {
                li.classList.add('overdue');
            }
        }
        
        // 格式化日期时间
        let dueDateTime = '';
        if (todo.due_date) {
            const dueDate = new Date(todo.due_date);
            const dateOptions = { month: 'short', day: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            
            const dateStr = dueDate.toLocaleDateString('zh-CN', dateOptions);
            const timeStr = dueDate.toLocaleTimeString('zh-CN', timeOptions);
            
            dueDateTime = `${dateStr} ${timeStr}`;
        }
        
        // 优先级标签
        let priorityBadge = '';
        switch (todo.priority) {
            case 3:
                priorityBadge = '<span class="todo-priority-badge high">高</span>';
                break;
            case 2:
                priorityBadge = '<span class="todo-priority-badge medium">中</span>';
                break;
            case 1:
                priorityBadge = '<span class="todo-priority-badge low">低</span>';
                break;
        }
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo('${todo.id}')">
            <div class="todo-content">
                <div class="todo-title">${todo.title || todo.text || ''}</div>
                ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                <div class="todo-meta">
                    ${dueDateTime ? `<div class="todo-datetime ${isOverdue ? 'overdue' : ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dueDateTime}
                    </div>` : ''}
                    ${priorityBadge}
                </div>
            </div>
            <div class="todo-actions">
                <button class="todo-btn edit-btn" onclick="openEditModal('${todo.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="todo-btn delete-btn" onclick="deleteTodo('${todo.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

// 更新统计信息
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// 打开编辑模态框
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    editingTodoId = id;
    
    // 填充表单
    editTitle.value = todo.title || todo.text || '';
    editDescription.value = todo.description || '';
    
    // 处理日期和时间
    if (todo.due_date) {
        const dueDate = new Date(todo.due_date);
        editDate.value = dueDate.toISOString().split('T')[0];
        
        const hours = dueDate.getHours().toString().padStart(2, '0');
        const minutes = dueDate.getMinutes().toString().padStart(2, '0');
        editTime.value = `${hours}:${minutes}`;
    } else {
        editDate.value = '';
        editTime.value = '';
    }
    
    // 设置优先级
    switch (todo.priority) {
        case 3:
            editPriority.value = 'high';
            break;
        case 2:
            editPriority.value = 'medium';
            break;
        case 1:
            editPriority.value = 'low';
            break;
    }
    
    // 显示模态框
    editModal.style.display = 'flex';
}

// 关闭编辑模态框
function closeEditModal() {
    editModal.style.display = 'none';
    editingTodoId = null;
}

// 处理编辑待办事项
async function handleEditTodo(e) {
    e.preventDefault();
    
    if (!editingTodoId) return;
    
    const title = editTitle.value.trim();
    if (!title) return;
    
    const description = editDescription.value.trim();
    const date = editDate.value;
    const time = editTime.value;
    const priorityValue = editPriority.value;
    
    // 将字符串优先级转换为整数
    let priority = 2; // 默认为中等优先级
    if (priorityValue === 'low') priority = 1;
    else if (priorityValue === 'medium') priority = 2;
    else if (priorityValue === 'high') priority = 3;
    
    let due_date = null;
    if (date) {
        due_date = new Date(date);
        if (time) {
            const [hours, minutes] = time.split(':');
            due_date.setHours(hours, minutes);
        }
        due_date = due_date.toISOString();
    }
    
    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('todos')
            .update({
                title,
                description,
                due_date,
                priority
            })
            .eq('id', editingTodoId);
        
        if (error) {
            console.error('更新待办事项失败:', error);
            return;
        }
        
        // 关闭模态框
        closeEditModal();
        
        // 立即刷新列表，不等待实时订阅
        await fetchTodos();
    } catch (error) {
        console.error('更新待办事项错误:', error);
    }
}

// 切换详情输入框显示状态
function toggleDescriptionForm() {
    const isHidden = descriptionContainer.style.display === 'none';
    descriptionContainer.style.display = isHidden ? 'block' : 'none';
    
    // 更新按钮图标
    const svg = toggleDescriptionBtn.querySelector('svg');
    if (isHidden) {
        svg.innerHTML = '<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>';
    } else {
        svg.innerHTML = '<path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>';
    }
}

// 切换详情显示
function toggleDescription(id) {
    const descElement = document.getElementById(`desc-${id}`);
    if (descElement) {
        const isHidden = descElement.style.display === 'none';
        descElement.style.display = isHidden ? 'block' : 'none';
        
        // 更新按钮图标
        const button = descElement.previousElementSibling;
        if (button) {
            const svg = button.querySelector('svg');
            if (svg) {
                if (isHidden) {
                    // 展开图标
                    svg.innerHTML = '<polyline points="6,9 12,15 18,9"></polyline>';
                } else {
                    // 收起图标
                    svg.innerHTML = '<polyline points="18,15 12,9 6,15"></polyline>';
                }
            }
        }
    }
}