<!--
  GameWinnerModal.vue - Modal für die Gewinner-Auswahl und Bewertung von Spielen
  Diese Komponente ermöglicht es, den Gewinner eines Spiels zu bestimmen und andere // State Management
const selectedWinners = ref<number[]>([]);
const submitting = ref(false);
const participantRatings = ref<Record<number, number>>({});
const existingRatings = ref<Array<Rating>>();r zu bewerten
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
        <!-- Info Box -->
        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <p>Bewerte die Performance deines Decks und die der anderen Teilnehmer des Spiels. Wähle optional den/die Gewinner aus.</p>
        </div>

        <!-- Selbstbewertung Section -->
        <div v-if="currentUserParticipant" class="self-rating-section">
          <h5>
            <i class="fas fa-user-check"></i>
            Dein Deck bewerten
          </h5>
          <p class="rating-description">
            Bewerte ehrlich die Performance deines Decks in diesem Spiel.
          </p>

          <div class="self-rating-card">
            <div class="rating-player-info">
              <div class="rating-player-header">
                <div class="player-details">
                  <div class="rating-player-name">
                    <i class="fas fa-user"></i>
                    {{ currentUserParticipant.user_deck.user.name }} (Du)
                  </div>
                  <div class="rating-deck-name">
                    <i class="fas fa-magic"></i>
                    {{ currentUserParticipant.user_deck.deck.commander || 'Unbekanntes Deck' }}
                  </div>
                </div>
                <div class="winner-toggle">
                  <label class="winner-checkbox">
                    <input
                      type="checkbox"
                      :value="currentUserParticipant.id"
                      v-model="selectedWinners"
                    />
                    <span class="checkmark"></span>
                    <span class="winner-label">
                      <i class="fas fa-trophy"></i>
                      Gewinner
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div class="rating-input-container">
              <label class="rating-label">Selbstbewertung (1-10)</label>
              <div class="rating-input-wrapper">
                <input
                  type="range"
                  min="1"
                  max="10"
                  v-model="participantRatings[currentUserParticipant.id]"
                  class="rating-slider"
                  @input="updateRating(currentUserParticipant.id, $event)"
                />
                <div class="rating-display">
                  <span class="rating-value">{{ participantRatings[currentUserParticipant.id] || 5 }}</span>
                  <span class="rating-max">/10</span>
                </div>
              </div>
              <div class="rating-stars">
                <span
                  v-for="star in 10"
                  :key="star"
                  class="star"
                  :class="{ filled: star <= (participantRatings[currentUserParticipant.id] || 5) }"
                >
                  ★
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Rating Section für andere Decks -->
        <div v-if="allOtherParticipants.length > 0" class="rating-section">
          <h5>
            <i class="fas fa-users"></i>
            Andere Decks bewerten
          </h5>
          <p class="rating-description">
            Bewerte alle anderen Decks basierend auf ihrer Performance.
          </p>

          <div class="rating-grid">
            <div
              v-for="participant in allOtherParticipants"
              :key="participant.id"
              class="rating-card"
            >
              <div class="rating-player-info">
                <div class="rating-player-header">
                  <div class="player-details">
                    <div class="rating-player-name">
                      <i class="fas fa-user"></i>
                      {{ participant.user_deck.user.name }}
                    </div>
                    <div class="rating-deck-name">
                      <i class="fas fa-magic"></i>
                      {{ participant.user_deck.deck.commander || 'Unbekanntes Deck' }}
                    </div>
                  </div>
                  <div class="winner-toggle">
                    <label class="winner-checkbox">
                      <input
                        type="checkbox"
                        :value="participant.id"
                        v-model="selectedWinners"
                      />
                      <span class="checkmark"></span>
                      <span class="winner-label">
                        <i class="fas fa-trophy"></i>
                        Gewinner
                      </span>
                    </label>
                  </div>
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

          <button
            type="button"
            class="btn btn-primary"
            :disabled="submitting || (!hasRatingsToSubmit && selectedWinners.length === 0)"
            @click="submitAllData"
          >
            <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ submitting ? 'Wird gespeichert...' : 'Speichern' }}
          </button>
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
import { eventBus } from '@/composables/eventBus';

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
  dataSubmitted: [winners: number[], ratings: Record<number, number>];
}>();

// State Management
const selectedWinners = ref<number[]>([]);
const submitting = ref(false);
const participantRatings = ref<Record<number, number>>({});
const existingRatings = ref<Array<Rating>>([]);

// Auth Composable
const { getCurrentUser: getUser } = useAuth();

// Current User
const currentUser = ref<{id: number, name: string} | null>(null);

const getCurrentUser = () => {
  currentUser.value = getUser();
  return currentUser.value;
};

