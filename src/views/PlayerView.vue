<script setup lang="ts">
import TableComponent from '@/components/TableComponent.vue';
import TheNavbar from '@/components/TheNavbar.vue';
import { fetchWrapper } from '@/composables/fetchWrapper';
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
                <TableComponent :title="tableTitle" :headers="tableHeaders" :rows="tableRows" :rowsPerPage="3"
                    :userColumns="[0]" :activeUpdate="false" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">

export default {
    components: {
        TableComponent
    },
    data() {
        return {
            tableTitle: 'Spieler',
            tableHeaders: ['ID', 'Name'],
            tableRows: [],
            errorMessage: ''
        };
    },
    methods: {
        async fetchTableData() {
            try {
                const data = await fetchWrapper('/user/');
                this.tableRows = data.map(
                    (player: { id: number; name: string; }) => [player.id, player.name]
                );
            } catch {
              this.errorMessage = 'Fehler beim Laden der Spielerdaten: ';
            }
        }
    },
    created() {
        this.fetchTableData();
    }
}

</script>
