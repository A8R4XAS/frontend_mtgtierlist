<template>
  <div class="not-found">
    <h1>404 - Seite nicht gefunden</h1>
    <p>Die Seite, die Sie suchen, existiert nicht.</p>
    <router-link to="/">Zurück zur Startseite</router-link>
  </div>
</template>

<script setup lang="ts">
// ...existing code...
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}
</style>
