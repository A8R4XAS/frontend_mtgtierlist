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
                                    <select v-model="player1_name" @change="updateElement('player1_name')"
                                        class="form-select" required>
                                        <option v-for="player in filteredPlayers('player1_name')" :key="player"
                                            :value="player">{{ player }}</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck1">Deck 1</label>
                                    <select v-model="deck1" @change="updateElement('deck1')" class="form-select"
                                        required>
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">{{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="player2">Spieler 2</label>
                                    <select v-model="player2_name" @change="updateElement('player2_name')"
                                        class="form-select" required>
                                        <option v-for="player in filteredPlayers('player2_name')" :key="player"
                                            :value="player">{{ player }}</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck2">Deck 2</label>
                                    <select v-model="deck2" @change="updateElement('deck2')" class="form-select"
                                        required>
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">{{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row" v-if="isVisible">
                                <div class="col-md-6 mb-3">
                                    <label for="player3">Spieler 3</label>
                                    <select v-model="player3_name" @change="updateElement('player3_name')"
                                        class="form-select" required>
                                        <option v-for="player in filteredPlayers('player3_name')" :key="player"
                                            :value="player">{{ player }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck3">Deck 3</label>
                                    <select v-model="deck3" @change="updateElement('deck3')" class="form-select"
                                        required>
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">{{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row" v-if="isVisible">
                                <div class="col-md-6 mb-3">
                                    <label for="player4">Spieler 4</label>
                                    <select v-model="player4_name" @change="updateElement('player4_name')"
                                        class="form-select" required>
                                        <option v-for="player in filteredPlayers('player4_name')" :key="player"
                                            :value="player">{{ player }}</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="deck4">Deck 4</label>
                                    <select v-model="deck4" @change="updateElement('deck4')" class="form-select"
                                        required>
                                        <option v-for="deck in deck_name" :key="deck" :value="deck">{{ deck }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <button class="btn btn-primary" @click="toggle"> {{ isVisible ? '-' : '+' }}
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


<script lang="ts">
import { API_URL } from '@/composables/api';

export default {
    data() {
        return {
            player_data: [],
            player_name: [],
            deck_name: [],
            deck_data: [],
            player1_name: "", deck1: "",
            player2_name: "", deck2: "",
            player3_name: "", deck3: "",
            player4_name: "", deck4: "",
            isVisible: false,
        };
    },
    methods: {
        toggle() { this.isVisible = !this.isVisible; },

        async fetchPlayers() {
            try {
                const response = await fetch(`${API_URL}/user`, {});
                if (!response.ok) {
                    console.log(response)
                    throw new Error('Network response was not ok')
                }
                const data = await response.json();
                this.player_data = data;
                this.player_name = data.map((player: { name: string; }) => player.name);

            } catch (error) {
                console.error('Error fetching players', error)
            }
        },
        async fetchDecks() {
            try {
                const response = await fetch(`${API_URL}/deck`, {});
                if (!response.ok) {
                    console.log(response)
                    throw new Error('Network response was not ok')
                }
                const data = await response.json();
                this.deck_data = data;
                this.deck_name = data.map((deck: { commander: string; }) => deck.commander);
            } catch (error) {
                console.error('Error fetching decks', error)
            }
        },


        updateElement(field: 'player1_name' | 'player2_name' | 'player3_name' | 'player4_name' | 'deck1' | 'deck2' | 'deck3' | 'deck4') {
            return (event: Event) => {
                const target = event.target as HTMLSelectElement;
                this[field] = target.value;
            };
        },

        filteredPlayers(currentField: 'player1_name' | 'player2_name' | 'player3_name' | 'player4_name') {
            const selectedPlayers = [this.player1_name, this.player2_name, this.player3_name, this.player4_name];
            return this.player_name.filter(player => !selectedPlayers.includes(player) || player === this[currentField]);
        },


        async submitGame() {
            // ID zum Player Namen holen
            const player1Id = this.getPlayerIdByName(this.player1_name, this.player_data);
            const deck1Id = this.getDeckIdByName(this.deck1, this.deck_data);
            const player2Id = this.getPlayerIdByName(this.player2_name, this.player_data);
            const deck2Id = this.getDeckIdByName(this.deck2, this.deck_data);

            // ID nur holen, wenn ein Name angegeben wurde
            const player3Id = this.player3_name === "" ? null : this.getPlayerIdByName(this.player3_name, this.player_data);
            const deck3Id = this.deck3 === "" ? null : this.getDeckIdByName(this.deck3, this.deck_data);
            const player4Id = this.player4_name === "" ? null : this.getPlayerIdByName(this.player4_name, this.player_data);
            const deck4Id = this.deck4 === "" ? null : this.getDeckIdByName(this.deck4, this.deck_data);

            const requestBody = {
                user1: player1Id,
                deck1: deck1Id,
                user2: player2Id,
                deck2: deck2Id,
                user3: player3Id,
                deck3: deck3Id,
                user4: player4Id,
                deck4: deck4Id,
            };

            console.log('Request Body:', requestBody); // Überprüfe die gesendeten Daten

            try {
                const response = await fetch(`${API_URL}/game/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    credentials: 'include'
                });

                if (!response.ok) {
                    console.log(response);
                    throw new Error('Network response was not ok');
                } else {
                    console.log(response);
                }

            } catch (error) {
                console.error('Error post Game', error);
            }
        },

        // Funktion zum Abrufen der Spieler-ID basierend auf dem Namen
        getPlayerIdByName(playerName: string, players: { name: string; id: number; }[]): number {
            const player = players.find(player => player.name === playerName);
            return player ? player.id : 0;
        },
        // Funktion zum Abrufen der Deck-ID basierend auf dem Namen
        getDeckIdByName(deckName: string, decks: { commander: string; id: number; }[]): number {
            const deck = decks.find(deck => deck.commander === deckName);
            return deck ? deck.id : 0;
        }
    },
    created() {
        this.fetchPlayers();
        this.fetchDecks();
    }
};

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
    /* Fallback-Hintergrundfarbe */
    transition:
        color 0.5s,
        background-color 0.5s;
    border-radius: 4px;
    /* Hier die Ecken abrunden */
    /*padding: 3px; /* Optionales Padding, um etwas Abstand innerhalb des Navs zu schaffen */
    border: 1px solid black;
    /* Schwarzer Rand hinzufügen */
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
