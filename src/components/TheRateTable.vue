<script setup lang="ts">
import { ref } from 'vue';
import TableComponent from './TableComponent.vue';

const tableTitle = ref('Bewertungen');
const tableHeaders = ref(['Deck', '1', '2', '3', '4', '5', '6']);
const tableRows = ref([]);
</script>

<template>
    <TableComponent :title="tableTitle" :headers="tableHeaders" :rows="tableRows" :rowsPerPage="3" :userColumns="[0]"/>
</template>
