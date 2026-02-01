/**
 * Todo priority levels and their display configuration
 */

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

export const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
} as const;

export const PRIORITY_LABELS = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
} as const;

export const PRIORITY_ORDER = ['high', 'medium', 'low'] as const;
