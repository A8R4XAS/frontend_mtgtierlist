<script setup lang="ts">
import { ref } from 'vue';
import ResponsiveContainer from '@/components/ResponsiveContainer.vue';
import The1vs1Table from '@/components/The1vs1Table.vue';
import TheGameForm from '@/components/TheGameForm.vue';
import TheNavbar from '@/components/TheNavbar.vue';
import TheUserTable from '@/components/TheUserTable.vue';
import { useAdmin } from '@/composables/useAdmin';

const { isAdmin } = useAdmin();

// Spielerdaten für die Anzeige im ResponsiveContainer
const currentPlayers = ref<Array<{player: string, deck: string, position: number}>>([]);

// Handler für Spieleränderungen vom GameForm
const handlePlayersChanged = (players: Array<{player: string, deck: string, position: number}>) => {
  currentPlayers.value = players;
};

// Handler für Game-Created Event (optional)
const handleGameCreated = (gameId: number) => {
  console.log('Spiel erstellt mit ID:', gameId);
  // Optional: Nach Spiel-Erstellung könnte man die Spielerdaten zurücksetzen
  // currentPlayers.value = [];
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
        <div class="col-12">
          <The1vs1Table />
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <ResponsiveContainer
            title="Spielerstellung"
            :manaCost="['white', 'blue', 'black', 'red', 'green']"
            cardType="Plane — Spiel"
            :showPlayerInfo="true"
            :players="currentPlayers"
          >
            <template #textbox>
              <div class="game-form-container">

                <TheGameForm
                  @players-changed="handlePlayersChanged"
                  @game-created="handleGameCreated"
                />

                <div class="form-footer mt-3">
                  <small class="text-muted">
                    <i class="fas fa-info-circle"></i>
                    Nach dem Erstellen erscheint das Spiel in der Tabelle oben.
                  </small>
                </div>
              </div>
            </template>
          </ResponsiveContainer>
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

