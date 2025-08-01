<template>
  <div class="custom-frame">
    <div class="top-banner"></div>
    <div class="content"></div>
    <div class="bottom-banner"></div>
  </div>

</template>

<style scoped>
.custom-frame {
  position: relative;
  width: 300px;
  /* Passe die Breite an */
  height: 400px;
  /* Passe die Höhe an */
  background-color: #f5f5f5;
  /* Hintergrundfarbe des Inhaltsbereichs */
  border: 10px solid #6e5f47;
  /* Äußerer Rahmen mit Steinoptik-Farbe */
  border-radius: 10px;
  /* Runde die Ecken leicht ab */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5),
    /* Innen-Schatten für Tiefe */
    0 4px 8px rgba(0, 0, 0, 0.3);
  /* Äußerer Schatten */
  overflow: hidden;
  /* Verhindert Überlauf */
}

.custom-frame .top-banner,
.custom-frame .bottom-banner {
  position: absolute;
  height: 30px;
  /* Höhe des Banners */
  width: calc(100% - 20px);
  /* Breite angepasst an den inneren Rahmen */
  background-color: #d9cba8;
  /* Banner-Farbe */
  border-radius: 5px;
  /* Leicht abgerundete Banner-Ecken */
  left: 10px;
}

.custom-frame .top-banner {
  top: 10px;
}

.custom-frame .bottom-banner {
  bottom: 10px;
}

.custom-frame .content {
  position: absolute;
  top: 50px;
  /* Abstand unter dem oberen Banner */
  bottom: 50px;
  /* Abstand über dem unteren Banner */
  left: 10px;
  right: 10px;
  background: linear-gradient(180deg, #e8e4db, #f5f5f5);
  /* Leichter Verlauf für den Hintergrund */
  border-radius: 5px;
  /* Runde Ecken des Inhaltsbereichs */
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  /* Leichter Schatten für Tiefe */
}
</style>