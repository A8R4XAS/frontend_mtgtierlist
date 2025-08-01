<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue';
import TheRateTable from '@/components/TheRateTable.vue';
import TheDeckTable from '@/components/TheDeckTable.vue';
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
                <TheRateTable />
            </div>
        </div>

        <div class="row justify-content-center mb-3">
            <div class="col-12">
                <TheDeckTable />
            </div>
        </div>
    </div>
</template>

<script lang="ts">

export default {}
</script>