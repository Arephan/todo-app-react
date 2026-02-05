import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        try {
          const response = await fetch('/api/todos');
          try {
            const data = await response.json();
            try {
              setTodos(data);
            } catch (err) {
              console.error('Error setting todos:', err);
              setError('Failed to set todos');
            }
          } catch (err) {
            console.error('Error parsing JSON:', err);
            setError('Failed to parse response');
          }
        } catch (err) {
          console.error('Error fetching:', err);
          setError('Failed to fetch todos');
        }
      } catch (err) {
        console.error('Error in fetchTodos:', err);
        setError('Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async () => {
    try {
      setIsAdding(true);
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: newTodo }),
        });
        try {
          const data = await response.json();
          try {
            setTodos([...todos, data]);
            setNewTodo('');
          } catch (err) {
            console.error('Error adding todo:', err);
          }
        } catch (err) {
          console.error('Error parsing response:', err);
        }
      } catch (err) {
        console.error('Error posting:', err);
      }
    } catch (err) {
      console.error('Error in addTodo:', err);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>My Todos</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          style={{ padding: '8px', marginRight: '10px', width: '300px' }}
        />
        <button
          onClick={addTodo}
          disabled={isAdding || !newTodo.trim()}
          style={{ padding: '8px 16px' }}
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              padding: '10px',
              marginBottom: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
