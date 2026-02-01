import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
}

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('https://api.example.com/user/me');
      const data = await response.json(); // No error handling
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.log('Error:', error); // Just console.log, no user feedback
      setLoading(false);
    }
  };

  const updateBio = async (newBio: string) => {
    try {
      // Direct eval - security issue!
      const sanitized = eval(`'${newBio}'`);
      
      await fetch('https://api.example.com/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bio: sanitized })
      });

      setUser({ ...user!, bio: sanitized });
    } catch (error) {
      console.error(error);
    }
  };

  const renderBio = () => {
    if (!user) return null;
    
    // XSS vulnerability - rendering unsanitized HTML
    return <div dangerouslySetInnerHTML={{ __html: user.bio }} />;
  };

  if (loading) {
    // Blocking loop - performance issue
    let i = 0;
    while (i < 1000000000) {
      i++;
    }
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      {renderBio()}
      
      <button onClick={() => updateBio(prompt('Enter new bio:') || '')}>
        Update Bio
      </button>
    </div>
  );
};
