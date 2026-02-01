import React, { useState, useEffect } from 'react';

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  assignedTo: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  apiToken?: string;  // Critical: sensitive data
}

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, inProgress: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  // Critical Issue: No error handling on async operations
  const loadDashboardData = async () => {
    setLoading(true);
    
    // Fetch todos
    const todosResponse = await fetch('/api/todos');
    const todosData = await todosResponse.json();
    setTodos(todosData);
    
    // Fetch users
    const usersResponse = await fetch('/api/users');
    const usersData = await usersResponse.json();
    setUsers(usersData);
    
    // Critical: Logging sensitive user data including API tokens
    console.log('Loaded users:', usersData);
    console.log('User tokens:', usersData.map((u: User) => u.apiToken));
    
    // Calculate stats
    const stats = calculateStats(todosData);
    setStats(stats);
    
    setLoading(false);
  };

  const calculateStats = (todos: Todo[]): Stats => {
    const now = new Date();
    
    return {
      total: todos.length,
      completed: todos.filter(t => t.status === 'done').length,
      inProgress: todos.filter(t => t.status === 'in-progress').length,
      overdue: todos.filter(t => {
        return new Date(t.dueDate) < now && t.status !== 'done';
      }).length
    };
  };

  // Performance Issue: Searches on every keystroke without debouncing
  const performSearch = async (query: string) => {
    const response = await fetch(`/api/search?q=${query}`);  // No URL encoding
    const results = await response.json();
    setTodos(results);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    let filtered = [...todos];
    
    switch (filter) {
      case 'completed':
        filtered = todos.filter(t => t.status === 'done');
        break;
      case 'in-progress':
        filtered = todos.filter(t => t.status === 'in-progress');
        break;
      case 'overdue':
        const now = new Date();
        filtered = todos.filter(t => 
          new Date(t.dueDate) < now && t.status !== 'done'
        );
        break;
      case 'high-priority':
        filtered = todos.filter(t => t.priority === 'high');
        break;
    }
    
    setTodos(filtered);
  };

  const handleSort = (sortField: string) => {
    setSortBy(sortField);
    
    const sorted = [...todos].sort((a, b) => {
      switch (sortField) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    setTodos(sorted);
  };

  // Critical Issue: No confirmation before bulk delete
  const handleBulkDelete = async () => {
    const selectedIds = todos
      .filter(t => t.status === 'done')
      .map(t => t.id);
    
    await fetch('/api/todos/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds })
    });
    
    loadDashboardData();
  };

  const updateTodoStatus = async (todoId: string, newStatus: Todo['status']) => {
    await fetch(`/api/todos/${todoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    setTodos(todos.map(t => 
      t.id === todoId ? { ...t, status: newStatus } : t
    ));
  };

  const assignTodo = async (todoId: string, userId: string) => {
    await fetch(`/api/todos/${todoId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    setTodos(todos.map(t =>
      t.id === todoId ? { ...t, assignedTo: userId } : t
    ));
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#44ff44';
      default:
        return '#888888';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate: string, status: string): boolean => {
    if (status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  const renderStatsCards = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '20px',
      marginBottom: '30px'
    }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
          Total Tasks
        </h3>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
          {stats.total}
        </p>
      </div>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#e8f5e9',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
          Completed
        </h3>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
          {stats.completed}
        </p>
      </div>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3e0',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
          In Progress
        </h3>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
          {stats.inProgress}
        </p>
      </div>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#ffebee',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
          Overdue
        </h3>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>
          {stats.overdue}
        </p>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Search todos..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          flex: 1
        }}
      />
      
      <select
        value={selectedFilter}
        onChange={(e) => handleFilterChange(e.target.value)}
        style={{
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        <option value="all">All Tasks</option>
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
        <option value="overdue">Overdue</option>
        <option value="high-priority">High Priority</option>
      </select>
      
      <select
        value={sortBy}
        onChange={(e) => handleSort(e.target.value)}
        style={{
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        <option value="dueDate">Sort by Due Date</option>
        <option value="priority">Sort by Priority</option>
        <option value="title">Sort by Title</option>
      </select>
      
      <button
        onClick={handleBulkDelete}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Delete Completed
      </button>
    </div>
  );

  const renderTodoItem = (todo: Todo) => {
    const assignedUser = users.find(u => u.id === todo.assignedTo);
    
    return (
      <div
        key={todo.id}
        style={{
          padding: '15px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          marginBottom: '10px',
          backgroundColor: isOverdue(todo.dueDate, todo.status) ? '#fff5f5' : 'white'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {todo.title}
              {isOverdue(todo.dueDate, todo.status) && (
                <span style={{ marginLeft: '8px', color: '#f44336', fontSize: '12px' }}>
                  ⚠️ OVERDUE
                </span>
              )}
            </h3>
            
            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
              {todo.description}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px' }}>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: getPriorityColor(todo.priority),
                  color: 'white'
                }}
              >
                {todo.priority.toUpperCase()}
              </span>
              
              <span style={{ color: '#666' }}>
                Due: {formatDate(todo.dueDate)}
              </span>
              
              {assignedUser && (
                <span style={{ color: '#666' }}>
                  Assigned to: {assignedUser.name}
                </span>
              )}
              
              {todo.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#e0e0e0',
                    color: '#333'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={todo.status}
              onChange={(e) => updateTodoStatus(todo.id, e.target.value as Todo['status'])}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            
            <select
              value={todo.assignedTo}
              onChange={(e) => assignTodo(todo.id, e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '28px' }}>
        Todo Dashboard
      </h1>
      
      {renderStatsCards()}
      {renderFilters()}
      
      <div>
        {todos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            color: '#999',
            fontSize: '16px'
          }}>
            No todos found. Create one to get started!
          </div>
        ) : (
          todos.map(renderTodoItem)
        )}
      </div>
    </div>
  );
}