// Computed Properties
const allOtherParticipants = computed(() => {
  if (!currentUser.value) return props.participants;
  return props.participants.filter(p => p.user_deck.user.id !== currentUser.value!.id);
});

const currentUserParticipant = computed(() => {
  if (!currentUser.value) return null;
  return props.participants.find(p => p.user_deck.user.id === currentUser.value!.id);
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

watch(() => props.participants, (newParticipants) => {
  if (newParticipants.length > 0) {
    // Update Gewinner wenn Participants geladen werden
    const currentWinners = newParticipants.filter(p => p.is_winner);
    if (currentWinners.length > 0) {
      selectedWinners.value = currentWinners.map(w => w.id);
    }
    // Lade bestehende Ratings
    loadExistingRatings();
  }
}, { immediate: true });

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
  // Zurücksetzen nur wenn keine Daten vorhanden
  if (selectedWinners.value.length === 0) {
    participantRatings.value = {};
    existingRatings.value = [];
  }

  // Finde aktuelle Gewinner falls vorhanden und setze sie
  if (props.participants.length > 0) {
    const currentWinners = props.participants.filter(p => p.is_winner);
    selectedWinners.value = currentWinners.map(w => w.id);

    // Log für Debugging
    if (currentWinners.length > 0) {
      console.log('Gewinner bereits eingetragen:', currentWinners.map(w => w.user_deck.user.name));
    }
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

const submitAllData = async () => {
  if (!currentUser.value || !props.game) return;

  submitting.value = true;
  try {
    // Setze Gewinner falls ausgewählt
    if (selectedWinners.value.length > 0) {
      // Setze jeden ausgewählten Gewinner
      for (const winnerId of selectedWinners.value) {
        await participationApi.setWinner(winnerId);
      }
    }

    // Speichere Bewertungen falls vorhanden
    if (Object.keys(participantRatings.value).length > 0) {
      for (const [participantIdStr, rating] of Object.entries(participantRatings.value)) {
        const participantId = parseInt(participantIdStr);
        const participant = props.participants.find(p => p.id === participantId);

        if (participant && currentUser.value) {
          const existingRating = existingRatings.value?.find((r: Rating) =>
            r.participation.id === participant.id
          );

          // Überprüfe ob es sich um eine Selbstbewertung handelt
          const isSelfRating = participant.user_deck.user.id === currentUser.value.id;

          const ratingData: CreateRatingRequest = {
            participation: participant.id,
            rater: currentUser.value.id,
            value: rating
          };

          try {
            if (existingRating) {
              await ratingApi.update(existingRating.id, ratingData);
            } else {
              await ratingApi.create(ratingData);
            }

            // Log für Debugging
            if (isSelfRating) {
              console.log(`Selbstbewertung gespeichert: ${rating}/10`);
            }
          } catch (error) {
            console.error(`Fehler beim Speichern der ${isSelfRating ? 'Selbst' : ''}bewertung für ${participant.user_deck.user.name}:`, error);
          }
        }
      }
    }

    emit('dataSubmitted', selectedWinners.value, participantRatings.value);

    // Event für Rating-Aktualisierung auslösen
    eventBus.emit('rating:submitted');

    closeModal();

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

/* Info Box Styles */
.info-box {
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid #3498db;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-box i {
  color: #3498db;
  font-size: 1.2rem;
}

.info-box p {
  margin: 0;
  color: #ecf0f1;
  font-size: 0.9rem;
  line-height: 1.4;
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

/* Self Rating Section Styles */
.self-rating-section {
  margin-top: 20px;
  padding: 20px;
  background: rgba(46, 125, 50, 0.1);
  border: 1px solid #2e7d32;
  border-radius: 10px;
  margin-bottom: 25px;
}

.self-rating-section h5 {
  color: #4caf50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.self-rating-section .rating-description {
  color: #a5d6a7;
  font-size: 0.9rem;
  margin-bottom: 15px;
  font-style: italic;
}

.self-rating-card {
  background: rgba(46, 125, 50, 0.15);
  border: 1px solid #388e3c;
  border-radius: 8px;
  padding: 15px;
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

.rating-player-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.player-details {
  flex: 1;
}

.winner-toggle {
  flex-shrink: 0;
}

.winner-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #ecf0f1;
  transition: all 0.2s ease;
}

.winner-checkbox:hover {
  color: #f39c12;
}

.winner-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  position: relative;
  width: 18px;
  height: 18px;
  background-color: rgba(52, 73, 94, 0.6);
  border: 2px solid #34495e;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.winner-checkbox input[type="checkbox"]:checked + .checkmark {
  background-color: #f39c12;
  border-color: #f39c12;
}

.winner-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #2c3e50;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.winner-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.winner-label i {
  color: #f39c12;
  font-size: 0.8rem;
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
