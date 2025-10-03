<!--
  GameWinnerModal.vue - Modal für die Gewinner-Auswahl und Bewertung von Spielen
  Diese Komponente ermöglicht es, den Gewinner eines Spiels zu bestimmen und andere Spieler zu bewerten
-->
<template>
  <div v-if="isVisible" class="winner-modal" @click.self="closeModal">
    <div class="winner-modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-trophy"></i>
          Spiel vom {{ formatDate(game?.created_at || '') }}
        </h3>
        <button type="button" class="btn-close-modal" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="winner-selection-section">
          <h4 class="section-title">
            <i class="fas fa-crown"></i>
            Gewinner auswählen
          </h4>
          <div class="form-group">
            <label for="winner-select" class="form-label">Wer hat das Spiel gewonnen?</label>
            <select
              id="winner-select"
              class="form-select winner-select"
              v-model="selectedWinner"
            >
              <option value="">Gewinner auswählen...</option>
              <option
                v-for="participant in participants"
                :key="participant.id"
                :value="participant.id"
              >
                {{ participant.user_deck.user.name }} - {{ participant.user_deck.deck.commander || 'Unbekanntes Deck' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Rating Section - nur anzeigen wenn Gewinner ausgewählt -->
        <div v-if="selectedWinner && opponentParticipants.length > 0" class="rating-section">
          <h5>
            <i class="fas fa-star"></i>
            Gegner bewerten
          </h5>
          <p class="rating-description">
            Bewerte deine Gegner basierend auf ihrer Spielweise, Fairness und dem Spielspaß.
          </p>

          <div class="rating-grid">
            <div
              v-for="participant in opponentParticipants"
              :key="participant.id"
              class="rating-card"
            >
              <div class="rating-player-info">
                <div class="rating-player-name">
                  <i class="fas fa-user"></i>
                  {{ participant.user_deck.user.name }}
                </div>
                <div class="rating-deck-name">
                  <i class="fas fa-magic"></i>
                  {{ participant.user_deck.deck.commander || 'Unbekanntes Deck' }}
                </div>
              </div>

              <div class="rating-input-container">
                <label class="rating-label">Bewertung (1-10)</label>
                <div class="rating-input-wrapper">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    v-model="participantRatings[participant.id]"
                    class="rating-slider"
                    @input="updateRating(participant.id, $event)"
                  />
                  <div class="rating-display">
                    <span class="rating-value">{{ participantRatings[participant.id] || 5 }}</span>
                    <span class="rating-max">/10</span>
                  </div>
                </div>
                <div class="rating-stars">
                  <span
                    v-for="star in 10"
                    :key="star"
                    class="star"
                    :class="{ filled: star <= (participantRatings[participant.id] || 5) }"
                  >
                    ★
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="rating-notes">
            <label for="rating-notes" class="form-label">
              <i class="fas fa-comment-alt"></i>
              Zusätzliche Notizen (optional)
            </label>
            <textarea
              id="rating-notes"
              v-model="ratingNotes"
              class="form-control"
              rows="3"
              placeholder="Teile deine Gedanken über das Spiel oder einzelne Spieler..."
            ></textarea>
          </div>
        </div>

        <div v-if="loadingParticipants" class="loading-participants">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Lade Teilnehmer...</span>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModal"
          >
            Abbrechen
          </button>

          <div class="primary-actions">
            <button
              type="button"
              class="btn btn-info"
              :disabled="submitting"
              @click="submitRatings"
              v-if="hasRatingsToSubmit"
            >
              <i class="fas fa-star"></i>
              Bewertungen speichern
            </button>

            <button
              type="button"
              class="btn btn-primary"
              :disabled="!selectedWinner || submitting"
              @click="submitWinnerAndRatings"
            >
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-trophy"></i>
              {{ submitting ? 'Wird gespeichert...' : 'Speichern & Schließen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { participationApi, ratingApi } from '@/composables/api';
import { useAuth } from '@/composables/useAuth';
import type { Participation, Rating, CreateRatingRequest } from '@/types';

// Interface für die Spiele-Historie-Anzeige
interface GameHistoryItem {
  id: number;
  created_at: string;
  deck: string;
  result: string | null;
  totalPlayers: number;
  opponents: Array<{
    name: string;
    deck: string;
  }>;
}

// Props Definition
interface Props {
  isVisible: boolean;
  game: GameHistoryItem | null;
  participants: Array<Participation>;
  loadingParticipants?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loadingParticipants: false
});

// Emits Definition
const emit = defineEmits<{
  close: [];
  winnerSelected: [winnerId: number];
  ratingsSubmitted: [ratings: Record<number, number>, notes: string];
  winnerAndRatingsSubmitted: [winnerId: number, ratings: Record<number, number>, notes: string];
}>();

// State Management
const selectedWinner = ref<number | null>(null);
const submitting = ref(false);
const participantRatings = ref<Record<number, number>>({});
const ratingNotes = ref('');
const existingRatings = ref<Array<Rating>>([]);

// Auth Composable
useAuth();

// Current User
const currentUser = ref<{id: number, name: string} | null>(null);

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr);
      return currentUser.value;
    } catch (error) {
      console.error('Fehler beim Parsen der User-Daten:', error);
    }
  }
  return null;
};

