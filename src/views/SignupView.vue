<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchWrapper } from '@/composables/fetchWrapper';
import { useTokenService } from '@/composables/tokenService';

// Router
const router = useRouter();

// Token Service
const { setAccessToken } = useTokenService();

// Formularfelder
const name = ref('');
const email = ref('');
const password = ref('');

// Status
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Formular absenden
const signup = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    // Validierung
    if (!name.value.trim() || !email.value.trim() || !password.value) {
      errorMessage.value = 'Bitte füllen Sie alle Felder aus.';
      return;
    }

    if (password.value.length < 6) {
      errorMessage.value = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
      return;
    }

    if (!email.value.includes('@')) {
      errorMessage.value = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      return;
    }

    // Benutzer registrieren
    const response = await fetchWrapper('/auth/signup', {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value
    }, 'POST') as { accessToken: string };

    // Access Token speichern (User-Daten sind im Token enthalten)
    if (response.accessToken) {
      setAccessToken(response.accessToken);
    }

    // Erfolgsmeldung und Weiterleitung
    successMessage.value = 'Registrierung erfolgreich!';
    setTimeout(() => {
      router.push('/');
    }, 1500);

  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    errorMessage.value = 'Die Registrierung ist fehlgeschlagen. Bitte versuchen Sie es später erneut.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container-fluid">
    <div class="row justify-content-center mb-3">
      <div class="col-md-9">
        <div class="signup">
          <h2 class="text-center mb-4">Registrierung</h2>

          <!-- Fehlermeldung -->
          <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Erfolgsmeldung -->
          <div v-if="successMessage" class="alert alert-success mb-3" role="alert">
            {{ successMessage }}
          </div>

          <form @submit.prevent="signup" class="needs-validation" novalidate>
            <div class="mb-3">
              <label for="name" class="form-label">Name:</label>
              <input
                type="text"
                v-model="name"
                id="name"
                class="form-control"
                :class="{ 'is-invalid': errorMessage && !name }"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">E-Mail:</label>
              <input
                type="email"
                v-model="email"
                id="email"
                class="form-control"
                :class="{ 'is-invalid': errorMessage && !email }"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Passwort:</label>
              <input
                type="password"
                v-model="password"
                id="password"
                class="form-control"
                :class="{ 'is-invalid': errorMessage && !password }"
                required
                :disabled="isLoading"
                minlength="6"
              />
              <div class="form-text">
                Mindestens 6 Zeichen
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary signup-btn"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isLoading ? 'Wird registriert...' : 'Registrieren' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup {
  background: url(../assets/background_textfeld.jpg);
  background-size: cover;
  background-position: center;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: larger;
  color: black;
  max-width: 600px;
}

.signup-btn {
  width: 50%;
  display: block;
  margin: 1.5rem auto 0;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.signup-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.signup-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.alert {
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-text {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Validierungsstile */
.is-invalid {
  border-color: #dc3545;
}

.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
</style>
