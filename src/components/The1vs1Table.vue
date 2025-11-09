<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TableComponent from './TableComponent.vue';
import { gameApi } from '@/composables/api';
import { useAuth } from '@/composables/useAuth';
import type { Game } from '@/types';

// Tabellenkonfiguration
const tableTitle = ref('1 vs. 1');
const tableHeaders = ref(['ID', 'Spieler 1', 'Deck', 'Spieler 2', 'Deck', 'Sieger']);
const tableRows = ref<(string | number)[][]>([]);
const errorMessage = ref('');

// Daten laden
const { getCurrentUser } = useAuth();
const fetchTableData = async () => {
  try {
    const userData = getCurrentUser();
    if (!userData?.id) return;

    const games = await gameApi.getByUser(userData.id);

    console.log('Geladene Spiele:', games);

    tableRows.value = games.map((game: Game) => [
      game.id,
      game.user_deck1.user.name,
      game.user_deck1.deck.commander,
      game.user_deck2.user.name,
      game.user_deck2.deck.commander,
      game.winner?.user.name || '-'
    ]);
  } catch (error) {
    console.error('Fehler beim Laden der Spieledaten:', error);
    errorMessage.value = 'Fehler beim Laden der Tabellendaten';
    tableRows.value = [];
  }
};

// Komponente initialisieren
onMounted(() => {
  fetchTableData();
});
</script>

<template>
  <div>
    <TableComponent
      :title="tableTitle"
      :headers="tableHeaders"
      :rows="tableRows"
      :rowsPerPage="3"
      :userColumns="[0]"
    />
    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.alert {
  font-size: 0.9rem;
  text-align: center;
}
</style>
