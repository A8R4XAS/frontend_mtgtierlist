<script setup lang="ts">
import { ref, watch } from 'vue';
import TableComponent from './TableComponent.vue';
import UserEditModal from './UserEditModal.vue';
import UserCreateModal from './UserCreateModal.vue';
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

// Modal State
const showEditModal = ref(false);
const showCreateModal = ref(false);
const selectedUserId = ref<number | null>(null);

// Daten laden
const fetchTableData = async () => {
  try {
    if (!isAdmin.value) {
      // Admin-Check wird jetzt im Template gemacht
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

    // Fehler zurücksetzen bei erfolgreichem Laden
    errorMessage.value = '';
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
    errorMessage.value = 'Fehler beim Laden der Benutzerliste';
    tableRows.value = [];
  }
};

// Modal Handlers
const handleEditUser = (userId: number) => {
  selectedUserId.value = userId;
  showEditModal.value = true;
};

const handleCreateUser = () => {
  showCreateModal.value = true;
};

const handleCloseModal = () => {
  showEditModal.value = false;
  showCreateModal.value = false;
  selectedUserId.value = null;
};

const handleUserUpdated = () => {
  // Tabelle neu laden nach Update
  fetchTableData();
};

const handleUserCreated = () => {
  // Tabelle neu laden nach Erstellung
  fetchTableData();
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
  <div class="user-table-container">
    <!-- Nur für Admins sichtbar -->
    <div v-if="isAdmin">
      <TableComponent
        :title="tableTitle"
        :headers="tableHeaders"
        :rows="tableRows"
        :rowsPerPage="5"
        :userColumns="[0]"
        :activeUpdate="true"
        @update-row="handleEditUser"
      />

      <!-- Button mittig unter der Tabelle -->
      <div class="table-footer">
        <button
          @click="handleCreateUser"
          class="btn btn-success btn-create-user"
        >
          <i class="fas fa-user-plus"></i>
          Neuer Benutzer
        </button>
      </div>
    </div>

    <!-- Fehlermeldung wenn kein Admin -->
    <div v-else class="alert alert-danger mt-3">
      Zugriff verweigert. Nur Administratoren können die Benutzerliste einsehen.
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>

    <!-- User Edit Modal -->
    <UserEditModal
      :isVisible="showEditModal"
      :userId="selectedUserId"
      @close="handleCloseModal"
      @userUpdated="handleUserUpdated"
    />

    <!-- User Create Modal -->
    <UserCreateModal
      :isVisible="showCreateModal"
      @close="handleCloseModal"
      @userCreated="handleUserCreated"
    />
  </div>
</template>

<style scoped>
.user-table-container {
  position: relative;
}

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 0 10px;
}

.btn-create-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-create-user:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.btn-create-user:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-create-user i {
  font-size: 1rem;
}

.alert {
  font-size: 0.9rem;
  text-align: center;
  padding: 15px;
  border-radius: 6px;
}
</style>
