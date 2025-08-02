"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useTodoStore } from '@/lib/store';
import { debounce } from '@/lib/utils';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export const TodoFilters: React.FC = () => {
  const { filters, setFilters, clearFilters, categories, stats } = useTodoStore();

  const [searchValue, setSearchValue] = useState('');

  const debouncedSearch = debounce((value: string) => {
    setFilters({ search: value });
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Update search value when filters change
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.category !== '' || 
                          filters.search !== '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search todos..."
        icon={<MagnifyingGlassIcon className="w-4 h-4" />}
        onChange={handleSearchChange}
        value={searchValue}
      />

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <Select
          label="Status"
          value={filters.status}
          onChange={(value) => setFilters({ status: value as any })}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        {/* Priority Filter */}
        <Select
          label="Priority"
          value={filters.priority}
          onChange={(value) => setFilters({ priority: value as any })}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />

        {/* Category Filter */}
        <Select
          label="Category"
          value={filters.category}
          onChange={(value) => setFilters({ category: value })}
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map(cat => ({ value: cat.name, label: cat.name })),
          ]}
        />
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.status !== 'all' && (
            <Badge variant="info" size="sm">
              Status: {filters.status}
              <button
                onClick={() => setFilters({ status: 'all' })}
                className="ml-1 hover:text-blue-700"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.priority !== 'all' && (
            <Badge variant="warning" size="sm">
              Priority: {filters.priority}
              <button
                onClick={() => setFilters({ priority: 'all' })}
                className="ml-1 hover:text-yellow-700"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.category && (
            <Badge variant="success" size="sm">
              Category: {filters.category}
              <button
                onClick={() => setFilters({ category: '' })}
                className="ml-1 hover:text-green-700"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.search && (
            <Badge variant="default" size="sm">
              Search: "{filters.search}"
              <button
                onClick={() => setFilters({ search: '' })}
                className="ml-1 hover:text-slate-700"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{stats.active}</div>
          <div className="text-xs text-slate-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
          <div className="text-xs text-slate-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{stats.overdue}</div>
          <div className="text-xs text-slate-500">Overdue</div>
        </div>
      </div>
    </div>
  );
}; 