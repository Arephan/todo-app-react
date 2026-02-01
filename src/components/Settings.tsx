import React, { useState, useEffect } from 'react';

interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareData: boolean;
    publicProfile: boolean;
  };
  apiKey: string;  // Sensitive!
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

export function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // Issue: No error handling
  const loadSettings = async () => {
    const response = await fetch('/api/settings');
    const data = await response.json();
    
    // Issue: Logging sensitive data
    console.log('User settings loaded:', data);
    console.log('API Key:', data.apiKey);
    
    setSettings(data);
    setLoading(false);
  };

  // Issue: No confirmation before deleting account
  const deleteAccount = async () => {
    await fetch('/api/account', {
      method: 'DELETE'
    });
    
    // Redirect without warning
    window.location.href = '/goodbye';
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const response = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    const updated = await response.json();
    setSettings(updated);
  };

  const toggleNotification = (type: keyof UserSettings['notifications']) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    };
    
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const changeTheme = (theme: UserSettings['theme']) => {
    if (!settings) return;
    
    updateSettings({ theme });
    setSettings({ ...settings, theme });
  };

  const regenerateApiKey = async () => {
    const response = await fetch('/api/settings/regenerate-key', {
      method: 'POST'
    });
    
    const data = await response.json();
    
    setSettings({
      ...settings!,
      apiKey: data.apiKey
    });
  };

  const copyApiKey = () => {
    if (settings?.apiKey) {
      navigator.clipboard.writeText(settings.apiKey);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!settings) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Failed to load settings</div>;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '28px' }}>Settings</h1>
      
      {/* Theme Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Appearance</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['light', 'dark', 'auto'] as const).map(theme => (
            <button
              key={theme}
              onClick={() => changeTheme(theme)}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: settings.theme === theme ? '#007bff' : 'white',
                color: settings.theme === theme ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Notifications Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Notifications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() => toggleNotification('email')}
            />
            <span>Email notifications</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={() => toggleNotification('push')}
            />
            <span>Push notifications</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.notifications.sms}
              onChange={() => toggleNotification('sms')}
            />
            <span>SMS notifications</span>
          </label>
        </div>
      </div>
      
      {/* Privacy Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Privacy</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.privacy.shareData}
              onChange={() => {
                const newPrivacy = {
                  ...settings.privacy,
                  shareData: !settings.privacy.shareData
                };
                updateSettings({ privacy: newPrivacy });
                setSettings({ ...settings, privacy: newPrivacy });
              }}
            />
            <span>Share usage data to improve the app</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={settings.privacy.publicProfile}
              onChange={() => {
                const newPrivacy = {
                  ...settings.privacy,
                  publicProfile: !settings.privacy.publicProfile
                };
                updateSettings({ privacy: newPrivacy });
                setSettings({ ...settings, privacy: newPrivacy });
              }}
            />
            <span>Make my profile public</span>
          </label>
        </div>
      </div>
      
      {/* API Key Section - Issue: Exposing sensitive data in UI */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>API Access</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '4px'
        }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Your API Key:
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              readOnly
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                flex: 1,
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={copyApiKey}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Copy
            </button>
            <button
              onClick={regenerateApiKey}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#ff9800',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Regenerate
            </button>
          </div>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Keep this key secret! Anyone with it can access your account.
          </p>
        </div>
      </div>
      
      {/* Preferences Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Preferences</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Language</label>
            <select
              value={settings.preferences.language}
              onChange={(e) => {
                const newPrefs = { ...settings.preferences, language: e.target.value };
                updateSettings({ preferences: newPrefs });
                setSettings({ ...settings, preferences: newPrefs });
              }}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Timezone</label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => {
                const newPrefs = { ...settings.preferences, timezone: e.target.value };
                updateSettings({ preferences: newPrefs });
                setSettings({ ...settings, preferences: newPrefs });
              }}
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div style={{ 
        padding: '20px', 
        border: '2px solid #f44336',
        borderRadius: '4px',
        backgroundColor: '#ffebee'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#d32f2f' }}>
          Danger Zone
        </h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={deleteAccount}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f44336',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
