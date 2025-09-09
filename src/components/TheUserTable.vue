<script setup lang="ts">
import { API_URL } from '@/composables/api';
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
      tableTitle: 'Benutzerliste',
      tableHeaders: ['ID', 'Name', 'Email'],
      tableRows: []
    };
  },
  methods: {
    async fetchTableData() {
      try {
        const response = await fetch(`${API_URL}/user/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json'},
          credentials: 'include'
        });
        const data = await response.json();
        this.tableRows = data.map(
          (user: { id: number; name: string; email: string; }) => [user.id, user.name, user.email]
        );
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
