<template>
  <div class="cardOfTheDay">
    <img
      alt="Mtg logo"
      class="logo"
      src="@/assets/mtg color.svg"
      :style="{ width: loginWidth + 'px', height: loginWidth/2 + 'px' }"
    />
  </div>
  <div class="cardType"><h1>Login</h1></div>
  <div class="login" ref="login">
    <form @submit.prevent="loginHandler">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="text" id="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" type="password" id="password" class="form-control" required>
      </div>
      <div class="mb-3 form-check">
        <input
          type="checkbox"
          class="form-check-input"
          id="rememberMe"
          v-model="rememberMe"
        >
        <label class="form-check-label" for="rememberMe">
          Angemeldet bleiben
        </label>
        <div class="form-text">
          Aktivieren Sie diese Option, um eingeloggt zu bleiben, auch wenn Sie den Browser schließen.
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Wird angemeldet...' : 'Login' }}
      </button>
      <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { useAuth } from '@/composables/useAuth';

export default {
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      loginWidth: 0,
      errorMessage: '',
      loading: false
    }
  },
  mounted() {
    const loginElement = this.$refs.login as HTMLElement
    this.$nextTick(() => {
      this.loginWidth = loginElement.clientWidth
    })
    this.loginWidth = loginElement.clientWidth
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      const loginElement = this.$refs.login as HTMLElement
      this.loginWidth = loginElement.clientWidth
    },
    async loginHandler() {
      this.errorMessage = '';
      this.loading = true;

      try {
        const { login } = useAuth();
        await login(
          { email: this.email, password: this.password },
          this.rememberMe
        );

        await new Promise(resolve => setTimeout(resolve, 100));
        this.$router.push('/');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        this.errorMessage = error.message || 'Fehler beim Anmelden';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Styles für das Login-Formular */
.login {
  background: url(../assets/background_textfeld.jpg);
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 600px;
  display: block;
  padding: 1rem;
  border: 1px solid black;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cardOfTheDay {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.cardType {
  background-color: aliceblue;
  border-radius: 4px;
  border: 1px solid black;
  padding: 1rem;
}

</style>
