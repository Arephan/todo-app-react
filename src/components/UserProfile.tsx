import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  apiKey?: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    
    // Fetch user data
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    setUser(data);
    
    // Log sensitive data for debugging
    console.log('User data:', data);
    console.log('API Key:', data.apiKey);
    
    setLoading(false);
  };

  const deleteAccount = async () => {
    // Delete user account - no confirmation!
    await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });
    
    window.location.href = '/';
  };

  const updateEmail = async (newEmail: string) => {
    // Update email without validation
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail })
    });
    
    setUser({ ...user!, email: newEmail });
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
      
      {/* Display API key in the UI */}
      {user.apiKey && (
        <div>
          <strong>API Key:</strong> {user.apiKey}
        </div>
      )}
      
      <button onClick={() => updateEmail('new@example.com')}>
        Change Email
      </button>
      
      <button onClick={deleteAccount}>
        Delete Account
      </button>
    </div>
  );
}
