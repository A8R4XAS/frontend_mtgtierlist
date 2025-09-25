<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TableComponent from './TableComponent.vue';
import { deckApi } from '@/composables/api';
import type { Deck } from '@/types';

// Tabellenkonfiguration
const tableTitle = ref('Deckliste');
const tableHeaders = ref(['ID', 'Besitzer', 'Commander', 'Thema', 'Gameplan', 'Tempo', 'Tier', 'Schwäche']);
const tableRows = ref<(string | number)[][]>([]);
const errorMessage = ref('');

// Daten laden
const fetchTableData = async () => {
  try {
    const decks = await deckApi.getAll();

    tableRows.value = decks.map((deck: Deck) => [
      deck.id,
      deck.owner?.name || '-',
      deck.commander,
      deck.thema || '-',
      deck.gameplan || '-',
      deck.tempo || '-',
      deck.tier || '-',
      deck.weaknesses || '-'
    ]);
  } catch (error) {
    console.error('Fehler beim Laden der Decks:', error);
    errorMessage.value = 'Fehler beim Laden der Deckliste';
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
      :rowsPerPage="5"
      :userColumns="[0]"
      :fontSize="'14px'"
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
