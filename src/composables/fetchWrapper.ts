import { API_URL } from '@/composables/api';
import { useTokenService } from '@/composables/tokenService';

const { getAccessToken, setAccessToken, clearAccessToken, isTokenExpired } = useTokenService();

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Helper: Redirect to login if not already there
const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Helper: Parse response with error handling
const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Helper: Create fetch options
const createFetchOptions = (methodType: string, token: string | null, body?: unknown) => ({
  method: methodType,
  headers: {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  },
  credentials: 'include' as RequestCredentials,
  body: body ? JSON.stringify(body) : undefined,
});

const refreshAccessToken = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  return data.accessToken;
};

const ensureFreshToken = async (): Promise<string | null> => {
  let token = getAccessToken();

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    if (isRefreshing && refreshPromise) {
      try {
        token = await refreshPromise;
        return token;
      } catch (error) {
        clearAccessToken();
        redirectToLogin();
        throw error;
      }
    }

    isRefreshing = true;
    refreshPromise = refreshAccessToken()
      .then(newToken => {
        setAccessToken(newToken);
        isRefreshing = false;
        refreshPromise = null;
        return newToken;
      })
      .catch(error => {
        isRefreshing = false;
        refreshPromise = null;
        clearAccessToken();
        redirectToLogin();
        throw error;
      });

    token = await refreshPromise;
  }

  return token;
};

export async function fetchWrapper(url: string, body?: unknown, methodType: string = 'GET'): Promise<unknown> {
  let token = await ensureFreshToken();

  try {
    const response = await fetch(`${API_URL}${url}`, createFetchOptions(methodType, token, body));

    if (response.status === 401) {
      try {
        isRefreshing = false;
        refreshPromise = null;

        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        token = newToken;

        const retryResponse = await fetch(`${API_URL}${url}`, createFetchOptions(methodType, token, body));

        if (!retryResponse.ok) {
          if (retryResponse.status === 401) {
            clearAccessToken();
            redirectToLogin();
            throw new Error('Session abgelaufen');
          }
          const error = await retryResponse.text();
          throw new Error(error || 'Network response was not ok');
        }

        return parseResponse(retryResponse);

      } catch (error) {
        clearAccessToken();
        redirectToLogin();
        throw error;
      }
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Network response was not ok');
    }

    return parseResponse(response);

  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
