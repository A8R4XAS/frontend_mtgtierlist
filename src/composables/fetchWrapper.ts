import { API_URL } from '@/composables/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWrapper(url:string, body?:any, methodType: string = 'GET') {

  try {
    const response = await fetch(`${API_URL}${url}`, {
      method: methodType,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Network response was not ok');
    }

    return await response.json();

  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Fetch error');
  }

}
