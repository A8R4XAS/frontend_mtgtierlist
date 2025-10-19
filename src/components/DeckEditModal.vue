<template>
  <div v-if="isVisible" class="deck-edit-modal" @click.self="closeModal">
    <div class="modal-content-wrapper">
      <div class="modal-header">
        <h3 class="modal-title">
          <span>✨</span>
          <span v-if="formData.commander">
            {{ formData.commander }}
            <small class="deck-id">(ID: {{ deckId }})</small>
          </span>
          <span v-else>Deck bearbeiten</span>
        </h3>
        <button type="button" class="btn-close-modal" @click="closeModal">
          ✖
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <!-- Commander -->
          <div class="form-group">
            <label for="commander" class="form-label">
              <span>👑</span>
              Commander
            </label>
            <input
              id="commander"
              v-model="formData.commander"
              type="text"
              class="form-control"
              placeholder="Commander eingeben"
              required
            />
          </div>

          <!-- Thema -->
          <div class="form-group">
            <label for="thema" class="form-label">
              <span>🎯</span>
              Thema
            </label>
            <input
              id="thema"
              v-model="formData.thema"
              type="text"
              class="form-control"
              placeholder="Thema eingeben"
            />
          </div>

          <!-- Gameplan -->
          <div class="form-group">
            <label for="gameplan" class="form-label">
              <span>📋</span>
              Gameplan
            </label>
            <textarea
              id="gameplan"
              v-model="formData.gameplan"
              class="form-control"
              placeholder="Gameplan beschreiben"
              rows="3"
            />
          </div>

          <!-- Tempo -->
          <div class="form-group">
            <label for="tempo" class="form-label">
              <span>⚡</span>
              Tempo
            </label>
            <select
              id="tempo"
              v-model="formData.tempo"
              class="form-control"
            >
              <option value="">-- Bitte wählen --</option>
              <option
                v-for="t in tempi"
                :key="t"
                :value="t"
                :class="{
                  'bold-option': isBold(t),
                  'small-option': isSmall(t)
                }"
              >
                {{ t }}
              </option>
            </select>
          </div>

          <!-- Tier -->
          <div class="form-group">
            <label for="tier" class="form-label">
              <span>🏆</span>
              Tier
            </label>
            <input
              id="tier"
              v-model.number="formData.tier"
              type="number"
              class="form-control"
              placeholder="Tier (0-10)"
              min="0"
              max="10"
            />
          </div>

          <!-- Schwächen -->
          <div class="form-group">
            <label for="weaknesses" class="form-label">
              <span>⚠️</span>
              Schwächen
            </label>
            <textarea
              id="weaknesses"
              v-model="formData.weaknesses"
              class="form-control"
              placeholder="Schwächen beschreiben"
              rows="3"
            />
          </div>
        </form>

        <div v-if="errorMessage" class="alert alert-danger">
          <span>⚠️</span>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          <span>✅</span>
          {{ successMessage }}
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="closeModal"
          :disabled="submitting"
        >
          Abbrechen
        </button>

        <button
          type="button"
          class="btn btn-primary"
          @click="submitForm"
          :disabled="submitting"
        >
          <span v-if="submitting">⏳</span>
          <span v-else>💾</span>
          {{ submitting ? 'Wird gespeichert...' : 'Speichern' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { deckApi } from '@/composables/api';
import type { Deck } from '@/types';

// Props
interface Props {
  isVisible: boolean;
  deckId: number | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
  deckUpdated: [];
}>();

// Tempo-Optionen
const tempi = [
  "Turn 0",
  "AGGRO",
  "Aggro to Midgame",
  "MID-GAME",
  "Midgame to Lategame",
  "LATE-GAME",
  "Wo WinCon?"
];

// Hilfsfunktionen
const isBold = (elem: string) => {
  const boldElements = ["AGGRO", "MID-GAME", "LATE-GAME"];
  return boldElements.includes(elem);
};

const isSmall = (elem: string) => {
  const smallElements = ["Turn 0", "Aggro to Midgame", "Midgame to Lategame", "Wo WinCon?"];
  return smallElements.includes(elem);
};

// Alte Tempo-Werte auf neue mappen
const normalizeTempo = (tempo: string | null | undefined): string => {
  if (!tempo) return '';

  const tempoMap: Record<string, string> = {
    'Midrange': 'MID-GAME',
    'Early Game': 'AGGRO',
    'Late Game': 'LATE-GAME',
    'Aggro': 'AGGRO',
    'Midgame': 'MID-GAME',
    'Lategame': 'LATE-GAME'
  };

  return tempoMap[tempo] || tempo;
};

// State
const formData = ref({
  commander: '',
  thema: '',
  gameplan: '',
  tempo: '',
  tier: 0,
  weaknesses: ''
});

const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Watchers
watch(() => props.isVisible, async (newValue) => {
  if (newValue && props.deckId) {
    await loadDeckData();
  } else {
    resetForm();
  }
});

// Methods
const loadDeckData = async () => {
  if (!props.deckId) return;

  try {
    const deck: Deck = await deckApi.get(props.deckId);

    const normalizedTempo = normalizeTempo(deck.tempo);

    formData.value = {
      commander: deck.commander || '',
      thema: deck.thema || '',
      gameplan: deck.gameplan || '',
      tempo: normalizedTempo,
      tier: deck.tier || 0,
      weaknesses: deck.weaknesses || ''
    };

    errorMessage.value = '';
  } catch (error) {
    console.error('Fehler beim Laden des Decks:', error);
    errorMessage.value = 'Fehler beim Laden der Deck-Daten';
  }
};

const submitForm = async () => {
  if (!props.deckId) return;

  submitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await deckApi.update(props.deckId, {
      commander: formData.value.commander,
      thema: formData.value.thema,
      gameplan: formData.value.gameplan,
      tempo: formData.value.tempo,
      tier: formData.value.tier,
      weaknesses: formData.value.weaknesses
    });

    successMessage.value = 'Deck erfolgreich aktualisiert';

    setTimeout(() => {
      emit('deckUpdated');
      closeModal();
    }, 1000);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Decks:', error);
    errorMessage.value = 'Fehler beim Speichern der Änderungen';
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    commander: '',
    thema: '',
    gameplan: '',
    tempo: '',
    tier: 0,
    weaknesses: ''
  };
  errorMessage.value = '';
  successMessage.value = '';
  submitting.value = false;
};

const closeModal = () => {
  if (!submitting.value) {
    emit('close');
  }
};
</script>

<style scoped>
.deck-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.modal-title {
  margin: 0;
  color: white;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title span:first-child {
  font-size: 28px;
}

.deck-id {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: normal;
  margin-left: 8px;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 16px;
}

.form-label span {
  font-size: 18px;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
  background: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

select.form-control {
  cursor: pointer;
}

.bold-option {
  font-weight: bold;
}

.small-option {
  font-size: 0.9em;
  font-style: italic;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.alert-danger {
  background-color: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.5);
  color: #fff;
}

.alert-success {
  background-color: rgba(40, 167, 69, 0.2);
  border: 1px solid rgba(40, 167, 69, 0.5);
  color: #fff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 25px;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(108, 117, 125, 0.9);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(108, 117, 125, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: rgba(0, 123, 255, 0.9);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: rgba(0, 123, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.btn span {
  font-size: 18px;
}

/* Scrollbar Styling */
.modal-content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.modal-content-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.modal-content-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.modal-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
