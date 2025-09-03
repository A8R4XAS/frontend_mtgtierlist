<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="signup">
          <h2>Sign Up</h2>
          <form @submit.prevent="signup">
            <div class="mb-3">
              <label for="name" class="form-label">Name:</label>
              <input type="text" v-model="name" id="name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email:</label>
              <input type="email" v-model="email" id="email" class="form-control" :class="{ 'is-invalid': error }" required />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password:</label>
              <input type="password" v-model="password" id="password" class="form-control" required />
            </div>
            <!-- Error Box mit Transition -->
            <transition name="fade">
              <div v-if="error" class="alert alert-danger mt-3" role="alert">
                Username, E-Mail oder Passwort ungültig!
              </div>
            </transition>
            <button type="submit" class="btn btn-primary w-100">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      error: false,
      timeoutId: null as ReturnType<typeof setTimeout> | null
    };
  },
  methods: {
    async signup() {
      this.error = false;
      if(this.timeoutId) clearTimeout(this.timeoutId);
      try {
        const response = await fetch('http://localhost:3001/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password
          }),
          credentials: 'include'
        });

        if (response.ok) {
          this.$router.push('/');
        } else if (response.status === 409) {
          this.error = true;
          this.timeoutId = setTimeout(() => {
            this.error = false;
          }, 3000);
        } else {
          this.error = true;
          this.timeoutId = setTimeout(() => {
            this.error = false;
          }, 3000);
        }
      } catch (error) {
        console.error('Error during signup:', error);
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
/* einfache Fade-Animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
