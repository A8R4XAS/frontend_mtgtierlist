<script setup lang="ts">
import The1vs1Table from '@/components/The1vs1Table.vue';
import TheNavbar from '@/components/TheNavbar.vue';
</script>

<template>
  <main>
    <div class="container-fluid">
      <!-------------------- NAVBAR --------------------->
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
      </div>
    </div>
  </main>
</template>

<script lang="ts">
export default {
  components: {
  },
  data() {
    return {
      tableTitle: 'Benutzerliste',
      tableHeaders: ['Name', 'Email'], 
      tableRows: []
    };
  },
  methods: {
    async fetchTableData() {
      try {
        const response = await fetch('http://localhost:3001/api/user/',{});
        const data = await response.json();
        this.tableRows = data.map(
          (user: { name: string; email: string; }) => [user.name, user.email]
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

