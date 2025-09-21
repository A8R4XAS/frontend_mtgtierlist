<script setup lang="ts">
import TheGameForm from '@/components/TheGameForm.vue';
import TheDeckForm from '@/components/TheDeckForm.vue';
import { useAuth } from '@/composables/useAuth';
import { onMounted, ref } from 'vue';
import type { User } from '@/types';
import { UserRole } from '@/types';
import { userApi } from '@/composables/api';
import { useAdmin } from '@/composables/useAdmin';

const { loggedIn, logout } = useAuth();

// Benutzerdaten
const currentUser = ref<Partial<User>>({
  name: '',
  email: '',
  role: UserRole.USER
});

// Admin-Check aus dem Composable
const { isAdmin } = useAdmin();

const showGamePopup = ref(false);
const openGamePopup = () => { showGamePopup.value = true; };
const closeGamePopup = () => { showGamePopup.value = false; };

const showDeckPopup = ref(false);
const openDeckPopup = () => { showDeckPopup.value = true; };
const closeDeckPopup = () => { showDeckPopup.value = false; };

// Benutzer laden
const fetchUser = async () => {
  try {
    const localUser = localStorage.getItem('user');
    if (!localUser) return;

    const userData = JSON.parse(localUser);
    if (!userData?.id) return;

    const apiUser = await userApi.get(userData.id);
    if (apiUser) {
      currentUser.value = apiUser;
    }
  } catch (error) {
    console.error('Fehler beim Laden der Benutzerdaten:', error);
  }
};

// Komponente initialisieren
onMounted(() => {
  if (loggedIn.value) {
    fetchUser();
  }
});
</script>

<template>
  <div class="triple-border">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand">{{ currentUser.name }}</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <button class="nav-link btn" @click="openGamePopup">+ Neues Spiel</button>
            </li>
            <li class="nav-item">
              <button class="nav-link btn" @click="openDeckPopup">+ Deck</button>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/profile">Profil</RouterLink>
            </li>
            <li class="nav-item" v-if="isAdmin">
              <RouterLink class="nav-link" to="/player">Spieler</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/decks">Decks</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/deck-browser">Deck Browser</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/statistics">Statistiken</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/ratings">Bewertungen</RouterLink>
            </li>
            <li class="nav-item" v-if="!loggedIn">
              <RouterLink class="nav-link" to="/login">Login</RouterLink>
            </li>
            <li class="nav-item" v-if="!loggedIn">
              <RouterLink class="nav-link" to="/signup">Sign Up</RouterLink>
            </li>
            <li class="nav-item" v-if="loggedIn">
              <button class="nav-link btn" @click="logout">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div v-if="showGamePopup" class="popup">
      <div class="popup-content">
        <button type="button" class="btn-close btn-close-circle" aria-label="Close" @click="closeGamePopup"></button>
        <TheGameForm />
      </div>
    </div>
    <div v-if="showDeckPopup" class="popup">
      <div class="popup-content">
        <button type="button" class="btn-close btn-close-circle" aria-label="Close" @click="closeDeckPopup"></button>
        <TheDeckForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ul {
  text-align: right;
}

.navbar {
  border-radius: 3px;
  border: 1px solid black;
  background: url(../assets/fullArt_Waste_head.jpg) no-repeat center center fixed, var(--color-background);
  background-size: cover;
  z-index: 1; /* Niedrigerer z-index für die darunter liegenden Elemente */
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Höherer z-index für das Popup */
}

.popup-content {
  background-color: #978B73;
  padding: 1px;
  border-radius: 5px;
  position: relative;
  box-shadow: 0 4px 25px #978B73;
  z-index: 1001; /* Höherer z-index für den Popup-Inhalt */
}


.btn-close-circle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: grey;
  border: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 1;
}

.btn-close-circle::before {
  font-size: 20px;
  color: #000;
}
</style>
