import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWrapper } from '@/composables/fetchWrapper';

export function useAuth() {
  const loggedIn = ref(localStorage.getItem('user') !== null);
  const router = useRouter();

  const logout = async () => {
    try {
      await fetchWrapper('/auth/logout',{}, 'POST');
      localStorage.removeItem('user');
      loggedIn.value = false;
      router.push('/login');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return { loggedIn, logout };
}