// Computed Properties
const opponentParticipants = computed(() => {
  if (!currentUser.value) return props.participants;
  return props.participants.filter(p => p.user_deck.user.id !== currentUser.value!.id);
});

const hasRatingsToSubmit = computed(() => {
  return Object.keys(participantRatings.value).length > 0;
});

// Watchers
watch(() => props.isVisible, (newValue) => {
  if (newValue && props.game) {
    initializeModal();
  }
});

watch(() => props.participants, () => {
  if (props.participants.length > 0) {
    loadExistingRatings();
  }
});

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const initializeModal = () => {
  selectedWinner.value = null;
  participantRatings.value = {};
  ratingNotes.value = '';
  existingRatings.value = [];

  // Finde den aktuellen Gewinner falls vorhanden
  const currentWinner = props.participants.find(p => p.is_winner);
  if (currentWinner) {
    selectedWinner.value = currentWinner.id;
  }
};

const loadExistingRatings = async () => {
  if (!currentUser.value || !props.game) return;

  try {
    // Lade Bewertungen für alle Teilnehmer des Spiels
    const allRatings: Rating[] = [];
    for (const participant of props.participants) {
      const participantRatings = await ratingApi.getByParticipation(participant.id);
      allRatings.push(...participantRatings);
    }

    // Filtere Bewertungen des aktuellen Benutzers
    const userRatings = allRatings.filter((rating: Rating) => rating.rater.id === currentUser.value!.id);

    existingRatings.value = userRatings;

    // Lade bestehende Bewertungen in das Rating-Objekt
    userRatings.forEach((rating: Rating) => {
      const ratedParticipant = props.participants.find(p =>
        p.id === rating.participation.id
      );
      if (ratedParticipant) {
        participantRatings.value[ratedParticipant.id] = rating.value;
      }
    });

  } catch (error) {
    console.error('Fehler beim Laden der bestehenden Bewertungen:', error);
  }
};

const updateRating = (participantId: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const rating = parseInt(target.value);
  participantRatings.value[participantId] = rating;
};

const closeModal = () => {
  emit('close');
};

const submitRatings = async () => {
  if (!currentUser.value || !props.game || Object.keys(participantRatings.value).length === 0) {
    return;
  }

  submitting.value = true;
  try {
    // Speichere oder aktualisiere Bewertungen
    for (const [participantIdStr, rating] of Object.entries(participantRatings.value)) {
      const participantId = parseInt(participantIdStr);
      const participant = props.participants.find(p => p.id === participantId);

      if (participant) {
        const existingRating = existingRatings.value.find((r: Rating) =>
          r.participation.id === participant.id
        );

        const ratingData: CreateRatingRequest = {
          participation: participant.id,
          rater: currentUser.value.id,
          value: rating
        };

        if (existingRating) {
          await ratingApi.update(existingRating.id, ratingData);
        } else {
          await ratingApi.create(ratingData);
        }
      }
    }

    emit('ratingsSubmitted', participantRatings.value, ratingNotes.value);

  } catch (error) {
    console.error('Fehler beim Speichern der Bewertungen:', error);
  } finally {
    submitting.value = false;
  }
};

