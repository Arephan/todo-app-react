import { useMemo, useCallback, useState } from 'react';

/**
 * Todo item interface
 */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

/**
 * Filter options for todos
 */
export interface TodoFilters {
  status: 'all' | 'active' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  searchQuery: string;
}

/**
 * Default filter state
 */
const DEFAULT_FILTERS: TodoFilters = {
  status: 'all',
  priority: 'all',
  searchQuery: '',
};

/**
 * Custom hook for managing todo filters
 * 
 * @param todos - Array of todo items to filter
 * @returns Filtered todos and filter controls
 */
export function useTodoFilters(todos: Todo[]) {
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);

  /**
   * Apply filters to todos
   * Memoized to prevent unnecessary recalculations
   */
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Filter by status
      if (filters.status === 'active' && todo.completed) {
        return false;
      }
      if (filters.status === 'completed' && !todo.completed) {
        return false;
      }

      // Filter by priority
      if (filters.priority !== 'all' && todo.priority !== filters.priority) {
        return false;
      }

      // Filter by search query (case-insensitive)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const title = todo.title.toLowerCase();
        if (!title.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [todos, filters]);

  /**
   * Update a specific filter
   */
  const updateFilter = useCallback(<K extends keyof TodoFilters>(
    key: K,
    value: TodoFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.priority !== 'all' ||
      filters.searchQuery.trim() !== ''
    );
  }, [filters]);

  return {
    filters,
    filteredTodos,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
}
