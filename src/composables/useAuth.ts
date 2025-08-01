import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function useAuth() {
  const loggedIn = ref(localStorage.getItem('user') !== null);
  const router = useRouter();

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        localStorage.removeItem('user');
        loggedIn.value = false;
        router.push('/login');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error logging out', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return { loggedIn, logout };
}
