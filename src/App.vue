<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter, useRoute } from 'vue-router';

const { loggedIn, checkSession } = useAuth();
const router = useRouter();
const route = useRoute();

let sessionCheckInterval: number | null = null;

const startSessionCheck = () => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }

  if (!loggedIn.value) {
    return;
  }

  // Initialer Check
  checkSession().then(isValid => {
    if (!isValid && route.meta.requiresAuth) {
      router.push('/login');
    }
  });

  // Periodischer Check alle 5 Minuten
  sessionCheckInterval = window.setInterval(async () => {
    if (loggedIn.value) {
      const isValid = await checkSession();
      if (!isValid && route.meta.requiresAuth) {
        alert('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
        router.push('/login');
      }
    } else {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
      }
    }
  }, 5 * 60 * 1000);
};

watch(loggedIn, (newValue) => {
  if (newValue) {
    startSessionCheck();
  } else {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }
  }
});

onMounted(() => {
  startSessionCheck();
});

onUnmounted(() => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }
});
</script>

<template>
  <!--
  <header>
     <img alt="Mtg logo" class="logo" src="@/assets/mtg color.svg" width="243" height="180" />
  </header>
-->

  <main>
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-0"></div>
        <div class="col-12">
          <RouterView /> <!-- Diese Zeile stellt sicher, dass die 404-Seite angezeigt wird -->
        </div>
        <div class="col-0"></div>
      </div>
    </div>
  </main>
</template>



<style scoped>

header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}
</style>
