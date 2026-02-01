/**
 * User preferences management
 */

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'user_preferences';

/**
 * Get user preferences from localStorage
 * @returns User preferences or defaults
 */
export function getPreferences(): UserPreferences {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as UserPreferences;
    } catch {
      return getDefaultPreferences();
    }
  }
  return getDefaultPreferences();
}

/**
 * Save user preferences to localStorage
 * @param preferences - Preferences to save
 */
export function savePreferences(preferences: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

/**
 * Get default preferences
 */
function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'light',
    language: 'en',
    notificationsEnabled: true,
  };
}

/**
 * Save user session (SECURITY ISSUE: storing token in localStorage)
 * @param token - Auth token to save
 */
export function saveAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}
