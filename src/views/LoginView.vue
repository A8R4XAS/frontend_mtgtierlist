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
    <form @submit.prevent="login">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="text" id="email" class="form-control">
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" type="password" id="password" class="form-control">
      </div>
      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>
    <RouterLink to="/signup" class="d-block mt-3 text-decoration-underline">Sign up?</RouterLink>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      email: '',
      password: '',
      loginWidth: 0
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
    async login() {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          }),
          credentials: 'include'
        })

        if (!response.ok) {
          console.log(response)
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        localStorage.setItem('user', JSON.stringify(data))
        this.$router.push('/')
      } catch (error) {
        console.error('Error logging in', error)
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
