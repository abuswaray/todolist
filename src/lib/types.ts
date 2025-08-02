export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface TodoFilters {
  status: 'all' | 'active' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  category: string;
  search: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  dueToday: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
} 