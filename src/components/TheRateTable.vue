<script setup lang="ts">
import TableComponent from './TableComponent.vue';
</script>

<template>
    <TableComponent :title="tableTitle" :headers="tableHeaders" :rows="tableRows" :rowsPerPage="3" :userColumns="[0]"/>
</template>

<script lang="ts">
export default {
    components: {
        TableComponent
    },
    data() {
        return {
            tableTitle: 'Bewertungen',
            tableHeaders: ['Deck', '1', '2', '3', '4', '5', '6'],
            tableRows: [],
        };
    },
}
</script>