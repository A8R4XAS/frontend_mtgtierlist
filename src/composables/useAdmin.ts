import { ref } from 'vue';
import { UserRole } from '@/types';
import { authApi } from './api';

export function useAdmin() {
  const isAdmin = ref(false);

  const validateAdminRole = async () => {
    try {
      const role = await authApi.validateRole();
      //
      isAdmin.value = role === UserRole.ADMIN;
    } catch (error) {
      console.error('Error validating admin role:', error);
      isAdmin.value = false;
    }
  };

  // Validiere die Rolle beim Mounting der Komponente
  validateAdminRole();

  return {
    isAdmin,
    validateAdminRole // Exportiere die Funktion, falls wir die Rolle manuell neu validieren müssen
  };
}
