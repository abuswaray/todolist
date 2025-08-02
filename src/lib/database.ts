import { Todo, TodoFilters, TodoStats, Category } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'smart-todolist-data';
const CATEGORIES_KEY = 'smart-todolist-categories';

class TodoDatabase {
  private todos: Todo[] = [];
  private categories: Category[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const todosData = localStorage.getItem(STORAGE_KEY);
      const categoriesData = localStorage.getItem(CATEGORIES_KEY);
      
      if (todosData) {
        const parsed = JSON.parse(todosData);
        this.todos = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }));
      }
      
      if (categoriesData) {
        this.categories = JSON.parse(categoriesData);
      } else {
        // Initialize default categories
        this.categories = [
          { id: '1', name: 'Work', color: '#3B82F6', count: 0 },
          { id: '2', name: 'Personal', color: '#10B981', count: 0 },
          { id: '3', name: 'Shopping', color: '#F59E0B', count: 0 },
          { id: '4', name: 'Health', color: '#EF4444', count: 0 },
        ];
      }
      
      this.updateCategoryCounts();
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  private updateCategoryCounts(): void {
    this.categories = this.categories.map(category => ({
      ...category,
      count: this.todos.filter(todo => todo.category === category.name).length
    }));
  }

  // CRUD Operations
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const newTodo: Todo = {
      ...todo,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.todos.push(newTodo);
    this.updateCategoryCounts();
    this.saveToStorage();
    return newTodo;
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) return null;
    
    this.todos[index] = {
      ...this.todos[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.updateCategoryCounts();
    this.saveToStorage();
    return this.todos[index];
  }

  async deleteTodo(id: string): Promise<boolean> {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) return false;
    
    this.todos.splice(index, 1);
    this.updateCategoryCounts();
    this.saveToStorage();
    return true;
  }

  async getTodo(id: string): Promise<Todo | null> {
    return this.todos.find(todo => todo.id === id) || null;
  }

  async getAllTodos(): Promise<Todo[]> {
    return [...this.todos];
  }

  // Advanced Querying
  async getTodos(filters: TodoFilters): Promise<Todo[]> {
    let filtered = [...this.todos];

    // Status filter
    if (filters.status === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filters.status === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(todo => todo.category === filters.category);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description?.toLowerCase().includes(searchLower) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by priority first, then by due date, then by creation date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // Statistics
  async getStats(): Promise<TodoStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    return {
      total: this.todos.length,
      completed: this.todos.filter(todo => todo.completed).length,
      active: this.todos.filter(todo => !todo.completed).length,
      overdue: this.todos.filter(todo => 
        !todo.completed && todo.dueDate && todo.dueDate < today
      ).length,
      dueToday: this.todos.filter(todo => 
        !todo.completed && todo.dueDate && 
        todo.dueDate >= today && todo.dueDate < tomorrow
      ).length,
    };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return [...this.categories];
  }

  async addCategory(category: Omit<Category, 'id' | 'count'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      count: 0,
    };
    
    this.categories.push(newCategory);
    this.saveToStorage();
    return newCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = this.categories.find(c => c.id === id);
    if (!category) return false;
    
    // Move todos to "Personal" category
    this.todos = this.todos.map(todo => 
      todo.category === category.name 
        ? { ...todo, category: 'Personal', updatedAt: new Date() }
        : todo
    );
    
    this.categories = this.categories.filter(c => c.id !== id);
    this.updateCategoryCounts();
    this.saveToStorage();
    return true;
  }

  // Bulk operations
  async toggleAll(completed: boolean): Promise<void> {
    this.todos = this.todos.map(todo => ({
      ...todo,
      completed,
      updatedAt: new Date(),
    }));
    this.saveToStorage();
  }

  async deleteCompleted(): Promise<void> {
    this.todos = this.todos.filter(todo => !todo.completed);
    this.updateCategoryCounts();
    this.saveToStorage();
  }
}

export const todoDB = new TodoDatabase(); 