<template>
    <div class="triple-border">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12 game-form">
                    <h2>Neues Spiel erfassen</h2>
                    <form @submit.prevent="submitGame">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="player1">Spieler 1</label>
                                    <select v-model="player1_name" class="form-select" required>
                                        <option v-for="player in filteredPlayers('player1_name')" :key="player" :value="player">
                                            {{ player }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck1">Deck 1</label>
                                    <select v-model="deck1" class="form-select" required>
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">
                                            {{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="player2">Spieler 2</label>
                                    <select v-model="player2_name" class="form-select" required>
                                        <option v-for="player in filteredPlayers('player2_name')" :key="player" :value="player">
                                            {{ player }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck2">Deck 2</label>
                                    <select v-model="deck2" class="form-select" required>
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">
                                            {{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row" v-if="isVisible">
                                <div class="col-md-6 mb-3">
                                    <label for="player3">Spieler 3</label>
                                    <select v-model="player3_name" class="form-select">
                                        <option v-for="player in filteredPlayers('player3_name')" :key="player" :value="player">
                                            {{ player }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck3">Deck 3</label>
                                    <select v-model="deck3" class="form-select">
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">
                                            {{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row" v-if="isVisible">
                                <div class="col-md-6 mb-3">
                                    <label for="player4">Spieler 4</label>
                                    <select v-model="player4_name" class="form-select">
                                        <option v-for="player in filteredPlayers('player4_name')" :key="player" :value="player">
                                            {{ player }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck4">Deck 4</label>
                                    <select v-model="deck4" class="form-select">
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">
                                            {{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <button type="button" class="btn btn-primary" @click="toggleVisibility">
                                        {{ isVisible ? '-' : '+' }}
                                    </button>
                                </div>
                                <div class="col-md-6">
                                    <button type="submit" class="btn btn-success">Spiel erfassen</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Ziel dieser Komponente:
 * - Ermöglicht das Erfassen von Magic: The Gathering Spielen mit 2-4 Spielern
 * - Jeder Spieler wählt seinen Namen und das verwendete Deck aus
 * - Die Daten werden in der Datenbank gespeichert für spätere Auswertungen
 *
 * Funktionsweise:
 * 1. Beim Laden werden alle verfügbaren Spieler und Decks von der API geladen
 * 2. Benutzer wählt Spieler und zugehörige Decks aus (min. 2, max. 4)
 * 3. Bei Absenden wird ein neues Spiel erstellt und die Teilnahmen gespeichert
 * 4. Das Formular wird zurückgesetzt für die nächste Eingabe
 */

import { ref, onMounted } from 'vue';
import { gameApi, participationApi, userApi, deckApi } from '@/composables/api';
import type { CreateParticipationRequest, User, Deck } from '@/types';

// State-Management mit Vue Refs
// Speichert die vollständigen Datensätze für spätere ID-Lookups
const player_data = ref<Array<User>>([]); // Vollständige Spielerdaten
const deck_data = ref<Array<Deck>>([]); // Vollständige Deck-Daten

// Arrays für die Dropdown-Menüs
const player_name = ref<Array<string>>([]); // Liste der Spielernamen
const deck_name = ref<Array<string>>([]); // Liste der Deck-Namen

// Formularfelder für bis zu 4 Spieler
const player1_name = ref(""); // Name Spieler 1 (erforderlich)
const deck1 = ref(""); // Deck Spieler 1 (erforderlich)
const player2_name = ref(""); // Name Spieler 2 (erforderlich)
const deck2 = ref(""); // Deck Spieler 2 (erforderlich)
const player3_name = ref(""); // Name Spieler 3 (optional)
const deck3 = ref(""); // Deck Spieler 3 (optional)
const player4_name = ref(""); // Name Spieler 4 (optional)
const deck4 = ref(""); // Deck Spieler 4 (optional)

// Steuert die Sichtbarkeit der optionalen Spieler 3 und 4
const isVisible = ref(false);

// Methoden für die Komponentenlogik

/**
 * Schaltet die Sichtbarkeit der optionalen Spielerfelder (3 & 4) um
 * Wird durch den "+/-" Button gesteuert
 */
const toggleVisibility = () => {
    isVisible.value = !isVisible.value;
};

/**
 * Lädt alle verfügbaren Spieler von der API
 * - Speichert die vollständigen Spielerdaten für spätere ID-Lookups
 * - Extrahiert die Benutzernamen für die Dropdown-Menüs
 */
const fetchPlayers = async () => {
    try {
        const data = await userApi.getAll();
        player_data.value = data;
        player_name.value = data.map((player: User) => player.username);
    } catch (error) {
        console.error('Error fetching players:', error);
    }
};

/**
 * Lädt alle verfügbaren Decks von der API
 * - Speichert die vollständigen Deck-Daten für spätere ID-Lookups
 * - Extrahiert die Commander-Namen für die Dropdown-Menüs
 */
const fetchDecks = async () => {
    try {
        const data = await deckApi.getAll();
        deck_data.value = data;
        deck_name.value = data.map((deck: Deck) => deck.commander);
    } catch (error) {
        console.error('Error fetching decks:', error);
    }
};

/**
 * Findet die ID eines Spielers anhand seines Benutzernamens
 * @param playerName - Der Benutzername des gesuchten Spielers
 * @returns Die ID des Spielers oder 0 falls nicht gefunden
 */
const getPlayerIdByName = (playerName: string): number => {
    const player = player_data.value.find((p: User) => p.username === playerName);
    return player ? player.id : 0;
};

/**
 * Findet die ID eines Decks anhand seines Commander-Namens
 * @param deckName - Der Commander-Name des gesuchten Decks
 * @returns Die ID des Decks oder 0 falls nicht gefunden
 */
const getDeckIdByName = (deckName: string): number => {
    const deck = deck_data.value.find((d: Deck) => d.commander === deckName);
    return deck ? deck.id : 0;
};

/**
 * Filtert die Spielerliste für ein bestimmtes Auswahlfeld
 * Verhindert, dass ein Spieler mehrfach ausgewählt werden kann
 * Der aktuell im Feld ausgewählte Spieler bleibt in der Liste verfügbar
 *
 * @param currentField - Name des aktuellen Auswahlfelds ('player1_name', etc.)
 * @returns Gefilterte Liste von Spielernamen für das Dropdown-Menü
 */
const filteredPlayers = (currentField: string) => {
    // Sammelt alle aktuell ausgewählten Spieler
    const selectedPlayers = [
        player1_name.value,
        player2_name.value,
        player3_name.value,
        player4_name.value
    ];
    // Filtert die Spielerliste:
    // Zeigt nur Spieler, die entweder:
    // - noch nicht ausgewählt sind ODER
    // - im aktuellen Feld ausgewählt sind
    return player_name.value.filter(
        player => !selectedPlayers.includes(player) || player === getCurrentFieldValue(currentField)
    );
};

/**
 * Hilfsfunktion: Gibt den aktuell ausgewählten Wert eines Spielerfelds zurück
 * @param field - Name des Feldes ('player1_name', etc.)
 * @returns Aktuell ausgewählter Spielername oder leerer String
 */
const getCurrentFieldValue = (field: string): string => {
    switch (field) {
        case 'player1_name': return player1_name.value;
        case 'player2_name': return player2_name.value;
        case 'player3_name': return player3_name.value;
        case 'player4_name': return player4_name.value;
        default: return '';
    }
};

/**
 * Setzt alle Formularfelder auf ihre Ausgangswerte zurück
 * Wird nach erfolgreichem Speichern eines Spiels aufgerufen
 */
const resetForm = () => {
    // Spielernamen zurücksetzen
    player1_name.value = "";
    player2_name.value = "";
    player3_name.value = "";
    player4_name.value = "";

    // Deck-Auswahl zurücksetzen
    deck1.value = "";
    deck2.value = "";
    deck3.value = "";
    deck4.value = "";

    // Zusätzliche Spielerfelder ausblenden
    isVisible.value = false;
};

/**
 * Hauptfunktion zum Speichern eines neuen Spiels
 * Ablauf:
 * 1. Erstellt ein neues Spiel in der Datenbank
 * 2. Erstellt Teilnahme-Einträge für jeden Spieler mit seinem Deck
 * 3. Setzt das Formular zurück
 * 4. Informiert die Elternkomponente über das neue Spiel
 */
const submitGame = async () => {
    try {
        // 1. Erstellt ein neues Spiel und erhält die generierte ID
        const game = await gameApi.create();

        // 2. Bereitet die Teilnahme-Datensätze vor
        const participations: CreateParticipationRequest[] = [];

        // Pflichtfelder: Spieler 1 und 2 (immer vorhanden)
        participations.push({
            user: getPlayerIdByName(player1_name.value),
            deck: getDeckIdByName(deck1.value),
            game: game.id
        });

        participations.push({
            user: getPlayerIdByName(player2_name.value),
            deck: getDeckIdByName(deck2.value),
            game: game.id
        });

        // Optionale Spieler: Nur hinzufügen wenn Name UND Deck ausgewählt wurden
        if (player3_name.value && deck3.value) {
            participations.push({
                user: getPlayerIdByName(player3_name.value),
                deck: getDeckIdByName(deck3.value),
                game: game.id
            });
        }

        if (player4_name.value && deck4.value) {
            participations.push({
                user: getPlayerIdByName(player4_name.value),
                deck: getDeckIdByName(deck4.value),
                game: game.id
            });
        }

        // 3. Speichert alle Teilnahmen in einem Rutsch
        await participationApi.createBulk(participations);

        // 4. Setzt das Formular für die nächste Eingabe zurück
        resetForm();

        // 5. Informiert die Elternkomponente über das neue Spiel
        emit('game-created', game.id);
    } catch (error) {
        console.error('Error creating game:', error);
    }
};

/**
 * Lifecycle Hook: Wird ausgeführt, wenn die Komponente erstellt wird
 * Lädt die notwendigen Daten für die Dropdown-Menüs
 */
onMounted(() => {
    fetchPlayers(); // Lädt die Liste aller Spieler
    fetchDecks();   // Lädt die Liste aller Decks
});

/**
 * Event-Definition für die Kommunikation mit der Elternkomponente
 * Sendet die ID des neu erstellten Spiels nach erfolgreichem Speichern
 */
const emit = defineEmits<{
    (e: 'game-created', gameId: number): void
}>();
</script>

<style scoped>
.game-form {
    font-size: 25px;
    color: #2c3e50;
    text-align: center;
    padding: 12px;
    background: url(../assets/background_textfeld.jpg) no-repeat center center fixed, var(--color-background);
    background-size: cover;
    background-color: var(--color-background);
    transition: color 0.5s, background-color 0.5s;
    border-radius: 4px;
    border: 1px solid black;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.game-form label {
    display: block;
    font-weight: bold;
}

.game-form select {
    min-width: 125px;
    padding: 0.5rem;
    border: 1px solid #aaa;
    border-radius: 8px;
}
</style>
