<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TheNavbar from '@/components/TheNavbar.vue';

// Temporäre Platzhalter bis die Komponenten erstellt sind
// import StatisticsDisplay from '@/components/StatisticsDisplay.vue';
// import StatisticsChart from '@/components/StatisticsChart.vue';

// Status
const isLoading = ref(false);
const errorMessage = ref('');

// Statistik-Daten
const stats = ref({
  totalGames: 0,
  winRate: 0,
  favoriteCommander: '',
  mostPlayedDeck: ''
});

// Daten laden
const fetchStats = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    // TODO: Implementiere API-Aufruf wenn Statistics API verfügbar ist
    // const data = await statisticsApi.getUserStats(currentUser.id);
    // stats.value = data;

  } catch (error) {
    console.error('Fehler beim Laden der Statistiken:', error);
    errorMessage.value = 'Fehler beim Laden der Statistiken';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="container-fluid">
    <div class="row justify-content-center mb-3">
      <div class="col-12">
        <TheNavbar />
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-12">
        <div class="statistics-container">
          <h2 class="text-center mb-4">Statistiken</h2>

          <!-- Fehlermeldung -->
          <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Ladeanzeige -->
          <div v-if="isLoading" class="text-center mb-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Lädt...</span>
            </div>
          </div>

          <!-- Statistik-Übersicht -->
          <div v-else class="stats-grid">
            <div class="stat-card">
              <h3>Gespielte Spiele</h3>
              <div class="stat-value">{{ stats.totalGames }}</div>
            </div>

            <div class="stat-card">
              <h3>Gewinnrate</h3>
              <div class="stat-value">{{ stats.winRate }}%</div>
            </div>

            <div class="stat-card">
              <h3>Lieblings-Commander</h3>
              <div class="stat-value">{{ stats.favoriteCommander || 'N/A' }}</div>
            </div>

            <div class="stat-card">
              <h3>Meistgespieltes Deck</h3>
              <div class="stat-value">{{ stats.mostPlayedDeck || 'N/A' }}</div>
            </div>
          </div>

          <!-- Platzhalter für zukünftige Komponenten -->
          <div class="mt-4">
            <p class="text-center text-muted">Weitere Statistiken folgen...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-container {
  background: url(../assets/background_textfeld.jpg);
  background-size: cover;
  background-position: center;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid black;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
