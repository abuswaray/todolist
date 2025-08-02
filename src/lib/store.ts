import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Todo, TodoFilters, TodoStats, Category } from './types';
import { todoDB } from './database';

interface TodoStore {
  // State
  todos: Todo[];
  categories: Category[];
  stats: TodoStats;
  filters: TodoFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TodoFilters>) => void;
  clearFilters: () => void;
  toggleAll: (completed: boolean) => Promise<void>;
  deleteCompleted: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'count'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const initialFilters: TodoFilters = {
  status: 'all',
  priority: 'all',
  category: '',
  search: '',
};

const initialStats: TodoStats = {
  total: 0,
  completed: 0,
  active: 0,
  overdue: 0,
  dueToday: 0,
};

export const useTodoStore = create<TodoStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      todos: [],
      categories: [],
      stats: initialStats,
      filters: initialFilters,
      isLoading: false,
      error: null,

      // Initialize store
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          const [todos, categories, stats] = await Promise.all([
            todoDB.getAllTodos(),
            todoDB.getCategories(),
            todoDB.getStats(),
          ]);
          
          set({ 
            todos, 
            categories, 
            stats,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize', 
            isLoading: false 
          });
        }
      },

      // Add todo with optimistic update
      addTodo: async (todo) => {
        const newTodo = await todoDB.createTodo(todo);
        set(state => ({
          todos: [newTodo, ...state.todos],
          stats: {
            ...state.stats,
            total: state.stats.total + 1,
            active: state.stats.active + 1,
          }
        }));
        await get().refreshData();
      },

      // Update todo with optimistic update
      updateTodo: async (id, updates) => {
        const currentTodo = get().todos.find(t => t.id === id);
        if (!currentTodo) return;

        // Optimistic update
        set(state => ({
          todos: state.todos.map(todo => 
            todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
          )
        }));

        const updatedTodo = await todoDB.updateTodo(id, updates);
        if (updatedTodo) {
          await get().refreshData();
        }
      },

      // Delete todo
      deleteTodo: async (id) => {
        const success = await todoDB.deleteTodo(id);
        if (success) {
          await get().refreshData();
        }
      },

      // Toggle todo completion
      toggleTodo: async (id) => {
        const todo = get().todos.find(t => t.id === id);
        if (!todo) return;

        await get().updateTodo(id, { completed: !todo.completed });
      },

      // Set filters
      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      // Clear filters
      clearFilters: () => {
        set({ filters: initialFilters });
      },

      // Toggle all todos
      toggleAll: async (completed) => {
        await todoDB.toggleAll(completed);
        await get().refreshData();
      },

      // Delete completed todos
      deleteCompleted: async () => {
        await todoDB.deleteCompleted();
        await get().refreshData();
      },

      // Add category
      addCategory: async (category) => {
        const newCategory = await todoDB.addCategory(category);
        set(state => ({
          categories: [...state.categories, newCategory]
        }));
      },

      // Delete category
      deleteCategory: async (id) => {
        const success = await todoDB.deleteCategory(id);
        if (success) {
          await get().refreshData();
        }
      },

      // Refresh all data
      refreshData: async () => {
        try {
          const [todos, categories, stats] = await Promise.all([
            todoDB.getAllTodos(),
            todoDB.getCategories(),
            todoDB.getStats(),
          ]);
          
          set({ todos, categories, stats });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh data' 
          });
        }
      },
    }),
    {
      name: 'todo-store',
    }
  )
); 