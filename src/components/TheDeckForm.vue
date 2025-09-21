<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { deckApi, userApi } from '@/composables/api';
import type { User } from '@/types';

// Formularfelder
const commander = ref('');
const thema = ref('');
const gameplan = ref('');
const tempo = ref('');
const tier = ref('');
const weakness = ref('');

// Status und Feedback
const saveSuccess = ref(false);
const errorMessage = ref('');
const user = ref<User | null>(null);

// Konstanten
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

// Benutzerdaten laden
const fetchUser = async () => {
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            errorMessage.value = 'Bitte melden Sie sich an, um ein Deck zu erstellen.';
            return;
        }

        const userData = JSON.parse(storedUser);
        user.value = await userApi.get(userData.id);
    } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
        errorMessage.value = 'Fehler beim Laden der Benutzerdaten';
    }
};

// Deck speichern
const submitDeck = async () => {
    try {
        if (!user.value?.id) {
            errorMessage.value = 'Bitte melden Sie sich an, um ein Deck zu erstellen.';
            return;
        }

        await deckApi.create({
            owner: user.value.id,
            commander: commander.value,
            thema: thema.value,
            gameplan: gameplan.value,
            tempo: tempo.value,
            tier: Number(tier.value) || 0,
            weaknesses: weakness.value
        });

        // Erfolgsmeldung anzeigen
        saveSuccess.value = true;
        errorMessage.value = '';

        // Formular zurücksetzen
        commander.value = '';
        thema.value = '';
        gameplan.value = '';
        tempo.value = '';
        tier.value = '';
        weakness.value = '';

        // Erfolgsmeldung ausblenden
        setTimeout(() => {
            saveSuccess.value = false;
        }, 3000);
    } catch (error) {
        console.error('Fehler beim Speichern des Decks:', error);
        errorMessage.value = 'Fehler beim Speichern des Decks';
        saveSuccess.value = false;
    }
};

// Komponente initialisieren
onMounted(() => {
    fetchUser();
});
</script>

<template>
    <div class="triple-border">
        <div class="game-form">
            <h2>Neues Deck erfassen</h2>
            <form @submit.prevent="submitDeck">
                <div class="container">
                    <div class="item">
                        <label for="commander">Commander: </label>
                        <input id="commander" type="text" v-model="commander" required />
                    </div>
                    <div class="item">
                        <label for="gameplan">Gameplan: </label>
                        <input id="gameplan" type="text" v-model="gameplan" required />
                    </div>
                    <div class="item">
                        <label for="thema">Thema: </label>
                        <input id="thema" type="text" v-model="thema" required />
                    </div>
                    <div class="item">
                        <label for="tempo">Tempo: </label>
                        <select id="tempo" v-model="tempo" required>
                            <option v-for="elem in tempi" :key="elem" :value="elem"
                                :class="{ bold: isBold(elem), small: isSmall(elem) }">
                                {{ elem }}
                            </option>
                        </select>
                    </div>
                    <div class="item">
                        <label for="tier">Tier: </label>
                        <input id="tier" type="text" v-model="tier" placeholder="is ne 7"/>
                    </div>
                    <div class="item">
                        <label for="weakness">Weakness: </label>
                        <input id="weakness" type="text" v-model="weakness" />
                    </div>
                </div>
                <button type="submit" class="item" :disabled="!user?.id">Deck erfassen</button>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div v-if="saveSuccess" class="success-message">Daten erfolgreich gespeichert!</div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.item {
    margin: 10px;
    /* Abstand zwischen den Elementen */
}
.game-form {
    width: 100%;
    font-size: 25px;
    color: #2c3e50;
    text-align: center;
    background: url(../assets/background_textfeld.jpg) no-repeat center center fixed, var(--color-background);
    background-size: cover;
    background-color: var(--color-background);
    /* Fallback-Hintergrundfarbe */
    transition:
        color 0.5s,
        background-color 0.5s;
    border-radius: 4px;
    /* Hier die Ecken abrunden */
    padding: 15px;
    /* Optionales Padding, um etwas Abstand innerhalb des Navs zu schaffen */
    border: 1px solid black;
    /* Schwarzer Rand hinzufügen */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.game-form input {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    /* Stellt sicher, dass Padding und Border in der Breite enthalten sind */
    padding: 0.5rem;
    border: 1px solid #aaa;
    border-radius: 4px;
}

.game-form select {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    /* Stellt sicher, dass Padding und Border in der Breite enthalten sind */
    padding: 0.625rem;
    /* Padding hinzufügen, um Platz um den Text zu schaffen */
    border: 1px solid #aaa;
    border-radius: 4px;
}

.game-form button {
    margin: 4px;
    padding-left: 2%;
    padding-right: 2%;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: larger;
}

.game-form button:hover {
    background-color: #0056b3;
}

.bold {
    font-weight: bold;
}

.small {
    font-size: small;
}
</style>
