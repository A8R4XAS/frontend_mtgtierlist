<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TableComponent from './TableComponent.vue';
import { userApi } from '@/composables/api';
import type { User } from '@/types';

// Tabellenkonfiguration
const tableTitle = ref('Benutzerliste');
const tableHeaders = ref(['ID', 'Name', 'Email']);
const tableRows = ref<(string | number)[][]>([]);
const errorMessage = ref('');

// Daten laden
const fetchTableData = async () => {
  try {
    const users = await userApi.getAll();

    tableRows.value = users.map((user: User) => [
      user.id,
      user.name,
      user.email
    ]);
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
    errorMessage.value = 'Fehler beim Laden der Benutzerliste';
    tableRows.value = [];
  }
};

// Komponente initialisieren
onMounted(() => {
  fetchTableData();
});
</script>

<template>
  <div>
    <TableComponent
      :title="tableTitle"
      :headers="tableHeaders"
      :rows="tableRows"
      :rowsPerPage="3"
      :userColumns="[0]"
    />
    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.alert {
  font-size: 0.9rem;
  text-align: center;
}
</style>
