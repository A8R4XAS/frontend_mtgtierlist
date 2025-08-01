<script setup lang="ts">
import TableComponent from './TableComponent.vue';
</script>

<template>
  <TableComponent :title="tableTitle" :headers="tableHeaders" :rows="tableRows" :rowsPerPage="3" :userColumns="[0]" />
</template>

<script lang="ts">
export default {
  components: {
    TableComponent
  },
  data() {
    return {
      tableTitle: '1 vs. 1',
      tableHeaders: ['ID', 'Spieler 1', 'Deck', 'Spieler 2', 'Deck', 'Sieger'],
      tableRows: [],
      user: {
        id: null,
        name: ''
      }
    };
  },
  methods: {
    async fetchTableData() {
      try {
        const localUser = localStorage.getItem('user');
        if (!localUser) return;
        this.user = JSON.parse(localUser);

        const response = await fetch(`http://localhost:3001/api/game/${this.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
           },
          credentials: 'include'
        });

        console.log(response);
        const data = await response.json();
        console.log('Es kommen Daten aus 1vs1 ',data);

        this.tableRows = data.map(
          (Spiel: {
            id: number;
            user_deck1: {
              id: number;
              user: {
                id: number;
                name: string;
              };
              deck: {
                id: number;
                owner: string;
                commander: string;
              };
            };
            user_deck2: {
              id: number;
              user: {
                id: number;
                user: {
                  id: number;
                  name: string;
                };
              };
              deck: {
                id: number;
                owner: string;
                commander: string;
              };
            };
            winner: {
              user: {
                id: number;
                name: string;
              }
            }

          }) => [
              Spiel.id,
              Spiel.user_deck1.user,
              Spiel.user_deck1.deck,
              Spiel.user_deck2.user,
              Spiel.user_deck2.deck,
              Spiel.winner
            ]);
      } catch (error) {
        console.error('Fehler beim Laden der Tabellendaten: ', error);
        this.tableRows = [];
      }
    }
  },
  created() {
    this.fetchTableData();
  },
};

</script>
