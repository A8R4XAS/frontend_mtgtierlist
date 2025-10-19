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
      <!-- Spieler-Statistiken Graph im Artwork-Bereich -->
      <template #artwork>
        <div class="player-stats-container">
          <div v-if="currentUser && recentGames.length > 0" class="stats-graph-wrapper">
            <GraphComponent
              title="S/N Verlauf"
              titleIcon="fas fa-chart-line"
              :labels="chartLabels"
              :datasets="chartDatasets"
              type="line"
            />
          </div>

          <div v-else-if="loading" class="loading-history">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Lade Spielerhistorie...</span>
          </div>

          <div v-else class="no-data-message">
            <i class="fas fa-chart-line"></i>
            <p>Keine Spielerdaten verfügbar</p>
          </div>
        </div>
      </template>

      <!-- Spiele-Historie im Textbereich -->
      <template #textbox>
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
                <div class="opponents-info">
                  <div v-if="game.opponents.length > 0" class="opponents-list">
                    <div
                      v-for="opponent in game.opponents.slice(0, 2)"
                      :key="opponent.name"
                      class="opponent-item"
                      :title="`${opponent.name} - ${opponent.deck}`"
                    >
                      <span class="opponent-name">{{ opponent.name }}</span>
                      <span class="opponent-deck">{{ opponent.deck }}</span>
                    </div>
                    <div v-if="game.opponents.length > 2" class="more-opponents">
                      +{{ game.opponents.length - 2 }} weitere
                    </div>
                  </div>
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
    </ResponsiveContainer>

    <!-- GameWinnerModal Komponente -->
    <GameWinnerModal
      :isVisible="!!selectedGame"
      :game="selectedGame"
      :participants="gameParticipants"
      :loadingParticipants="loadingParticipants"
      @close="closeWinnerModal"
      @winnerSelected="handleWinnerSelected"
      @ratingsSubmitted="handleRatingsSubmitted"
      @winnerAndRatingsSubmitted="handleWinnerAndRatingsSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ResponsiveContainer from '@/components/ResponsiveContainer.vue';
import GameWinnerModal from '@/components/GameWinnerModal.vue';
import GraphComponent from '@/components/GraphComponent.vue';
import { participationApi, gameApi, statisticsApi } from '@/composables/api';
import { useAuth } from '@/composables/useAuth';
import type { Participation } from '@/types';
import { eventBus } from '@/composables/eventBus';

// Interface für die Spiele-Historie-Anzeige
interface GameHistoryItem {
  id: number;
  created_at: string;
  deck: string;
  result: string | null;
  totalPlayers: number;
  opponents: Array<{
    name: string;
    deck: string;
  }>;
}

// State Management
const currentUser = ref<{id: number, name: string} | null>(null);
const recentGames = ref<Array<GameHistoryItem>>([]);
const loading = ref(false);

// Chart Data State
const chartLabels = ref<string[]>([]);
const chartDatasets = ref<Array<{
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
}>>([]);

// Modal State
const selectedGame = ref<GameHistoryItem | null>(null);
const gameParticipants = ref<Array<Participation>>([]);
const loadingParticipants = ref(false);

// Auth Composable
useAuth();

// Load Chart Data from API
const loadChartData = async () => {
  if (!currentUser.value) {
    // Fallback Demo-Daten wenn kein User eingeloggt
    chartLabels.value = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
    chartDatasets.value = [
      {
        label: 'Siege',
        data: [3, 5, 2, 7, 4, 6],
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderColor: '#27ae60'
      },
      {
        label: 'Niederlagen',
        data: [2, 3, 4, 2, 5, 3],
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderColor: '#e74c3c'
      }
    ];
    return;
  }

  try {
    const chartData = await statisticsApi.getUserChartData(currentUser.value.id);
    chartLabels.value = chartData.labels;
    chartDatasets.value = chartData.datasets;
  } catch (error) {
    console.error('Fehler beim Laden der Chart-Daten:', error);
    // Fallback zu Demo-Daten bei Fehlern
    chartLabels.value = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
    chartDatasets.value = [
      {
        label: 'Siege',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderColor: '#27ae60'
      },
      {
        label: 'Niederlagen',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderColor: '#e74c3c'
      }
    ];
  }
};

// Methods
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr);
      return currentUser.value;
    } catch (error) {
      console.error('Fehler beim Parsen der User-Daten:', error);
    }
  }
  return null;
};

