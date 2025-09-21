<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import TheNavbar from '@/components/TheNavbar.vue';
import type { Deck } from '@/types';
import { deckApi } from '@/composables/api';

// Status
const isLoading = ref(false);
const errorMessage = ref('');

// Filter-Status
const searchQuery = ref('');
const selectedTempo = ref('');
const sortBy = ref('commander');
const sortOrder = ref<'asc' | 'desc'>('asc');

// Daten
const decks = ref<Deck[]>([]);

// Filter-Optionen
const tempoOptions = [
  'Turn 0',
  'AGGRO',
  'Aggro to Midgame',
  'MID-GAME',
  'Midgame to Lategame',
  'LATE-GAME',
  'Wo WinCon?'
];

// Daten laden
const fetchDecks = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    const allDecks = await deckApi.getAll();
    decks.value = allDecks;

  } catch (error) {
    console.error('Fehler beim Laden der Decks:', error);
    errorMessage.value = 'Fehler beim Laden der Decks';
  } finally {
    isLoading.value = false;
  }
};

// Gefilterte Decks berechnen
const filteredDecks = computed(() => {
  let result = [...decks.value];

  // Suche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(deck =>
      deck.commander.toLowerCase().includes(query) ||
      deck.thema?.toLowerCase().includes(query) ||
      deck.gameplan?.toLowerCase().includes(query)
    );
  }

  // Tempo Filter
  if (selectedTempo.value) {
    result = result.filter(deck => deck.tempo === selectedTempo.value);
  }

  // Sortierung
  result.sort((a, b) => {
    const aValue = a[sortBy.value as keyof Deck];
    const bValue = b[sortBy.value as keyof Deck];

    if (!aValue || !bValue) return 0;

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });

  return result;
});

// Sortierung umschalten
const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
};

onMounted(() => {
  fetchDecks();
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
        <div class="deck-browser">
          <h2 class="text-center mb-4">Deck Browser</h2>

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
                  placeholder="Nach Commander, Thema oder Gameplan suchen..."
                />
              </div>
              <div class="col-md-4">
                <select v-model="selectedTempo" class="form-select">
                  <option value="">Alle Tempos</option>
                  <option v-for="tempo in tempoOptions" :key="tempo" :value="tempo">
                    {{ tempo }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <button class="btn btn-secondary w-100" @click="fetchDecks">
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

          <!-- Deck-Liste -->
          <div v-else-if="filteredDecks.length > 0" class="deck-list">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th @click="toggleSort('commander')" style="cursor: pointer">
                    Commander
                    <span v-if="sortBy === 'commander'">
                      {{ sortOrder === 'asc' ? '▲' : '▼' }}
                    </span>
                  </th>
                  <th @click="toggleSort('thema')" style="cursor: pointer">
                    Thema
                    <span v-if="sortBy === 'thema'">
                      {{ sortOrder === 'asc' ? '▲' : '▼' }}
                    </span>
                  </th>
                  <th @click="toggleSort('tempo')" style="cursor: pointer">
                    Tempo
                    <span v-if="sortBy === 'tempo'">
                      {{ sortOrder === 'asc' ? '▲' : '▼' }}
                    </span>
                  </th>
                  <th @click="toggleSort('tier')" style="cursor: pointer">
                    Tier
                    <span v-if="sortBy === 'tier'">
                      {{ sortOrder === 'asc' ? '▲' : '▼' }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="deck in filteredDecks" :key="deck.id">
                  <td>{{ deck.commander }}</td>
                  <td>{{ deck.thema || '-' }}</td>
                  <td>{{ deck.tempo || '-' }}</td>
                  <td>{{ deck.tier || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Keine Ergebnisse -->
          <div v-else class="text-center">
            <p class="text-muted">Keine Decks gefunden</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck-browser {
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

.deck-list {
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

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .deck-browser {
    padding: 1rem;
  }

  .filter-section {
    padding: 1rem;
  }
}
</style>
