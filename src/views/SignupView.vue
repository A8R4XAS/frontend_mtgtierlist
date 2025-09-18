<template>
  <div class="container-fluid">
    <div class="row justify-content-center mb-3">
      <div class="col-md-9">
        <div class="signup">
          <h2>Sign Up</h2>
          <form @submit.prevent="signup">
            <div class="mb-3">
              <label for="name" class="form-label">Name:</label>
              <input type="text" v-model="name" id="name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email:</label>
              <input type="email" v-model="email" id="email" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password:</label>
              <input type="password" v-model="password" id="password" class="form-control" required />
            </div>
              <button type="submit" class="btn btn-primary signup-btn">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { fetchWrapper } from '@/composables/fetchWrapper';

export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    async signup() {
      try {
        await fetchWrapper('/auth/signup', { name: this.name, email: this.email, password: this.password }, 'POST');
        await new Promise(resolve => setTimeout(resolve, 100)); // kurze Pause für Session-Cookie
        this.$router.push('/');
      } catch  {
        this.errorMessage = 'Fehler beim Signup';
      }
    }
  }
};
</script>

<style scoped>
/* Styles für das Signup-Formular */
.signup {
  background: url(../assets/background_textfeld.jpg);
  background-size: cover;
  background-position: center;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid black;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: larger;
  color: black;
}

.signup-btn {
  width: 33%;
  display: block;
  margin: 0 auto;
}

</style>
