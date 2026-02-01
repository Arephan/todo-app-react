import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority?: number;
}

interface Props {
  todos: Todo[];
  onFilter: (filtered: Todo[]) => void;
}

export function FilterBar({ todos, onFilter }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priority, setPriority] = useState<number | null>(null);

  // Bug: No error handling on async fetch
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Bug: API call but response is ignored
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    
    // Bug: Duplicated filter logic (also in handlePriorityChange)
    let results = todos;
    
    if (query.length > 0) {
      results = results.filter(t => 
        t.text.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (priority !== null) {
      results = results.filter(t => t.priority === priority);
    }
    
    // Bug: Magic number - should be a constant
    if (results.length > 10) {
      results = results.slice(0, 10);
    }
    
    onFilter(results);
  };

  const handlePriorityChange = (p: number | null) => {
    setPriority(p);
    
    // Bug: Same filter logic duplicated
    let results = todos;
    
    if (searchQuery.length > 0) {
      results = results.filter(t => 
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (p !== null) {
      results = results.filter(t => t.priority === p);
    }
    
    onFilter(results);
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
      <input
        type="text"
        placeholder="Search todos..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ padding: '8px', marginRight: '10px', width: '300px' }}
      />
      
      <select 
        value={priority === null ? '' : priority}
        onChange={(e) => handlePriorityChange(e.target.value ? parseInt(e.target.value) : null)}
        style={{ padding: '8px' }}
      >
        <option value="">All priorities</option>
        <option value="1">Low</option>
        <option value="2">Medium</option>
        <option value="3">High</option>
      </select>
    </div>
  );
}
