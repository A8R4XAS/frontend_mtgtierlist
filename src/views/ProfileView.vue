<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import TheNavbar from '@/components/TheNavbar.vue';
import TableComponent from '@/components/TableComponent.vue';
import DeckForm from '@/components/TheDeckForm.vue';
import DeckEditModal from '@/components/DeckEditModal.vue';
import { userApi, deckApi } from '@/composables/api';
import { eventBus } from '@/composables/eventBus';

// Tabellen-Konfiguration
const tableTitle = ref('Deine Decks');
const tableHeaders = ref(['ID', 'Commander', 'Thema', 'Gameplan', 'Tempo', 'Tier', 'Schwäche']);
const tableRows = ref<(string | number)[][]>([]);

// Alle IDs der eigenen Decks sind bearbeitbar
const editableRowIds = computed(() => {
  return tableRows.value.map(row => row[0] as number);
});

interface LocalUser {
  id: number;
  email: string;
  password: string;
  name: string;
}

// Benutzerdaten
const user = ref<LocalUser>({
  id: null as unknown as number,
  email: '',
  password: '',
  name: ''
});

// UI-Status
const saveSuccess = ref(false);
const errorMessage = ref('');

// Modal State
const showEditModal = ref(false);
const selectedDeckId = ref<number | null>(null);

// Benutzer laden
const fetchUser = async () => {
  try {
    const localUser = localStorage.getItem('user');
    if (!localUser) return;
    const userData = JSON.parse(localUser);
    const apiUser = await userApi.get(userData.id);
    user.value = {
      id: userData.id,
      email: apiUser.email,
      password: '',
      name: apiUser.name
    };
    await fetchDecks(userData.id);
  } catch (error) {
    console.error('Fehler beim Laden des Benutzers:', error);
    errorMessage.value = 'Fehler beim Laden der Benutzerdaten';
  }
};

// Benutzer aktualisieren
const updateUser = async () => {
  try {
    if (!user.value.id) return;
    await userApi.update(user.value.id, {
      email: user.value.email,
      username: user.value.name
    });
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzers:', error);
    errorMessage.value = 'Fehler beim Speichern der Änderungen';
  }
};

// Decks laden
const fetchDecks = async (userId: number) => {
  try {
    const decks = await deckApi.getByOwner(userId);
    tableRows.value = decks.map(deck => [
      deck.id,
      deck.commander,
      deck.thema || '',
      deck.gameplan || '',
      deck.tempo || '',
      deck.tier?.toString() || '',
      deck.weaknesses || ''
    ]);
  } catch (error) {
    console.error('Fehler beim Laden der Decks:', error);
    errorMessage.value = 'Fehler beim Laden der Decks';
  }
};

// Deck löschen
const deleteDeck = async (deckId: number) => {
  try {
    await deckApi.delete(deckId);
    if (user.value.id) {
      await fetchDecks(user.value.id);
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Decks:', error);
    errorMessage.value = 'Fehler beim Löschen des Decks';
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
  if (user.value.id) {
    fetchDecks(user.value.id);
  }
};

// Komponente initialisieren
onMounted(() => {
  fetchUser();

  // Event-Listener für Deck-Erstellung
  console.log('📋 ProfileView: Event-Listener registriert');
  eventBus.on('deck:created', () => {
    console.log('📋 ProfileView: deck:created Event empfangen');
    if (user.value?.id) {
      fetchDecks(user.value.id);
    }
  });

  eventBus.on('data:refresh', () => {
    console.log('📋 ProfileView: data:refresh Event empfangen');
    if (user.value?.id) {
      fetchDecks(user.value.id);
    }
  });
});

// Cleanup
onUnmounted(() => {
  console.log('📋 ProfileView: Event-Listener werden entfernt');
  eventBus.off('deck:created');
  eventBus.off('data:refresh');
});
</script>

<template>
  <main>
    <div class="container-fluid">
      <div class="row justify-content-center mb-3">
        <div class="col-12">
          <TheNavbar />
        </div>
      </div>

      <div class="row justify-content-center mb-3 g-1">
        <div class="col-12">

          <div class="triple-border">
            <div class="profile-form">
              <form @submit.prevent="updateUser">
                <div class="mb-3">
                  <label for="name">Name: </label>
                  <input type="text" v-model="user.name" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="Email">Email: </label>
                  <input type="text" v-model="user.email" class="form-control" required />
                </div>
                <button class="btn btn-primary" @click="updateUser">Speichern</button>
                <div class="success-message mt-3" v-if="saveSuccess">Daten erfolgreich gespeichert!</div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center mb-3 g-1">
        <div class="col-12">
          <DeckForm />
        </div>
      </div>

      <div class="row justify-content-center mb-3 g-1">
        <div class="col-12">
          <TableComponent
            :title="tableTitle"
            :headers="tableHeaders"
            :rows="tableRows"
            :rowsPerPage="10"
            :userColumn="false"
            :userColumns="[0]"
            :activeUpdate="true"
            :editableRowIds="editableRowIds"
            @update-row="handleEditDeck"
            @delete-row="deleteDeck"
            :font-size="'14px'"
          />
        </div>
      </div>

    </div>

    <!-- Deck Edit Modal -->
    <DeckEditModal
      :isVisible="showEditModal"
      :deckId="selectedDeckId"
      @close="handleCloseModal"
      @deckUpdated="handleDeckUpdated"
    />

  </main>
</template>


<style scoped>
.profile-form {
  width: 100%;
  font-size: 25px;
  color: #2c3e50;
  background: url(../assets/background_textfeld.jpg) no-repeat center center fixed, var(--color-background);
  background-size: cover;
  background-color: var(--color-background);
  transition:
    color 0.5s,
    background-color 0.5s;
  border-radius: 4px;
  padding: 15px;
  border: 1px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.success-message {
  color: #28a745;
  font-weight: bold;
}

.error-message {
  color: #dc3545;
  font-weight: bold;
}
</style>
