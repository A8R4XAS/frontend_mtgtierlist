<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue';
import GameForm from '@/components/TheGameForm.vue';
import TableComponent from '@/components/TableComponent.vue';
import DeckForm from '@/components/TheDeckForm.vue';
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
          <GameForm />
        </div>
      </div>
    
      <div class="row justify-content-center mb-3 g-1">
        <div class="col-12">
              <!-- TODO:  Profile-Form auslagern und dann triple border drum.
                Prüfe ob bei Deckfrom es identisch ist!            
                Auslagern weil es bei GameForm auch so ist.
              -->
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
            @delete-row="deleteDeck" 
            :font-size="'25px'"
          />
        </div>
      </div>

    </div>

  </main>
</template>


<script lang="ts">
export default {
  data() {
    return {
      tableTitle: 'Deine Decks',
      tableHeaders: ['ID', 'Commander', 'Thema', 'Gameplan', 'Tempo', 'Tier', 'Schwäche', ' '],
      tableRows: [],
      user: {
        id: null,
        email: '',
        password: '',
        name: ''
      },
      saveSuccess: false
    };
  },
  methods: {
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
    async updateUser() {
      try {
        const response = await fetch(`http://localhost:3001/api/user/${this.user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify(this.user),
          credentials: 'include'
        });
        if (!response.ok) {
          alert('Fehler beim Updaten')
          throw new Error('Network response was not ok')
        }
        this.saveSuccess = true;
        setTimeout(() => { this.saveSuccess = false }, 3000);
      } catch (error) {
        console.error('Fehler beim Updaten der Benutzerdaten', error);
        this.saveSuccess = false;
      }
    },
    async fetchTableData() {
      try {
        const response = await fetch('http://localhost:3001/api/deck/', {});
        const data = await response.json();
        this.tableRows = data.map(
          (Deck: {
            id: number;
            commander: string;
            thema: string;
            gameplan: string;
            tempo: string;
            tier: number;
            weakness: string;
          }) => [
              Deck.id,
              Deck.commander,
              Deck.thema,
              Deck.gameplan,
              Deck.tempo,
              Deck.tier,
              Deck.weakness
            ]);
      } catch (error) {
        console.error('Fehler beim Laden der Userdaten: ', error)
      }

    },
    async deleteDeck(id: number) {
      try {
        const response = await fetch(`http://localhost:3001/api/deck/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          console.log(response);
          throw new Error('Network response was not ok');
        }
        this.fetchTableData(); // Tabelle nach dem Löschen aktualisieren 
      } catch (error) {
        console.error('Fehler beim Löschen des Decks: ', error);
      }
    }
  },
  created() {
    this.fetchUser();
    this.fetchTableData();
  }
}
</script>

<style scoped>
.profile-form {
  width: 100%;
  font-size: 25px;
  color: #2c3e50;
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


</style>