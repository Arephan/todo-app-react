import React, { useState } from 'react';
import { TodoList } from './components/TodoList';
import { AddTodo } from './components/AddTodo';
import { TodoFilter, FilterType } from './components/TodoFilter';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  };

  return (
    <div className="app">
      <h1>Todo App</h1>
      <AddTodo onAdd={addTodo} />
      <TodoFilter currentFilter={filter} onFilterChange={setFilter} />
      <TodoList todos={getFilteredTodos()} onToggle={toggleTodo} onDelete={deleteTodo} />
    </div>
  );
}

export default App;
