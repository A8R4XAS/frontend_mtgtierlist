<!--
  GamePlayerDisplay.vue - Spezialisierte Komponente für die Anzeige von Spielern und Decks
  Diese Komponente kombiniert TheGameForm mit einer visuellen Spieleranzeige
-->
<template>
  <div class="game-player-container">
    <ResponsiveContainer
      title="Spielerstellung"
      :manaCost="['white', 'blue', 'black', 'red', 'green']"
      cardType="Plane — Spiel"
    >
      <!-- Spieleranzeige im Artwork-Bereich -->
      <template #artwork>
        <div v-if="currentPlayers.length > 0" class="player-info-display">
          <div class="players-grid">
            <div
              v-for="playerData in currentPlayers"
              :key="playerData.position"
              class="player-card"
              :class="`player-${playerData.position}`"
              @click="clearPlayer(playerData.position)"
              title="Klicken zum Entfernen"
            >
              <div class="player-row">
                <div class="player-info">
                  <i class="fas fa-user player-icon"></i>
                  <span class="player-name">{{ playerData.player }}</span>
                </div>
                <div class="deck-separator">-</div>
                <div class="deck-info">
                  <i class="fas fa-magic deck-icon"></i>
                  <span class="deck-name">{{ playerData.deck }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-players-placeholder">
          <div class="placeholder-content">
            <i class="fas fa-users placeholder-icon"></i>
            <span>Keine Spieler ausgewählt</span>
          </div>
        </div>
      </template>

      <!-- GameForm im Textbereich -->
      <template #textbox>
        <div class="game-form-container">
          <TheGameForm
            ref="gameFormRef"
            @players-changed="handlePlayersChangedForward"
            @game-created="handleGameCreatedForward"
          />
        </div>
      </template>
    </ResponsiveContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ResponsiveContainer from '@/components/ResponsiveContainer.vue';
import TheGameForm from '@/components/TheGameForm.vue';

// Spielerdaten für die Anzeige
const currentPlayers = ref<Array<{player: string, deck: string, position: number}>>([]);

// Ref für TheGameForm Komponente
const gameFormRef = ref<InstanceType<typeof TheGameForm> | null>(null);

// Handler für Spieleränderungen vom GameForm
const handlePlayersChanged = (players: Array<{player: string, deck: string, position: number}>) => {
  currentPlayers.value = players;
};

// Handler für Game-Created Event
const handleGameCreated = (gameId: number) => {
  console.log('Spiel erstellt mit ID:', gameId);
  // Optional: Nach Spiel-Erstellung könnte man die Spielerdaten zurücksetzen
  // currentPlayers.value = [];
};

// Events für Elternkomponente
const emit = defineEmits<{
  (e: 'game-created', gameId: number): void;
  (e: 'players-changed', players: Array<{player: string, deck: string, position: number}>): void;
}>();

// Funktion zum Löschen eines Spielers
const clearPlayer = (position: number) => {
  if (gameFormRef.value) {
    gameFormRef.value.clearPlayerByPosition(position);
  }
};

// Events weiterleiten
const handleGameCreatedForward = (gameId: number) => {
  handleGameCreated(gameId);
  emit('game-created', gameId);
};

const handlePlayersChangedForward = (players: Array<{player: string, deck: string, position: number}>) => {
  handlePlayersChanged(players);
  emit('players-changed', players);
};
</script>

<style scoped>
.game-player-container {
  width: 100%;
}

/* SPIELERINFORMATIONEN IM ARTWORK-BEREICH */
.player-info-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 6px;
  background:
    linear-gradient(135deg,
      rgba(140, 120, 90, 0.2) 0%,
      rgba(180, 160, 120, 0.15) 50%,
      rgba(140, 120, 90, 0.2) 100%
    );
}

.players-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  height: 100%;
  justify-content: stretch;
  align-items: stretch;
  padding: 2px;
}

.player-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  width: 100%;
  flex: 1;
  background:
    linear-gradient(135deg,
      rgba(212, 168, 85, 0.25) 0%,     /* Helles Gold transparent */
      rgba(184, 148, 31, 0.2) 50%,     /* Warmes Gold transparent */
      rgba(125, 104, 21, 0.25) 100%    /* Dunkles Gold transparent */
    );
  border: 1px solid rgba(218, 198, 25, 0.5);
  border-radius: 8px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.player-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(218, 198, 25, 0.8);
  background:
    linear-gradient(135deg,
      rgba(212, 168, 85, 0.35) 0%,
      rgba(184, 148, 31, 0.3) 50%,
      rgba(125, 104, 21, 0.35) 100%
    );
}

.player-card:active {
  transform: translateY(0px);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.player-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-start;
}

.player-icon {
  color: #d4a855;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.player-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c2c2c;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deck-separator {
  font-size: 0.9rem;
  font-weight: bold;
  color: #7d6815;
  text-align: center;
  flex-shrink: 0;
  justify-self: center;
}

.deck-info {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

.deck-icon {
  color: #9a7e1a;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.deck-name {
  font-size: 1rem;
  color: #3d320a;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Placeholder für keine Spieler */
.no-players-placeholder {
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

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.placeholder-content span {
  font-size: 1.1rem;
  opacity: 0.7;
}

.game-form-container {
  width: 100%;
}

.form-footer {
  text-align: center;
}
</style>
