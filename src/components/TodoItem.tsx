"use client";

import React, { useState } from 'react';
import { Todo } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatDate, getPriorityColor, getPriorityIcon, isOverdue } from '@/lib/utils';
import { useTodoStore } from '@/lib/store';
import { 
  TrashIcon, 
  PencilIcon, 
  CheckIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit }) => {
  const { toggleTodo, deleteTodo } = useTodoStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    await toggleTodo(todo.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTodo(todo.id);
  };

  const isOverdueTodo = todo.dueDate && isOverdue(todo.dueDate) && !todo.completed;

  return (
    <div className={cn(
      'group relative bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300',
      todo.completed && 'opacity-75 bg-slate-50',
      isOverdueTodo && 'border-red-200 bg-red-50'
    )}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 mt-0.5',
            todo.completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-slate-300 hover:border-slate-400'
          )}
        >
          {todo.completed && (
            <CheckIcon className="w-3 h-3" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'text-sm font-medium text-slate-900 line-clamp-2',
                todo.completed && 'line-through text-slate-500'
              )}>
                {todo.title}
              </h3>
              
              {todo.description && (
                <p className={cn(
                  'text-xs text-slate-600 mt-1 line-clamp-2',
                  todo.completed && 'text-slate-400'
                )}>
                  {todo.description}
                </p>
              )}

              {/* Tags */}
              {todo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {todo.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="info" size="sm">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {todo.tags.length > 3 && (
                    <Badge variant="default" size="sm">
                      +{todo.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Priority Badge */}
            <Badge 
              variant={todo.priority === 'high' ? 'danger' : todo.priority === 'medium' ? 'warning' : 'success'}
              size="sm"
              className="flex-shrink-0"
            >
              <span className="mr-1">{getPriorityIcon(todo.priority)}</span>
              {todo.priority}
            </Badge>
          </div>

          {/* Meta Information */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {/* Category */}
              <span className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: todo.category === 'Work' ? '#3B82F6' : 
                           todo.category === 'Personal' ? '#10B981' :
                           todo.category === 'Shopping' ? '#F59E0B' : '#EF4444' }}
                />
                {todo.category}
              </span>

              {/* Due Date */}
              {todo.dueDate && (
                <span className={cn(
                  'flex items-center gap-1',
                  isOverdueTodo && 'text-red-600 font-medium'
                )}>
                  <CalendarIcon className="w-3 h-3" />
                  {formatDate(todo.dueDate)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(todo)}
                className="h-7 w-7 p-0"
              >
                <PencilIcon className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                loading={isDeleting}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 