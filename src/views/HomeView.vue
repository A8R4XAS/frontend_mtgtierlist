<script setup lang="ts">
import { ref, onMounted } from 'vue';
import The1vs1Table from '@/components/The1vs1Table.vue';
import TheNavbar from '@/components/TheNavbar.vue';
import TableComponent from '@/components/TableComponent.vue';
import { userApi } from '@/composables/api';
import type { User } from '@/types';

// Tabellen-Konfiguration
const tableTitle = ref('Benutzerliste');
const tableHeaders = ref(['Name', 'Email']);
const tableRows = ref<string[][]>([]);
const errorMessage = ref('');

// Benutzerdaten laden
const fetchTableData = async () => {
  try {
    const users = await userApi.getAll();
    tableRows.value = users.map((user: User) => [
      user.name || '',
      user.email || ''
    ]);
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
    errorMessage.value = 'Fehler beim Laden der Usertabelle';
  }
};

// Komponente initialisieren
onMounted(() => {
  fetchTableData();
});
</script>

<template>
  <main>
    <div class="container-fluid">
      <div class="row justify-content-center mb-3">
        <div class="col-12">
          <TheNavbar />
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <The1vs1Table />
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
            :activeDelete="false"
            :activeUpdate="false"
            :font-size="'14px'"
          />
          <div v-if="errorMessage" class="error-message mt-3">{{ errorMessage }}</div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.error-message {
  color: #dc3545;
  font-weight: bold;
  text-align: center;
}
</style>

