// Simple secure storage using electron-store (or local storage fallback)
// We'll use window.backendAPI.settings to store encrypted.
// For simplicity, we'll use localStorage for now (not secure but works for dev).

const STORAGE_KEY = 'twitch_stream_key';

export const getStoredStreamKey = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const saveStreamKey = (key: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch (e) {
    console.error('Failed to save stream key', e);
  }
};