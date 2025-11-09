import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWrapper } from '@/composables/fetchWrapper';
import { useTokenService } from '@/composables/tokenService';

const { setAccessToken, clearAccessToken, getAccessToken, isTokenExpired } = useTokenService();

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  accessToken: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// User-Daten aus JWT-Token extrahieren
const decodeUserFromToken = (): User | null => {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId || parseInt(payload.sub),  // userId oder sub (als number)
      name: payload.name || '',                      // name ist nicht im JWT
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export function useAuth() {
  const router = useRouter();
  const loggedIn = ref(getAccessToken() !== null && !isTokenExpired(getAccessToken() || ''));

  // Login mit JWT
  const login = async (credentials: LoginCredentials, rememberMe: boolean = false) => {
    try {
      const response = await fetchWrapper('/auth/login',
        { ...credentials, rememberMe },
        'POST'
      ) as LoginResponse;

      // Access Token speichern (in sessionStorage)
      setAccessToken(response.accessToken);

      loggedIn.value = true;
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetchWrapper('/auth/logout', {}, 'POST');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAccessToken();
      loggedIn.value = false;
      router.push('/login');
    }
  };

  // Session Check
  const checkSession = async (): Promise<boolean> => {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      loggedIn.value = false;
      return false;
    }

    try {
      await fetchWrapper('/auth/validate-role', undefined, 'GET');
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      clearAccessToken();
      loggedIn.value = false;
      return false;
    }
  };

  // Aktuellen User holen (aus JWT-Token)
  const getCurrentUser = (): User | null => {
    return decodeUserFromToken();
  };

  return {
    loggedIn,
    logout,
    checkSession,
    login,
    getCurrentUser
  };
}