const loadPlayerHistory = async () => {
  if (!currentUser.value) {
    recentGames.value = [];
    return;
  }

  loading.value = true;
  try {
    // Lade alle Participations des eingeloggten Spielers
    const participations = await participationApi.getByUser(currentUser.value.id);

    // Lade die zugehörigen Spiele
    const gamePromises = participations.map(async (participation: Participation) => {
      const game = await gameApi.get(participation.game.id);
      const allParticipations = await participationApi.getByGame(game.id);

      // Filtere Gegner heraus (alle außer dem aktuellen Spieler)
      const opponents = allParticipations
        .filter(p => p.user_deck.user.id !== currentUser.value!.id)
        .map(p => ({
          name: p.user_deck.user.name,
          deck: p.user_deck.deck.commander || 'Unbekanntes Deck'
        }));

      return {
        id: game.id,
        created_at: game.createdAt,
        deck: participation.user_deck.deck.commander || 'Unbekanntes Deck',
        result: participation.is_winner ? 'Sieg' : 'Niederlage',
        totalPlayers: allParticipations.length,
        opponents: opponents
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

const selectGame = async (game: GameHistoryItem) => {
  selectedGame.value = game;
  loadingParticipants.value = true;

  // Lade Teilnehmer des Spiels
  try {
    gameParticipants.value = await participationApi.getByGame(game.id);
  } catch (error) {
    console.error('Fehler beim Laden der Teilnehmer:', error);
    gameParticipants.value = [];
  } finally {
    loadingParticipants.value = false;
  }
};

const closeWinnerModal = () => {
  selectedGame.value = null;
  gameParticipants.value = [];
  loadingParticipants.value = false;

  // Aktualisiere die Spielerhistorie nach dem Schließen
  loadPlayerHistory();
};

// Event Handlers für GameWinnerModal
const handleWinnerSelected = (winnerId: number) => {
  console.log('Winner selected:', winnerId);
};

const handleRatingsSubmitted = (ratings: Record<number, number>, notes: string) => {
  console.log('Ratings submitted:', ratings, notes);
};

const handleWinnerAndRatingsSubmitted = (winnerId: number, ratings: Record<number, number>, notes: string) => {
  console.log('Winner and ratings submitted:', winnerId, ratings, notes);
  closeWinnerModal();
};

// Event-Handler für Daten-Aktualisierung
const refreshData = () => {
  if (currentUser.value) {
    loadPlayerHistory();
    loadChartData();
  }
};

// Lifecycle
onMounted(() => {
  getCurrentUser();
  if (getCurrentUser()) {
    loadPlayerHistory();
    loadChartData();
  }

  // Event-Listener für Spiel- und Rating-Updates
  eventBus.on('game:created', refreshData);
  eventBus.on('rating:submitted', refreshData);
  eventBus.on('data:refresh', refreshData);
});

onUnmounted(() => {
  // Event-Listener aufräumen
  eventBus.off('game:created', refreshData);
  eventBus.off('rating:submitted', refreshData);
  eventBus.off('data:refresh', refreshData);
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
  border: 2px solid #34495e;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.game-card:hover {
  transform: translateY(-2px);
  border-color: #3498db;
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.2);
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
  gap: 6px;
  color: #bdc3c7;
  font-size: 0.85rem;
}

.game-date i {
  color: #3498db;
}

.game-result {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.result-win {
  background-color: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.result-loss {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.result-unknown {
  background-color: rgba(149, 165, 166, 0.2);
  color: #95a5a6;
}

.game-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.deck-used {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ecf0f1;
  font-weight: 500;
}

.deck-used i {
  color: #9b59b6;
}

.opponents-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.opponents-count {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #bdc3c7;
  font-size: 0.85rem;
}

.opponents-count i {
  color: #e67e22;
}

.opponents-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 20px;
}

.opponent-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #95a5a6;
}

.opponent-name {
  color: #bdc3c7;
}

.opponent-deck {
  color: #7f8c8d;
  font-style: italic;
}

.more-opponents {
  font-size: 0.75rem;
  color: #7f8c8d;
  font-style: italic;
}

.no-games-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.placeholder-content {
  text-align: center;
  color: #7f8c8d;
}

.empty-games-image {
  width: 120px;
  height: 120px;
  opacity: 0.6;
  margin-bottom: 20px;
}

.no-games-text {
  font-size: 1.1rem;
  margin: 0;
}

.player-stats-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.stats-graph-wrapper {
  flex: 1;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #7f8c8d;
  text-align: center;
  padding: 40px;
}

.no-data-message i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.6;
}

.no-data-message p {
  font-size: 1rem;
  margin: 0;
}

.loading-history {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #3498db;
}
</style>
