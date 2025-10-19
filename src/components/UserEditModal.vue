<!--
  UserEditModal.vue - Modal zum Bearbeiten von Benutzerdaten
  Diese Komponente ermöglicht es Administratoren, Benutzerdaten zu bearbeiten
-->
<template>
  <div v-if="isVisible" class="user-edit-modal" @click.self="closeModal">
    <div class="modal-content-wrapper">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-user-edit"></i>
          <span v-if="originalUsername">
            {{ originalUsername }}
            <small class="user-id">(ID: {{ userId }})</small>
          </span>
          <span v-else>Benutzer bearbeiten</span>
        </h3>
        <button type="button" class="btn-close-modal" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <!-- Name -->
          <div class="form-group">
            <label for="userName" class="form-label">
              <i class="fas fa-user"></i>
              Benutzername
            </label>
            <input
              id="userName"
              v-model="formData.username"
              type="text"
              class="form-control"
              placeholder="Benutzername eingeben"
              required
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="userEmail" class="form-label">
              <i class="fas fa-envelope"></i>
              E-Mail
            </label>
            <input
              id="userEmail"
              v-model="formData.email"
              type="email"
              class="form-control"
              placeholder="E-Mail eingeben"
              required
            />
          </div>

          <!-- Rolle (nur für Admins) -->
          <div class="form-group">
            <label for="userRole" class="form-label">
              <i class="fas fa-shield-alt"></i>
              Rolle
            </label>
            <select
              id="userRole"
              v-model="formData.role"
              class="form-control"
              required
            >
              <option :value="UserRole.USER">Benutzer</option>
              <option :value="UserRole.ADMIN">Administrator</option>
            </select>
          </div>

          <!-- Passwort ändern (optional) -->
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i>
              Neues Passwort (optional)
            </label>
            <input
              v-model="newPassword"
              type="password"
              class="form-control"
              placeholder="Leer lassen, um Passwort nicht zu ändern"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i>
              Passwort bestätigen
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control"
              placeholder="Passwort bestätigen"
              :disabled="!newPassword"
            />
            <small v-if="passwordError" class="text-danger">
              {{ passwordError }}
            </small>
          </div>
        </form>

        <div v-if="errorMessage" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="closeModal"
          :disabled="submitting"
        >
          Abbrechen
        </button>

        <button
          type="button"
          class="btn btn-primary"
          @click="submitForm"
          :disabled="submitting || !!passwordError"
        >
          <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ submitting ? 'Wird gespeichert...' : 'Speichern' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { userApi } from '@/composables/api';
import { UserRole, type User, type UpdateUserRequest } from '@/types';

// Props
interface Props {
  isVisible: boolean;
  userId: number | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
  userUpdated: [];
}>();

// State
const formData = ref({
  username: '',
  email: '',
  role: UserRole.USER
});

const originalUsername = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Computed
const passwordError = computed(() => {
  if (!newPassword.value) return '';
  if (newPassword.value.length < 6) {
    return 'Passwort muss mindestens 6 Zeichen lang sein';
  }
  if (newPassword.value !== confirmPassword.value) {
    return 'Passwörter stimmen nicht überein';
  }
  return '';
});

// Watchers
watch(() => props.isVisible, async (newValue) => {
  if (newValue && props.userId) {
    await loadUserData();
  } else {
    resetForm();
  }
});

// Methods
const loadUserData = async () => {
  if (!props.userId) return;

  try {
    const user: User = await userApi.get(props.userId);
    originalUsername.value = user.name;
    formData.value = {
      username: user.name,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    console.error('Fehler beim Laden der Benutzerdaten:', error);
    errorMessage.value = 'Fehler beim Laden der Benutzerdaten';
  }
};

const resetForm = () => {
  originalUsername.value = '';
  formData.value = {
    username: '',
    email: '',
    role: UserRole.USER
  };
  newPassword.value = '';
  confirmPassword.value = '';
  errorMessage.value = '';
  successMessage.value = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const submitForm = async () => {
  if (!props.userId) return;

  // Validierung
  if (passwordError.value) {
    errorMessage.value = passwordError.value;
    return;
  }

  submitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Update User-Daten
    const updateData: UpdateUserRequest = {
      username: formData.value.username,
      email: formData.value.email
    };

    console.log('Update Data:', updateData);
    await userApi.update(props.userId, updateData);

    // Update Passwort falls angegeben
    if (newPassword.value) {
      await userApi.changePassword(props.userId, newPassword.value);
    }

    // Update Rolle
    if (formData.value.role) {
      await userApi.updateRole(props.userId, formData.value.role);
    }

    successMessage.value = 'Benutzer erfolgreich aktualisiert!';

    // Nach 1.5 Sekunden Modal schließen
    setTimeout(() => {
      emit('userUpdated');
      closeModal();
    }, 1500);

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzers:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Benutzers';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Modal Overlay */
.user-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(3px);
}

/* Modal Content */
.modal-content-wrapper {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #34495e;
}

.modal-title {
  color: #ecf0f1;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
}

.modal-title i {
  color: #3498db;
}

.modal-title .user-id {
  color: #95a5a6;
  font-size: 0.8rem;
  font-weight: 400;
  margin-left: 8px;
}

.btn-close-modal {
  background: none;
  border: none;
  color: #95a5a6;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  color: #ecf0f1;
  background-color: rgba(231, 76, 60, 0.2);
}

/* Modal Body */
.modal-body {
  padding: 20px;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  color: #ecf0f1;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.form-label i {
  color: #3498db;
  width: 20px;
}

.form-control {
  width: 100%;
  padding: 12px;
  background-color: rgba(44, 62, 80, 0.6);
  border: 2px solid #34495e;
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  background-color: rgba(44, 62, 80, 0.8);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-control::placeholder {
  color: #7f8c8d;
}

.form-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

select.form-control {
  cursor: pointer;
}

select.form-control option {
  background-color: #2c3e50;
  color: #ecf0f1;
}

/* Alerts */
.alert {
  padding: 12px 15px;
  border-radius: 6px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-danger {
  background-color: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  color: #ecf0f1;
}

.alert-success {
  background-color: rgba(46, 204, 113, 0.2);
  border: 1px solid #2ecc71;
  color: #ecf0f1;
}

.text-danger {
  color: #e74c3c;
  font-size: 0.85rem;
  display: block;
  margin-top: 5px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #34495e;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: #2c3e50;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #7f8c8d;
}

.btn-primary {
  background-color: #3498db;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
