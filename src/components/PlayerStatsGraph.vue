<!--
  PlayerStatsGraph.vue - Allgemeines Graph-Element für Spielerstatistiken
  Diese Komponente zeigt verschiedene Statistiken in Form von Diagrammen an
-->
<template>
  <div class="stats-graph-container">
    <div class="graph-header">
      <h4 class="graph-title">
        <i class="fas fa-chart-line"></i>
        Spielerstatistiken
      </h4>
      <div class="graph-selector">
        <button
          v-for="graphType in graphTypes"
          :key="graphType.key"
          :class="['graph-btn', { active: selectedGraph === graphType.key }]"
          @click="selectedGraph = graphType.key"
        >
          <i :class="graphType.icon"></i>
          {{ graphType.label }}
        </button>
      </div>
    </div>

    <div class="graph-content">
      <!-- Siege/Niederlagen Statistik -->
      <div v-if="selectedGraph === 'winLoss'" class="win-loss-graph">
        <div class="stats-overview">
          <div class="stat-item win-stat">
            <div class="stat-icon">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ statsData.wins }}</span>
              <span class="stat-label">Siege</span>
            </div>
          </div>
          <div class="stat-item loss-stat">
            <div class="stat-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ statsData.losses }}</span>
              <span class="stat-label">Niederlagen</span>
            </div>
          </div>
          <div class="stat-item ratio-stat">
            <div class="stat-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-details">
              <span class="stat-value">{{ winRatio }}%</span>
              <span class="stat-label">Siegesrate</span>
            </div>
          </div>
        </div>

        <!-- Balken-Diagramm -->
        <div class="bar-chart">
          <div class="chart-container">
            <div class="bar-wrapper">
              <div class="bar win-bar" :style="{ height: winBarHeight }">
                <span class="bar-value">{{ statsData.wins }}</span>
              </div>
              <span class="bar-label">Siege</span>
            </div>
            <div class="bar-wrapper">
              <div class="bar loss-bar" :style="{ height: lossBarHeight }">
                <span class="bar-value">{{ statsData.losses }}</span>
              </div>
              <span class="bar-label">Niederlagen</span>
            </div>
          </div>
        </div>

        <!-- Kreis-Diagramm -->
        <div class="pie-chart">
          <svg viewBox="0 0 42 42" class="pie-svg">
            <circle
              class="pie-background"
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#34495e"
              stroke-width="3"
            />
            <circle
              class="pie-segment win-segment"
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#27ae60"
              stroke-width="3"
              :stroke-dasharray="winCircumference"
              :stroke-dashoffset="25"
              transform="rotate(-90 21 21)"
            />
          </svg>
          <div class="pie-center">
            <span class="pie-percentage">{{ winRatio }}%</span>
            <span class="pie-label">Siege</span>
          </div>
        </div>
      </div>

      <!-- Spiele pro Monat -->
      <div v-if="selectedGraph === 'gamesPerMonth'" class="games-per-month-graph">
        <div class="month-chart">
          <div class="chart-title">Spiele der letzten 6 Monate</div>
          <div class="month-bars">
            <div
              v-for="(month, index) in monthlyData"
              :key="index"
              class="month-bar-wrapper"
            >
              <div
                class="month-bar"
                :style="{ height: getMonthBarHeight(month.games) }"
              >
                <span class="month-bar-value">{{ month.games }}</span>
              </div>
              <span class="month-label">{{ month.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Deck Performance -->
      <div v-if="selectedGraph === 'deckPerformance'" class="deck-performance-graph">
        <div class="deck-stats-title">Top 5 Decks</div>
        <div class="deck-list">
          <div
            v-for="(deck, index) in topDecks"
            :key="index"
            class="deck-performance-item"
          >
            <div class="deck-info">
              <span class="deck-name">{{ deck.name }}</span>
              <span class="deck-commander">{{ deck.commander }}</span>
            </div>
            <div class="deck-stats">
              <div class="performance-bar">
                <div
                  class="performance-fill"
                  :style="{ width: deck.winRate + '%' }"
                ></div>
              </div>
              <span class="win-rate">{{ deck.winRate }}%</span>
              <span class="games-count">({{ deck.games }} Spiele)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props (später für echte Daten)
interface Props {
  userId?: number
  refreshTrigger?: number
}

// Props werden definiert aber noch nicht verwendet (für spätere API-Integration)
withDefaults(defineProps<Props>(), {
  userId: 1,
  refreshTrigger: 0
})

// Graph-Typen
const graphTypes = [
  { key: 'winLoss', label: 'S/N', icon: 'fas fa-chart-pie' },
  { key: 'gamesPerMonth', label: 'Verlauf', icon: 'fas fa-chart-line' },
  { key: 'deckPerformance', label: 'Decks', icon: 'fas fa-cards-blank' }
]

const selectedGraph = ref('winLoss')

// Mock-Daten (später durch echte API-Daten ersetzen)
const statsData = ref({
  wins: 23,
  losses: 17,
  totalGames: 40,
  averageRating: 7.2
})

const monthlyData = ref([
  { label: 'Mai', games: 8 },
  { label: 'Jun', games: 12 },
  { label: 'Jul', games: 6 },
  { label: 'Aug', games: 15 },
  { label: 'Sep', games: 9 },
  { label: 'Okt', games: 4 }
])

const topDecks = ref([
  { name: 'Aggro Rot', commander: 'Krenko', winRate: 75, games: 12 },
  { name: 'Control Blau', commander: 'Teferi', winRate: 68, games: 15 },
  { name: 'Combo Grün', commander: 'Ezuri', winRate: 60, games: 10 },
  { name: 'Midrange Schwarz', commander: 'Liliana', winRate: 55, games: 8 },
  { name: 'Tribal Weiß', commander: 'Elspeth', winRate: 50, games: 6 }
])

// Computed Properties
const winRatio = computed(() => {
  const total = statsData.value.wins + statsData.value.losses
  return total > 0 ? Math.round((statsData.value.wins / total) * 100) : 0
})

const winBarHeight = computed(() => {
  const max = Math.max(statsData.value.wins, statsData.value.losses)
  return max > 0 ? `${(statsData.value.wins / max) * 100}%` : '0%'
})

const lossBarHeight = computed(() => {
  const max = Math.max(statsData.value.wins, statsData.value.losses)
  return max > 0 ? `${(statsData.value.losses / max) * 100}%` : '0%'
})

const winCircumference = computed(() => {
  const ratio = winRatio.value / 100
  const circumference = 2 * Math.PI * 15.915
  return `${ratio * circumference} ${circumference}`
})

const getMonthBarHeight = (games: number) => {
  const maxGames = Math.max(...monthlyData.value.map(m => m.games))
  return maxGames > 0 ? `${(games / maxGames) * 100}%` : '0%'
}
</script>

<style scoped>
.stats-graph-container {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 12px;
  padding: 20px;
  color: #ecf0f1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.graph-header {
  margin-bottom: 20px;
}

.graph-title {
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ecf0f1;
  font-size: 1.2rem;
}

.graph-title i {
  color: #3498db;
}

.graph-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.graph-btn {
  background: rgba(52, 73, 94, 0.6);
  border: 2px solid #34495e;
  color: #bdc3c7;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.graph-btn:hover {
  background: rgba(52, 152, 219, 0.2);
  border-color: #3498db;
  color: #ecf0f1;
}

.graph-btn.active {
  background: rgba(52, 152, 219, 0.3);
  border-color: #3498db;
  color: #ecf0f1;
}

.graph-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Siege/Niederlagen Statistik */
.win-loss-graph {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.stat-item {
  background: rgba(44, 62, 80, 0.4);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.win-stat .stat-icon {
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.loss-stat .stat-icon {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.ratio-stat .stat-icon {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #bdc3c7;
}

/* Balken-Diagramm */
.bar-chart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  display: flex;
  align-items: end;
  gap: 30px;
  height: 120px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 40px;
  background: linear-gradient(to top, #3498db, #5dade2);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  align-items: end;
  justify-content: center;
  transition: all 0.3s ease;
}

.win-bar {
  background: linear-gradient(to top, #27ae60, #58d68d);
}

.loss-bar {
  background: linear-gradient(to top, #e74c3c, #ec7063);
}

.bar-value {
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 4px;
}

.bar-label {
  font-size: 0.85rem;
  color: #bdc3c7;
}

/* Kreis-Diagramm */
.pie-chart {
  position: relative;
  width: 150px;
  height: 150px;
  align-self: center;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-percentage {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #27ae60;
}

.pie-label {
  display: block;
  font-size: 0.8rem;
  color: #bdc3c7;
}

/* Spiele pro Monat */
.games-per-month-graph {
  height: 100%;
}

.month-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-title {
  text-align: center;
  margin-bottom: 20px;
  color: #ecf0f1;
  font-weight: 500;
}

.month-bars {
  flex: 1;
  display: flex;
  align-items: end;
  justify-content: space-around;
  gap: 10px;
  height: 150px;
}

.month-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.month-bar {
  width: 100%;
  max-width: 30px;
  background: linear-gradient(to top, #9b59b6, #bb8fce);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 15px;
  display: flex;
  align-items: end;
  justify-content: center;
  transition: all 0.3s ease;
}

.month-bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px;
}

.month-label {
  font-size: 0.75rem;
  color: #bdc3c7;
}

/* Deck Performance */
.deck-performance-graph {
  height: 100%;
}

.deck-stats-title {
  text-align: center;
  margin-bottom: 20px;
  color: #ecf0f1;
  font-weight: 500;
}

.deck-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deck-performance-item {
  background: rgba(44, 62, 80, 0.4);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.deck-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.deck-name {
  font-weight: 500;
  color: #ecf0f1;
  font-size: 0.9rem;
}

.deck-commander {
  font-size: 0.8rem;
  color: #bdc3c7;
}

.deck-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.performance-bar {
  width: 60px;
  height: 6px;
  background: #34495e;
  border-radius: 3px;
  overflow: hidden;
}

.performance-fill {
  height: 100%;
  background: linear-gradient(to right, #e74c3c, #f39c12, #27ae60);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.win-rate {
  font-size: 0.85rem;
  font-weight: bold;
  color: #ecf0f1;
  min-width: 35px;
}

.games-count {
  font-size: 0.75rem;
  color: #bdc3c7;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-graph-container {
    padding: 15px;
  }

  .graph-selector {
    flex-direction: column;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .chart-container {
    gap: 20px;
  }

  .deck-performance-item {
    flex-direction: column;
    align-items: stretch;
  }

  .deck-stats {
    justify-content: space-between;
  }
}
</style>
