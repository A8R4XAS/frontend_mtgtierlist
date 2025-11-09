<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import TheNavbar from '@/components/TheNavbar.vue';
import type { Rating } from '@/types';
import { ratingApi } from '@/composables/api';
import { useAuth } from '@/composables/useAuth';

// Status
const isLoading = ref(false);
const errorMessage = ref('');

// Filter
const filterType = ref<'all' | 'given' | 'received'>('all');
const searchQuery = ref('');

// Daten
const ratings = ref<Rating[]>([]);

// Benutzerdaten aus JWT Token
const { getCurrentUser } = useAuth();
const currentUser = computed(() => getCurrentUser());

// Daten laden
const fetchRatings = async () => {
  if (!currentUser.value?.id) return;

  try {
    isLoading.value = true;
    errorMessage.value = '';

    const userRatings = await ratingApi.getByRater(currentUser.value.id);
    ratings.value = userRatings;

  } catch (error) {
    console.error('Fehler beim Laden der Bewertungen:', error);
    errorMessage.value = 'Fehler beim Laden der Bewertungen';
  } finally {
    isLoading.value = false;
  }
};

// Gefilterte Bewertungen
const filteredRatings = computed(() => {
  let result = [...ratings.value];

  // Filter nach Typ
  if (filterType.value !== 'all') {
    result = result.filter(rating => {
      if (filterType.value === 'given') {
        return rating.rater.id === currentUser.value?.id;
      } else {
        return rating.participation.user_deck.user.id === currentUser.value?.id;
      }
    });
  }

  // Suche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(rating =>
      rating.participation.user_deck.deck.commander.toLowerCase().includes(query) ||
      rating.participation.user_deck.user.name.toLowerCase().includes(query)
    );
  }

  return result;
});

onMounted(() => {
  fetchRatings();
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
        <div class="ratings-container">
          <h2 class="text-center mb-4">Bewertungen</h2>

          <!-- Fehlermeldung -->
          <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Filter-Bereich -->
          <div class="filter-section mb-4">
            <div class="row g-3">
              <div class="col-md-6">
                <input
                  type="text"
                  v-model="searchQuery"
                  class="form-control"
                  placeholder="Nach Commander oder Spieler suchen..."
                />
              </div>
              <div class="col-md-4">
                <select v-model="filterType" class="form-select">
                  <option value="all">Alle Bewertungen</option>
                  <option value="given">Abgegebene Bewertungen</option>
                  <option value="received">Erhaltene Bewertungen</option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-secondary w-100" @click="fetchRatings">
                  Aktualisieren
                </button>
              </div>
            </div>
          </div>

          <!-- Ladeanzeige -->
          <div v-if="isLoading" class="text-center mb-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Lädt...</span>
            </div>
          </div>

          <!-- Bewertungsliste -->
          <div v-else-if="filteredRatings.length > 0" class="ratings-list">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Commander</th>
                    <th>Spieler</th>
                    <th>Bewerter</th>
                    <th>Bewertung</th>
                    <th>Spiel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rating in filteredRatings" :key="rating.id">
                    <td>{{ rating.participation.user_deck.deck.commander }}</td>
                    <td>{{ rating.participation.user_deck.user.name }}</td>
                    <td>{{ rating.rater.name }}</td>
                    <td>
                      <div class="rating-value">{{ rating.value }}</div>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary">
                        Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Keine Bewertungen -->
          <div v-else class="text-center">
            <p class="text-muted">Keine Bewertungen gefunden</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ratings-container {
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

.filter-section {
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.ratings-list {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.rating-value {
  font-weight: bold;
  text-align: center;
  min-width: 2.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: inline-block;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .ratings-container {
    padding: 1rem;
  }

  .filter-section {
    padding: 1rem;
  }
}
</style>
