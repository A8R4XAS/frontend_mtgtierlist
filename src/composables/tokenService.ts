import { ref } from 'vue';

const SESSION_STORAGE_KEY = 'mtg_access_token';

// Access Token in sessionStorage speichern für Persistence über Page Reloads
const accessToken = ref<string | null>(
  typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_STORAGE_KEY) : null
);

export function useTokenService() {
  const setAccessToken = (token: string) => {
    accessToken.value = token;
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  };

  const getAccessToken = (): string | null => {
    // Falls ref null, versuche aus sessionStorage zu laden
    if (!accessToken.value && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        accessToken.value = stored;
      }
    }
    return accessToken.value;
  };

  const clearAccessToken = () => {
    accessToken.value = null;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // In Millisekunden
      return Date.now() >= expiry;
    } catch {
      return true;
    }
  };

  return {
    setAccessToken,
    getAccessToken,
    clearAccessToken,
    isTokenExpired,
  };
}
