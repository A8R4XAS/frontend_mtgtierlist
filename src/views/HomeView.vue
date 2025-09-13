<script setup lang="ts">
import The1vs1Table from '@/components/The1vs1Table.vue';
import TheNavbar from '@/components/TheNavbar.vue';
import { fetchWrapper } from '@/composables/fetchWrapper';

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
      tableRows: [],
      errorMessage: ''
    };
  },
  methods: {
    async fetchTableData() {
      try {
        const data = await fetchWrapper('/user/');
        this.tableRows = data.map(
          (user: { name: string; email: string; }) => [user.name, user.email]
        );
      } catch {
        this.errorMessage='Fehler beim Laden der Usertabelle'
      }
    }
  },
  created() {
    this.fetchTableData();
  },
};

</script>

