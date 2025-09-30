<!--
  PlayerHistoryDisplay.vue - Spezialisierte Komponente für die Anzeige der Spielerhistorie
  Diese Komponente zeigt die letzten Spiele eines ausgewählten Players an
-->
<template>
  <div class="player-history-container">
    <ResponsiveContainer
      title="Spieler Historie"
      :manaCost="['white', 'blue', 'black', 'red', 'green']"
      cardType="Enchantment — Historie"
    >
      <!-- Spiele-Historie im Artwork-Bereich -->
      <template #artwork>
        <div v-if="recentGames.length > 0" class="games-history-display">
          <div class="games-grid">
            <div
              v-for="game in recentGames"
              :key="game.id"
              class="game-card"
              @click="selectGame(game)"
              title="Klicken für Details"
            >
              <div class="game-header">
                <div class="game-date">
                  <i class="fas fa-calendar-alt"></i>
                  <span>{{ formatDate(game.created_at) }}</span>
                </div>
                <div class="game-result" :class="getResultClass(game.result)">
                  <i :class="getResultIcon(game.result)"></i>
                  <span>{{ game.result || 'Offen' }}</span>
                </div>
              </div>
              <div class="game-details">
                <div class="deck-used">
                  <i class="fas fa-magic"></i>
                  <span>{{ game.deck }}</span>
                </div>
                <div class="opponents-count">
                  <i class="fas fa-users"></i>
                  <span>{{ game.totalPlayers - 1 }} Gegner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-games-placeholder">
          <div class="placeholder-content">
            <img
              src="@/assets/images/emptyTable.png"
              alt="Keine Spiele gefunden"
              class="empty-games-image"
            />
            <p class="no-games-text">Noch keine Spiele gespielt</p>
          </div>
        </div>
      </template>

      <!-- Spieler-Auswahl im Textbereich -->
      <template #textbox>
        <div class="player-selection-container">
          <div class="row mb-3">
            <div class="col-12">
              <label for="playerSelect" class="form-label">Spieler auswählen:</label>
              <select
                id="playerSelect"
                v-model="selectedPlayer"
                class="form-select"
                @change="loadPlayerHistory"
              >
                <option value="">-- Spieler wählen --</option>
                <option
                  v-for="player in availablePlayers"
                  :key="player.id"
                  :value="player.id"
                >
                  {{ player.name }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="selectedPlayer && recentGames.length > 0" class="statistics-summary">
            <div class="row">
              <div class="col-md-4">
                <div class="stat-card">
                  <i class="fas fa-gamepad stat-icon"></i>
                  <div class="stat-info">
                    <span class="stat-number">{{ recentGames.length }}</span>
                    <span class="stat-label">Spiele</span>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="stat-card">
                  <i class="fas fa-trophy stat-icon"></i>
                  <div class="stat-info">
                    <span class="stat-number">{{ winCount }}</span>
                    <span class="stat-label">Siege</span>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="stat-card">
                  <i class="fas fa-percentage stat-icon"></i>
                  <div class="stat-info">
                    <span class="stat-number">{{ winRate }}%</span>
                    <span class="stat-label">Winrate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Spielerhistorie...</span>
          </div>
        </div>
      </template>
    </ResponsiveContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ResponsiveContainer from '@/components/ResponsiveContainer.vue';
import { userApi, gameApi, participationApi } from '@/composables/api';
import type { User, Participation } from '@/types';

// Interface für die Spiele-Historie-Anzeige
interface GameHistoryItem {
  id: number;
  created_at: string;
  deck: string;
  result: string | null;
  totalPlayers: number;
}

// State Management
const selectedPlayer = ref<number | string>('');
const availablePlayers = ref<Array<User>>([]);
const recentGames = ref<Array<GameHistoryItem>>([]);
const loading = ref(false);

// Computed Properties
const winCount = computed(() => {
  return recentGames.value.filter(game => game.result === 'Sieg').length;
});

const winRate = computed(() => {
  const totalGames = recentGames.value.length;
  if (totalGames === 0) return 0;
  return Math.round((winCount.value / totalGames) * 100);
});

// Methods
const loadAvailablePlayers = async () => {
  try {
    const players = await userApi.getAll();
    availablePlayers.value = players;
  } catch (error) {
    console.error('Fehler beim Laden der Spieler:', error);
  }
};

const loadPlayerHistory = async () => {
  if (!selectedPlayer.value) {
    recentGames.value = [];
    return;
  }

  loading.value = true;
  try {
    // Lade alle Participations des Spielers
    const participations = await participationApi.getByUser(Number(selectedPlayer.value));

    // Lade die zugehörigen Spiele
    const gamePromises = participations.map(async (participation: Participation) => {
      const game = await gameApi.get(participation.game.id);
      const allParticipations = await participationApi.getByGame(game.id);

      return {
        id: game.id,
        created_at: game.createdAt,
        deck: participation.user_deck.deck.commander || 'Unbekanntes Deck',
        result: participation.is_winner ? 'Sieg' : 'Niederlage',
        totalPlayers: allParticipations.length
      };
    });

    const games = await Promise.all(gamePromises);

    // Sortiere nach Datum (neueste zuerst) und limitiere auf die letzten 10
    recentGames.value = games
      .sort((a: GameHistoryItem, b: GameHistoryItem) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

  } catch (error) {
    console.error('Fehler beim Laden der Spielerhistorie:', error);
    recentGames.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getResultClass = (result: string | null): string => {
  switch (result) {
    case 'Sieg':
      return 'result-win';
    case 'Niederlage':
      return 'result-loss';
    default:
      return 'result-unknown';
  }
};

const getResultIcon = (result: string | null): string => {
  switch (result) {
    case 'Sieg':
      return 'fas fa-trophy';
    case 'Niederlage':
      return 'fas fa-times-circle';
    default:
      return 'fas fa-question-circle';
  }
};

const selectGame = (game: GameHistoryItem) => {
  emit('game-selected', game);
};

// Events
const emit = defineEmits<{
  (e: 'game-selected', game: GameHistoryItem): void;
  (e: 'player-changed', playerId: number | string): void;
}>();

// Lifecycle
onMounted(() => {
  loadAvailablePlayers();
});
</script>

<style scoped>
.player-history-container {
  width: 100%;
  height: 100%;
}

.games-history-display {
  width: 100%;
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}

.games-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-card {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: 1px solid #3498db;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.4);
  border-color: #5dade2;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.game-date {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #bdc3c7;
  font-size: 0.9rem;
}

.game-result {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
  font-size: 0.9rem;
}

.result-win {
  color: #2ecc71;
}

.result-loss {
  color: #e74c3c;
}

.result-unknown {
  color: #f39c12;
}

.game-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.deck-used,
.opponents-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #ecf0f1;
  font-size: 0.85rem;
}

.deck-used i {
  color: #9b59b6;
}

.opponents-count i {
  color: #3498db;
}

.no-games-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  background: linear-gradient(135deg, #3c3c3c 0%, #2c2c2c 100%);
  width: 100%;
  height: 100%;
  padding: 20px;
}

.empty-games-image {
  max-width: 80%;
  max-height: 60%;
  width: auto;
  height: auto;
  object-fit: contain;
  opacity: 0.6;
  border-radius: 8px;
  margin-bottom: 15px;
}

.no-games-text {
  color: #bdc3c7;
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
}

.player-selection-container {
  width: 100%;
  padding: 15px;
}

.statistics-summary {
  margin-top: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
  border-radius: 8px;
  border: 1px solid #3498db;
}

.stat-icon {
  font-size: 1.5rem;
  color: #3498db;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ecf0f1;
}

.stat-label {
  font-size: 0.9rem;
  color: #bdc3c7;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #3498db;
  font-size: 1.1rem;
}

.form-label {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-select {
  background-color: #ecf0f1;
  border: 2px solid #bdc3c7;
  color: #2c3e50;
  font-weight: 500;
}

.form-select:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

/* Responsive Design */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .game-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .stat-card {
    margin-bottom: 10px;
  }
}
</style>
