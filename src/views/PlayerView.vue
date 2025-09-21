<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TableComponent from '@/components/TableComponent.vue';
import TheNavbar from '@/components/TheNavbar.vue';
import { userApi } from '@/composables/api';
import type { User } from '@/types';

// Tabellenkonfiguration
const tableTitle = ref('Spieler');
const tableHeaders = ref(['ID', 'Name']);
const tableRows = ref<(string | number)[][]>([]);
const errorMessage = ref('');

// Daten laden
const fetchTableData = async () => {
  try {
    const users = await userApi.getAll();
    tableRows.value = users.map((user: User) => [
      user.id,
      user.name
    ]);
  } catch (error) {
    console.error('Fehler beim Laden der Spielerdaten:', error);
    errorMessage.value = 'Fehler beim Laden der Spielerdaten';
  }
};

// Komponente initialisieren
onMounted(() => {
  fetchTableData();
});
</script>

<template>
  <div class="container-fluid">
    <div class="row justify-content-center mb-3">
      <div class="col-12">
        <TheNavbar />
      </div>
    </div>

    <div class="row justify-content-center mb-3">
      <div class="col-12">
        <TableComponent
          :title="tableTitle"
          :headers="tableHeaders"
          :rows="tableRows"
          :rowsPerPage="3"
          :userColumns="[0]"
          :activeUpdate="false"
        />
        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}
</style>
