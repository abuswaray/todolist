"use client";

import React, { useEffect } from "react";
import { TodoList } from "./TodoList";
import { TodoFilters } from "./TodoFilters";
import { useTodoStore } from "@/lib/store";
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const Dashboard: React.FC = () => {
  const { initialize, stats, error } = useTodoStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => initialize()}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Smart</h1>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span suppressHydrationWarning>
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon className="w-5 h-5 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-900">
                  Quick Stats
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {stats.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {stats.active}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="text-sm font-semibold text-green-600">
                    {stats.completed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Overdue</span>
                  <span className="text-sm font-semibold text-red-600">
                    {stats.overdue}
                  </span>
                </div>
                {stats.dueToday > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Due Today</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {stats.dueToday}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            <TodoFilters />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <TodoList />
          </div>
        </div>
      </main>
    </div>
  );
};
