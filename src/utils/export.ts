/**
 * Utility functions for exporting todo data
 */

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

/**
 * Export todos to JSON format
 */
export function exportToJSON(todos: Todo[]): string {
  return JSON.stringify(todos, null, 2);
}

/**
 * Export todos to CSV format
 */
export function exportToCSV(todos: Todo[]): string {
  const headers = ['ID', 'Title', 'Completed', 'Created At'];
  const rows = todos.map(todo => [
    todo.id,
    todo.title,
    todo.completed ? 'Yes' : 'No',
    todo.createdAt.toISOString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
