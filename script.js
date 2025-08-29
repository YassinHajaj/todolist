class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        
        this.init();
    }
    
    init() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.render();
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
    }
    
    editTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        const textSpan = todoElement.querySelector('.todo-text');
        const currentText = this.todos.find(t => t.id === id).text;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-edit-input';
        input.value = currentText;
        input.maxLength = 100;
        
        textSpan.style.display = 'none';
        textSpan.parentNode.insertBefore(input, textSpan.nextSibling);
        input.focus();
        input.select();
        
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                const todo = this.todos.find(t => t.id === id);
                todo.text = newText;
                this.saveTodos();
            }
            this.render();
        };
        
        const cancelEdit = () => {
            this.render();
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });
        
        input.addEventListener('blur', saveEdit);
    }
    
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
    }
    
    render() {
        this.todoList.innerHTML = '';
        
        if (this.todos.length === 0) {
            this.todoList.innerHTML = '<div class="empty-state">No todos yet. Add one above!</div>';
        } else {
            this.todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', todo.id);
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <span class="todo-text" ondblclick="app.editTodo(${todo.id})">${this.escapeHtml(todo.text)}</span>
                    <button class="edit-btn" onclick="app.editTodo(${todo.id})">Edit</button>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                `;
                
                this.todoList.appendChild(li);
            });
        }
        
        this.updateStats();
    }
    
    updateStats() {
        const totalCount = this.todos.length;
        const completedCount = this.todos.filter(t => t.completed).length;
        const activeCount = totalCount - completedCount;
        
        if (totalCount === 0) {
            this.todoCount.textContent = '0 items';
        } else if (totalCount === 1) {
            this.todoCount.textContent = '1 item';
        } else {
            this.todoCount.textContent = `${totalCount} items (${activeCount} active)`;
        }
        
        this.clearCompletedBtn.style.display = completedCount > 0 ? 'block' : 'none';
    }
    
    saveTodos() {
        try {
            localStorage.setItem('todolist-todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Failed to save todos to localStorage:', error);
        }
    }
    
    loadTodos() {
        try {
            const saved = localStorage.getItem('todolist-todos');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load todos from localStorage:', error);
            return [];
        }
    }
    
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});