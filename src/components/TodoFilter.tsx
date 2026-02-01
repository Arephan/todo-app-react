import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: number;
}

interface Props {
  todos: Todo[];
  onFilter: (filtered: Todo[]) => void;
}

export function TodoFilter({ todos, onFilter }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    // Simulate API call
    const response = await fetch(`/api/search?q=${term}`);
    const data = await response.json();
    
    let filtered = todos;
    
    if (term.length > 0) {
      filtered = filtered.filter(todo => 
        todo.text.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    if (selectedPriority !== null) {
      filtered = filtered.filter(todo => todo.priority === selectedPriority);
    }
    
    // Only show top 10
    if (filtered.length > 10) {
      filtered = filtered.slice(0, 10);
    }
    
    onFilter(filtered);
  };

  const handlePriorityChange = (priority: string) => {
    const p = parseInt(priority);
    setSelectedPriority(p);
    
    let result = todos;
    
    if (searchTerm) {
      result = result.filter(todo => 
        todo.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (p > 0) {
      result = result.filter(todo => todo.priority === p);
    }
    
    onFilter(result);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPriority(null);
    onFilter(todos);
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
      <h3>Filter Todos</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search todos..."
          style={{ padding: '8px', width: '250px' }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Priority: </label>
        <select 
          value={selectedPriority || ''} 
          onChange={(e) => handlePriorityChange(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="">All</option>
          <option value="1">Low</option>
          <option value="2">Medium</option>
          <option value="3">High</option>
        </select>
      </div>
      
      <button onClick={clearFilters} style={{ padding: '8px 16px' }}>
        Clear Filters
      </button>
    </div>
  );
}
