<script setup lang="ts">
import { ref, watch } from 'vue';
import TableComponent from './TableComponent.vue';
import { userApi } from '@/composables/api';
import type { User } from '@/types';
import { UserRole } from '@/types';
import { useAdmin } from '@/composables/useAdmin';

// Admin-Check aus dem Composable
const { isAdmin } = useAdmin();

// Tabellenkonfiguration
const tableTitle = ref('Benutzerliste');
const tableHeaders = ref(['ID', 'Name', 'Email', 'Rolle']);
const tableRows = ref<(string | number)[][]>([]);
const errorMessage = ref('');

// Daten laden
const fetchTableData = async () => {
  try {
    if (!isAdmin.value) {
      errorMessage.value = 'Zugriff verweigert. Nur Administratoren können die Benutzerliste einsehen.';
      tableRows.value = [];
      return;
    }

    const users = await userApi.getAll();

    tableRows.value = users.map((user: User) => [
      user.id,
      user.name,
      user.email,
      user.role || UserRole.USER
    ]);
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
    errorMessage.value = 'Fehler beim Laden der Benutzerliste';
    tableRows.value = [];
  }
};

// Komponente initialisieren

// Warte auf Änderung von isAdmin (wird von useAdmin gesetzt)
watch(isAdmin, (newValue) => {
  if (newValue === true) {
    fetchTableData();
  }
}, { immediate: true }); // immediate: true führt watch sofort aus
</script>

<template>
  <div>
    <TableComponent
      :title="tableTitle"
      :headers="tableHeaders"
      :rows="tableRows"
      :rowsPerPage="5"
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
