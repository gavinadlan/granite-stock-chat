// Dark mode utility functions
const STORAGE_KEY = 'user_settings';

export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
}

export function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return { notifications: true, darkMode: false };
}

export function applyDarkMode(darkMode: boolean) {
  const root = document.documentElement;
  if (darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function initializeDarkMode() {
  const settings = loadSettings();
  applyDarkMode(settings.darkMode);
}

