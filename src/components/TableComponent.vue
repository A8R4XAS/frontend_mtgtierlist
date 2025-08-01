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
                  <button v-if="activeUpdate" @click="updateRow(row[0] as number)" class="btn btn-primary btn-sm">
                    <i class="fas fa-pencil-alt"></i>
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

<script lang="ts">

type TableRow = (string | number)[];
type TableRows = TableRow[];

export default {
  props: {
    title: {
      type: String,
      required: false
    },
    headers: {
      type: Array,
      required: true
    },
    rows: {
      type: Array as () => TableRows,
      required: true
    },
    rowsPerPage: {
      type: Number,
      default: 10
    },
    userColumn: {
      type: Boolean,
      default: false
    },
    userColumns: {
      type: Array as () => number[],
      required: true
    },
    activeDelete: {
      type: Boolean,
      default: false
    },
    activeUpdate: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      default: '18px'
    }
  },
  data() {
    return {
      filter: '',
      userFilter: false,
      filteredRows: [] as TableRows,
      sortColumn: null as number | null,
      sortOrder: 'asc' as 'asc' | 'desc',
      currentPage: 1,
      userId: null as number | null,
    };
  },
  created() {
    const localUser = localStorage.getItem('user') || '';
    if (!localUser) return;
    this.userId = JSON.parse(localUser).id;
    this.applyFilter();
  },
  watch: {
    rows: {
      handler(newRows: TableRows) {
        this.filteredRows = newRows;
        this.applyFilter();
      },
      deep: true
    }
  },
  methods: {
    applyFilter() {

      const filterLowerCase = this.filter.toLowerCase();

      this.filteredRows = this.rows.filter((row: TableRow) => {
        const matchesFilter = row.some((cell: string | number) => cell.toString().toLowerCase().includes(filterLowerCase));
        const matchesUser = !this.userFilter || this.userColumns.some(index => row[index] === this.userId);
        return matchesFilter && matchesUser;
      });

      this.sortRows();
      this.currentPage = 1; // Back to First Page after filtered

    },
    sortRows() {
      if (this.sortColumn !== null) {
        this.filteredRows.sort((a, b) => {
          const aValue = a[this.sortColumn as number];
          const bValue = b[this.sortColumn as number];
          if (aValue === undefined || bValue === undefined) return 0;
          if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
    },
    toggleSort(columnIndex: number) {
      if (this.sortColumn === columnIndex) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = columnIndex;
        this.sortOrder = 'asc';
      }
      this.sortRows();
    },
    nextPage() {
      if (this.currentPage * this.rowsPerPage < this.filteredRows.length) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    deleteRow(id: number) {
      this.$emit('delete-row', id); // Event auslösen, um die Zeile zu löschen 
    },
    updateRow(id: number) {
      this.$emit('update-row', id); // Event auslösen, um Zeile zu bearbeiten
    }
  },
  computed: {
    paginatedRows() {
      const start = (this.currentPage - 1) * this.rowsPerPage;
      const end = start + this.rowsPerPage;
      return this.filteredRows.slice(start, end);
    }
  }
};
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