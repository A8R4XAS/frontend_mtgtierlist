<script setup lang="ts">
import ResponsiveContainer from '@/components/ResponsiveContainer.vue';
import The1vs1Table from '@/components/The1vs1Table.vue';
import GamePlayerDisplay from '@/components/GameCardDisplay.vue';
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
        <div class="col-6">
          <GamePlayerDisplay
            @game-created="handleGameCreated"
            @players-changed="handlePlayersChanged"
          />
        </div>

        <div class="col-6">
          <ResponsiveContainer
            title="Beispiel Magic Karte"
            :manaCost="['3', 'red', 'blue']"
            artworkUrl="/path/to/artwork.jpg"
            cardType="Kreatur — Drache"
            cardText="<b>Flugfähigkeit</b><br>Wenn diese Karte ins Spiel kommt..."
            :power="4"
            :toughness="4"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <The1vs1Table />
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

