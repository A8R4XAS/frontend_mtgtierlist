<template>
    <div class="triple-border">
        <div class="game-form">
            <h2>Neues Deck erfassen</h2>
            <form @submit.prevent="submitDeck">
                <div class="container">
                    <div class="item">
                        <label for="commander">Commander: </label>
                        <input type="text" v-model="commander" required />
                    </div>
                    <div class="item">
                        <label for="gameplan">Gameplan: </label>
                        <input type="text" v-model="gameplan" required />
                    </div>
                    <div class="item">
                        <label for="thema">Thema: </label>
                        <input type="text" v-model="thema" required />
                    </div>
                    <div class="item">
                        <label for="tempo">Tempo: </label>
                        <select v-model="tempo" required>
                            <option v-for="elem in tempi" :key="elem" :value="elem" :class="{
                                bold: isBold(elem),
                                small: isSmall(elem)
                            }">
                                {{ elem }}</option>
                        </select>
                    </div>
                    <div class="item">
                        <label for="tier">Tier: </label>
                        <input type="text" v-model="tier" placeholder="is ne 7"/>
                    </div>
                    <div class="item">
                        <label for="weakness">Weakness: </label>
                        <input type="text" v-model="weakness" />
                    </div>
                </div>
                <button class="item">Deck erfassen</button>
                <div class="success-message" v-if="saveSuccess">Daten erfolgreich gespeichert!</div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    data() {
        return {
            commander: "",
            thema: "",
            gameplan: "",
            tempo: "",
            tier: "",
            weakness: "",
            tempi: ["Turn 0", "AGGRO", "Aggro to Midgame", "MID-GAME", "Midgame to Lategame", "LATE-GAME", "Wo WinCon?"],
            user: {
                id: null,
                email: '',
                name: ''
            },
            saveSuccess: false
        };
    },
    methods: {
        async submitDeck() {
            try {
                const response = await fetch(`http://localhost:3001/api/deck/${this.user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        owner: this.user.id,
                        commander: this.commander,
                        thema: this.thema,
                        gameplan: this.gameplan,
                        tempo: this.tempo,
                        tier: this.tier,
                        weakness: this.weakness
                    }),
                    credentials: 'include'
                })

                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }

                this.saveSuccess = true;
                setTimeout(() => { this.saveSuccess = false }, 3000);

            } catch (error) {
                console.error('Error post Game', error)
            }
        },
        async fetchUser() {
            try {
                const localUser = localStorage.getItem('user');
                if (!localUser) return;
                this.user = JSON.parse(localUser);
                const response = await fetch(`http://localhost:3001/api/user/${this.user.id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (!response.ok) {
                    console.log(response)
                    throw new Error('Network response was not ok')
                }
                this.user = await response.json();
            } catch (error) {
                console.error('Fehler beim Laden der Benutzerdaten: ', error)
            }
        },
        isBold(elem: string) {
            // Definiere hier die Elemente, die fettgedruckt sein sollen 
            const boldElements = ["AGGRO", "MID-GAME", "LATE-GAME"];
            return boldElements.includes(elem);
        },
        isSmall(elem: string) {
            // Definiere hier die Elemente, die fettgedruckt sein sollen 
            const smallElements = ["Turn 0", "Aggro to Midgame", "Midgame to Lategame", "Wo WinCon?"];
            return smallElements.includes(elem);
        },
    },
    created() {
        this.fetchUser();
    }
};
</script>

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