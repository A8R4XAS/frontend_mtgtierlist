<script setup lang="ts">
import { fetchWrapper } from '@/composables/fetchWrapper';
import TableComponent from './TableComponent.vue';
</script>

<template>
  <TableComponent :title="tableTitle" :headers="tableHeaders" :rows="tableRows" :rowsPerPage="5" :userColumns="[0]" :fontSize="'14px'"/>
</template>

<script lang="ts">
export default {
  components: {
    TableComponent
  },
  data() {
    return {
      tableTitle: 'Deckliste',
      tableHeaders: ['ID', 'Besitzer', 'Commander', 'Thema', 'Gameplan', 'Tempo', 'Tier', 'Schwäche'],
      tableRows: []
    };
  },
  methods: {
    async fetchTableData() {
      try {

        const data = await fetchWrapper('/deck/');

        this.tableRows = data.map(
          (Deck: {
            id: number;
            owner: {
              id: number;
              name: string;
            };
            commander: string;
            thema: string;
            gameplan: string;
            tempo: string;
            tier: number;
            weakness: string;
          }) => [
              Deck.id,
              Deck.owner.name,
              Deck.commander,
              Deck.thema,
              Deck.gameplan,
              Deck.tempo,
              Deck.tier,
              Deck.weakness,
            ]);
      } catch (error) {
        console.error('Fehler beim Laden der Userdaten: ', error)
      }
    }
  },
  created() {
    this.fetchTableData();
  },
};

</script>
