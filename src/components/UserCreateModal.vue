<!--
  UserCreateModal.vue - Modal zum Erstellen neuer Benutzer
  Diese Komponente ermöglicht es Administratoren, neue Benutzer anzulegen
-->
<template>
  <div v-if="isVisible" class="user-create-modal" @click.self="closeModal">
    <div class="modal-content-wrapper">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-user-plus"></i>
          Neuen Benutzer anlegen
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
              v-model="formData.name"
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

          <!-- Passwort -->
          <div class="form-group">
            <label for="userPassword" class="form-label">
              <i class="fas fa-lock"></i>
              Passwort
            </label>
            <input
              id="userPassword"
              v-model="formData.password"
              type="password"
              class="form-control"
              placeholder="Passwort eingeben (min. 6 Zeichen)"
              required
            />
            <small v-if="passwordError" class="text-danger">
              {{ passwordError }}
            </small>
          </div>

          <!-- Passwort bestätigen -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              <i class="fas fa-lock"></i>
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-control"
              placeholder="Passwort bestätigen"
              required
            />
          </div>

          <!-- Rolle (optional, Standard: USER) -->
          <div class="form-group">
            <label for="userRole" class="form-label">
              <i class="fas fa-shield-alt"></i>
              Rolle
            </label>
            <select
              id="userRole"
              v-model="formData.role"
              class="form-control"
            >
              <option :value="UserRole.USER">Benutzer</option>
              <option :value="UserRole.ADMIN">Administrator</option>
            </select>
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
          <i v-else class="fas fa-user-plus"></i>
          {{ submitting ? 'Wird erstellt...' : 'Benutzer anlegen' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { userApi } from '@/composables/api';
import { UserRole, type CreateUserRequest } from '@/types';

// Props
interface Props {
  isVisible: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
  userCreated: [];
}>();

// State
const formData = ref({
  name: '',
  email: '',
  password: '',
  role: UserRole.USER
});

const confirmPassword = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Computed
const passwordError = computed(() => {
  if (!formData.value.password) return '';
  if (formData.value.password.length < 6) {
    return 'Passwort muss mindestens 6 Zeichen lang sein';
  }
  if (formData.value.password !== confirmPassword.value) {
    return 'Passwörter stimmen nicht überein';
  }
  return '';
});

// Watchers
watch(() => props.isVisible, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

// Methods
const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: UserRole.USER
  };
  confirmPassword.value = '';
  errorMessage.value = '';
  successMessage.value = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const submitForm = async () => {
  // Validierung
  if (passwordError.value) {
    errorMessage.value = passwordError.value;
    return;
  }

  if (!formData.value.name || !formData.value.email || !formData.value.password) {
    errorMessage.value = 'Bitte alle Pflichtfelder ausfüllen';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Erstelle neuen User
    const createData: CreateUserRequest = {
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password
    };

    const newUser = await userApi.create(createData);

    // Update Rolle falls nicht USER
    if (formData.value.role !== UserRole.USER) {
      await userApi.updateRole(newUser.id, formData.value.role);
    }

    successMessage.value = 'Benutzer erfolgreich erstellt!';

    // Nach 1.5 Sekunden Modal schließen
    setTimeout(() => {
      emit('userCreated');
      closeModal();
    }, 1500);

  } catch (error) {
    console.error('Fehler beim Erstellen des Benutzers:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Fehler beim Erstellen des Benutzers';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Modal Overlay */
.user-create-modal {
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
  color: #2ecc71;
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
  background-color: #2ecc71;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #27ae60;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
