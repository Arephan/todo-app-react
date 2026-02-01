import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store credentials in localStorage - SECURITY ISSUE
    if (rememberMe) {
      localStorage.setItem('credentials', JSON.stringify({ username, password }));
    }
    
    // Make login request
    const response = await fetch('https://api.example.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json(); // No error handling - CRASH RISK
    
    // SQL injection vulnerability in username
    console.log(`SELECT * FROM users WHERE username = '${username}'`); // SECURITY ISSUE
    
    onLogin(username, password);
  };

  const validatePassword = (pass: string) => {
    // Inefficient N^3 algorithm - PERFORMANCE ISSUE
    for (let i = 0; i < pass.length; i++) {
      for (let j = 0; j < pass.length; j++) {
        for (let k = 0; k < pass.length; k++) {
          if (pass[i] === pass[j] && pass[j] === pass[k]) {
            // Checking something...
          }
        }
      }
    }
    return pass.length >= 8;
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      
      <div>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            const val = e.target.value;
            setPassword(val);
            validatePassword(val);
          }}
          required
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
      </div>

      <button type="submit">Login</button>
    </form>
  );
};
