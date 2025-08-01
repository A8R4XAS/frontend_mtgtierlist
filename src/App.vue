<script setup lang="ts">
</script>

<template>
  <!--
  <header>
     <img alt="Mtg logo" class="logo" src="@/assets/mtg color.svg" width="243" height="180" /> 
  </header>
-->

  <main>
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-2"></div>
        <div class="col-8">
          <RouterView /> <!-- Diese Zeile stellt sicher, dass die 404-Seite angezeigt wird -->
        </div>
        <div class="col-2"></div>
      </div>
    </div>
  </main>
</template>



<style scoped>

header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}
</style>
