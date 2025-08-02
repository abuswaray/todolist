"use client";

import React, { useState, useEffect } from 'react';
import { Todo } from '@/lib/types';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { useTodoStore } from '@/lib/store';
import { todoDB } from '@/lib/database';
import { Button } from '@/components/ui/Button';
import { 
  PlusIcon,
  CheckIcon,
  TrashIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export const TodoList: React.FC = () => {
  const { todos, filters, toggleAll, deleteCompleted, isLoading } = useTodoStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const loadFilteredTodos = async () => {
      const filtered = await todoDB.getTodos(filters);
      setFilteredTodos(filtered);
    };

    loadFilteredTodos();
  }, [todos, filters]);

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTodo(undefined);
  };

  const handleToggleAll = async () => {
    const allCompleted = filteredTodos.every(todo => todo.completed);
    await toggleAll(!allCompleted);
  };

  const handleDeleteCompleted = async () => {
    await deleteCompleted();
  };

  const hasCompletedTodos = filteredTodos.some(todo => todo.completed);
  const hasActiveTodos = filteredTodos.some(todo => !todo.completed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {filteredTodos.length === 0 ? 'No todos found' : `${filteredTodos.length} todo${filteredTodos.length === 1 ? '' : 's'}`}
          </h2>
          {filters.search && (
            <p className="text-sm text-slate-500 mt-1">
              Showing results for "{filters.search}"
            </p>
          )}
        </div>
        
        <Button
          onClick={() => setIsFormOpen(true)}
          icon={<PlusIcon className="w-4 h-4" />}
        >
          Add Todo
        </Button>
      </div>

      {/* Bulk Actions */}
      {filteredTodos.length > 0 && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAll}
              disabled={!hasActiveTodos}
              icon={<CheckIcon className="w-4 h-4" />}
            >
              {hasActiveTodos ? 'Complete All' : 'Uncomplete All'}
            </Button>
            
            {hasCompletedTodos && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteCompleted}
                icon={<TrashIcon className="w-4 h-4" />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete Completed
              </Button>
            )}
          </div>
          
          <div className="text-sm text-slate-500">
            {filteredTodos.filter(t => !t.completed).length} active, {filteredTodos.filter(t => t.completed).length} completed
          </div>
        </div>
      )}

      {/* Todo List */}
      {filteredTodos.length > 0 ? (
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardDocumentListIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {filters.search ? 'No todos found' : 'No todos yet'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {filters.search 
              ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
              : 'Get started by creating your first todo. Click the "Add Todo" button above to begin.'
            }
          </p>
          {!filters.search && (
            <Button
              onClick={() => setIsFormOpen(true)}
              icon={<PlusIcon className="w-4 h-4" />}
            >
              Create Your First Todo
            </Button>
          )}
        </div>
      )}

      {/* Todo Form Modal */}
      <TodoForm
        todo={editingTodo}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}; 