const submitWinnerAndRatings = async () => {
  if (!selectedWinner.value || !props.game) return;

  submitting.value = true;
  try {
    // Erst den Gewinner setzen
    await participationApi.setWinner(selectedWinner.value);

    // Dann Bewertungen speichern falls vorhanden
    if (Object.keys(participantRatings.value).length > 0) {
      await submitRatings();
    }

    emit('winnerAndRatingsSubmitted', selectedWinner.value, participantRatings.value, ratingNotes.value);

  } catch (error) {
    console.error('Fehler beim Speichern:', error);
  } finally {
    submitting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  getCurrentUser();
  if (props.isVisible && props.game) {
    initializeModal();
  }
});
</script>

<style scoped>
/* Winner Modal Styles */
.winner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(3px);
}

.winner-modal-content {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #34495e;
}

.modal-title {
  color: #ecf0f1;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title i {
  color: #f39c12;
  font-size: 1.2rem;
}

.btn-close-modal {
  background: none;
  border: none;
  color: #95a5a6;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  color: #ecf0f1;
  background-color: rgba(231, 76, 60, 0.2);
}

.modal-body {
  padding: 20px;
}

.winner-selection-section {
  margin-bottom: 25px;
}

.section-title {
  color: #ecf0f1;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #f39c12;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  color: #ecf0f1;
  margin-bottom: 8px;
  display: block;
}

.winner-select {
  width: 100%;
  padding: 12px;
  background-color: rgba(44, 62, 80, 0.6);
  border: 2px solid #34495e;
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 1rem;
}

.winner-select:focus {
  outline: none;
  border-color: #3498db;
  background-color: rgba(44, 62, 80, 0.8);
}

.winner-select option {
  background-color: #2c3e50;
  color: #ecf0f1;
}

.loading-participants {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #3498db;
}

/* Rating Section Styles */
.rating-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #34495e;
}

.rating-section h5 {
  color: #ecf0f1;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-section h5::before {
  content: "⭐";
  font-size: 1.2rem;
}

.rating-description {
  color: #bdc3c7;
  font-size: 0.9rem;
  margin-bottom: 15px;
  font-style: italic;
}

.rating-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.rating-card {
  background: rgba(52, 73, 94, 0.4);
  border: 1px solid #34495e;
  border-radius: 8px;
  padding: 15px;
}

.rating-player-info {
  margin-bottom: 12px;
}

.rating-player-name,
.rating-deck-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.rating-player-name {
  color: #ecf0f1;
  font-weight: 500;
  font-size: 0.95rem;
}

.rating-player-name i {
  color: #3498db;
}

.rating-deck-name {
  color: #bdc3c7;
  font-size: 0.85rem;
}

.rating-deck-name i {
  color: #9b59b6;
}

.rating-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-label {
  color: #ecf0f1;
  font-size: 0.9rem;
  font-weight: 500;
}

.rating-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-slider {
  flex: 1;
  height: 6px;
  background: #34495e;
  border-radius: 3px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.rating-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.rating-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.rating-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
  min-width: 40px;
}

.rating-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f39c12;
}

.rating-max {
  font-size: 0.9rem;
  color: #bdc3c7;
}

.rating-stars {
  display: flex;
  gap: 2px;
  justify-content: center;
  margin-top: 5px;
}

.star {
  color: #34495e;
  font-size: 0.8rem;
  transition: color 0.2s ease;
}

.star.filled {
  color: #f39c12;
}

.rating-notes {
  margin-top: 15px;
}

.rating-notes .form-label {
  color: #ecf0f1;
  margin-bottom: 8px;
  display: block;
}

.rating-notes .form-control {
  background-color: rgba(44, 62, 80, 0.6);
  border: 2px solid #34495e;
  border-radius: 6px;
  color: #ecf0f1;
  padding: 10px;
  resize: vertical;
  font-family: inherit;
}

.rating-notes .form-control:focus {
  outline: none;
  border-color: #3498db;
  background-color: rgba(44, 62, 80, 0.8);
}

.rating-notes .form-control::placeholder {
  color: #7f8c8d;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #34495e;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.primary-actions {
  display: flex;
  gap: 10px;
}
</style>
