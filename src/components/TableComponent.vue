<template>
  <div class="triple-border">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 table-container">
          <h2 v-if="title">{{ title }}</h2>
          <div class="row">
            <div class="col-9"></div>
            <div class="col-3">
              <input type="text" v-model="filter" class="form-control" placeholder="Filter..." @input="applyFilter" />
            </div>
          </div>
          <div class="form-check mb-3">
            <input v-if="userColumn" type="checkbox" v-model="userFilter" class="form-check-input"
              @change="applyFilter" />
            <label v-if="userColumn" class="form-check-label"> Nur meine Einträge </label>
          </div>
          <table class="table table-striped">
            <thead>
              <tr>
                <th v-for="(header, index) in headers" :key="index" @click="toggleSort(index)">
                  {{ header }}
                  <span v-if="sortColumn === index">
                    {{ sortOrder === 'asc' ? '▲' : '▼' }}
                  </span>
                  <span v-else>⇅</span>
                </th>
                <th v-if="activeUpdate">Aktionen</th> <!-- Neue Spalte für Aktionen -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in paginatedRows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                <td v-if="activeDelete || activeUpdate" class="action-cell">
                  <button v-if="activeDelete" @click="deleteRow(row[0] as number)" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash-alt"></i> <!-- Font Awesome Icon -->
                  </button>
                  <button
                    v-if="activeUpdate && isRowEditable(row[0] as number)"
                    @click="updateRow(row[0] as number)"
                    class="btn btn-primary btn-sm"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary btn-sm">-</button>
            <span> Seite {{ currentPage }} von {{ Math.ceil(filteredRows.length / rowsPerPage) }}</span>
            <button @click="nextPage" :disabled="currentPage * rowsPerPage >= filteredRows.length"
              class="btn btn-secondary btn-sm">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

// Typen
type TableRow = (string | number)[];
type TableRows = TableRow[];
type SortOrder = 'asc' | 'desc';

// Props
interface Props {
  title?: string;
  headers: string[];
  rows: TableRows;
  rowsPerPage?: number;
  userColumn?: boolean;
  userColumns: number[];
  activeDelete?: boolean;
  activeUpdate?: boolean;
  editableRowIds?: number[];
  fontSize?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  rowsPerPage: 10,
  userColumn: false,
  activeDelete: false,
  activeUpdate: false,
  editableRowIds: () => [],
  fontSize: '18px'
});

// Emits
const emit = defineEmits<{
  (e: 'delete-row', id: number): void;
  (e: 'update-row', id: number): void;
}>();

// Reaktive Zustände
const filter = ref('');
const userFilter = ref(false);
const filteredRows = ref<TableRows>([]);
const sortColumn = ref<number | null>(null);
const sortOrder = ref<SortOrder>('asc');
const currentPage = ref(1);
const userId = ref<number | null>(null);

// Prüfen ob eine Zeile bearbeitbar ist
const isRowEditable = (rowId: number): boolean => {
  // Wenn keine editableRowIds angegeben wurden, sind alle Zeilen bearbeitbar (Standardverhalten)
  if (!props.editableRowIds || props.editableRowIds.length === 0) {
    return true;
  }
  // Prüfen ob die rowId in der Liste der bearbeitbaren IDs ist
  return props.editableRowIds.includes(rowId);
};

// Benutzer laden
onMounted(() => {
  const localUser = localStorage.getItem('user');
  if (localUser) {
    userId.value = JSON.parse(localUser).id;
    applyFilter();
  }
});

// Filter anwenden
const applyFilter = () => {
  const filterLowerCase = filter.value.toLowerCase();

  filteredRows.value = props.rows.filter((row: TableRow) => {
    const matchesFilter = row.some((cell) =>
      cell.toString().toLowerCase().includes(filterLowerCase)
    );
    const matchesUser = !userFilter.value || props.userColumns.some(index =>
      row[index] === userId.value
    );
    return matchesFilter && matchesUser;
  });

  sortRows();
  currentPage.value = 1;
};

// Sortierung
const sortRows = () => {
  if (sortColumn.value !== null) {
    filteredRows.value.sort((a, b) => {
      const aValue = a[sortColumn.value!];
      const bValue = b[sortColumn.value!];

      if (aValue === undefined || bValue === undefined) return 0;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });
  }
};

const toggleSort = (columnIndex: number) => {
  if (sortColumn.value === columnIndex) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = columnIndex;
    sortOrder.value = 'asc';
  }
  sortRows();
};

// Paginierung
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.rowsPerPage;
  const end = start + props.rowsPerPage;
  return filteredRows.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value * props.rowsPerPage < filteredRows.value.length) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Zeilen-Aktionen
const deleteRow = (id: number) => {
  emit('delete-row', id);
};

const updateRow = (id: number) => {
  emit('update-row', id);
};

// Watch für Änderungen in den Zeilen
watch(() => props.rows, (newRows) => {
  filteredRows.value = newRows;
  applyFilter();
}, { deep: true });
</script>

<style scoped>
.table-container {
  font-size: v-bind(fontSize);
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
  overflow-x: auto;
  z-index: 1;
  /* Niedrigerer z-index für die darunter liegenden Elemente */
}


table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  /* Vertikale Ausrichtung der Zellen */
}

th {
  background: url(../assets/fullArt_Waste_head.jpg) no-repeat center center fixed;
  background-size: cover;
}

input {
  margin-bottom: 10px;
  padding: 8px;
  margin: 4px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.pagination button {
  margin: 0 5px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
