<script setup lang="ts">
import GamePlayerDisplay from '@/components/GameCardDisplay.vue';
import PlayerHistoryDisplay from '@/components/PlayerHistoryDisplay.vue';
import TheNavbar from '@/components/TheNavbar.vue';
import TheUserTable from '@/components/TheUserTable.vue';
import { useAdmin } from '@/composables/useAdmin';

const { isAdmin } = useAdmin();

// Handler für Game-Created Event (optional)
const handleGameCreated = (gameId: number) => {
  console.log('Spiel erstellt mit ID:', gameId);
};

// Handler für Spieleränderungen (optional)
const handlePlayersChanged = (players: Array<{player: string, deck: string, position: number}>) => {
  console.log('Spieler geändert:', players);
};

// Handler für ausgewähltes Spiel aus der Historie
const handleGameSelected = (game: {id: number; created_at: string; deck: string; result: string | null; totalPlayers: number}) => {
  console.log('Spiel aus Historie ausgewählt:', game);
};
</script>

<template>
  <main>
    <div class="container-fluid">
      <div class="row justify-content-center mb-3">
        <div class="col-12">
          <TheNavbar />
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-6 mb-3">
          <GamePlayerDisplay
            @game-created="handleGameCreated"
            @players-changed="handlePlayersChanged"
          />
        </div>

        <div class="col-12 col-xl-6 mb-3">
          <PlayerHistoryDisplay
            @game-selected="handleGameSelected"
          />
        </div>
      </div>

      <div v-if="isAdmin" class="row justify-content-center mb-3 g-1">
        <div class="col-12">
          <TheUserTable />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.error-message {
  color: #dc3545;
  font-weight: bold;
  text-align: center;
}
</style>

