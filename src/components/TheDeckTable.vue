<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import TableComponent from './TableComponent.vue';
import DeckEditModal from './DeckEditModal.vue';
import { deckApi } from '@/composables/api';
import { useAdmin } from '@/composables/useAdmin';
import { useAuth } from '@/composables/useAuth';
import type { Deck } from '@/types';

// Admin-Check
const { isAdmin } = useAdmin();

// Aktueller Benutzer
const { getCurrentUser } = useAuth();
const currentUserId = computed(() => getCurrentUser()?.id || null);

// Tabellenkonfiguration
const tableTitle = ref('Deckliste');
const tableHeaders = ref(['ID', 'Besitzer', 'Commander', 'Thema', 'Gameplan', 'Tempo', 'Tier', 'Schwäche']);
const tableRows = ref<(string | number)[][]>([]);
const errorMessage = ref('');

// Alle Decks (für Berechtigungsprüfung)
const allDecks = ref<Deck[]>([]);

// Modal State
const showEditModal = ref(false);
const selectedDeckId = ref<number | null>(null);

// IDs der bearbeitbaren Decks (eigene Decks oder Admin)
const editableRowIds = computed(() => {
  if (isAdmin.value) {
    // Admins können alle Decks bearbeiten
    return allDecks.value.map(deck => deck.id);
  }

  if (!currentUserId.value) {
    return [];
  }

  // Normale User können nur ihre eigenen Decks bearbeiten
  return allDecks.value
    .filter(deck => deck.owner?.id === currentUserId.value)
    .map(deck => deck.id);
});

// Daten laden
const fetchTableData = async () => {
  try {
    const decks = await deckApi.getAll();

    // Alle Decks speichern für Berechtigungsprüfung
    allDecks.value = decks;

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

// Deck bearbeiten
const handleEditDeck = (deckId: number) => {
  selectedDeckId.value = deckId;
  showEditModal.value = true;
};

// Modal schließen
const handleCloseModal = () => {
  showEditModal.value = false;
  selectedDeckId.value = null;
};

// Deck wurde aktualisiert
const handleDeckUpdated = () => {
  fetchTableData();
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
      :activeUpdate="true"
      :editableRowIds="editableRowIds"
      @update-row="handleEditDeck"
      :fontSize="'14px'"
    />
    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>

    <!-- Deck Edit Modal -->
    <DeckEditModal
      :isVisible="showEditModal"
      :deckId="selectedDeckId"
      @close="handleCloseModal"
      @deckUpdated="handleDeckUpdated"
    />
  </div>
</template>

<style scoped>
.alert {
  font-size: 0.9rem;
  text-align: center;
}
</style>
