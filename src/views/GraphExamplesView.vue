<!--
  Beispiel für die Verwendung der GraphComponent
  Zeigt verschiedene Anwendungsfälle für MTG-Statistiken
-->
<template>
  <div class="graph-examples">
    <div class="row">
      <!-- Sieges-/Niederlagen-Verlauf -->
      <div class="col-lg-6 mb-4">
        <GraphComponent
          title="Sieges-/Niederlagen-Verlauf"
          titleIcon="fas fa-trophy"
          :labels="months"
          :datasets="winLossData"
          type="line"
          :height="300"
        />
      </div>

      <!-- Deck-Performance -->
      <div class="col-lg-6 mb-4">
        <GraphComponent
          title="Deck-Performance"
          titleIcon="fas fa-magic"
          :labels="deckLabels"
          :datasets="deckPerformanceData"
          type="area"
          :height="300"
        />
      </div>
    </div>

    <div class="row">
      <!-- Rating-Entwicklung -->
      <div class="col-12 mb-4">
        <GraphComponent
          title="Rating-Entwicklung über Zeit"
          titleIcon="fas fa-chart-line"
          :labels="ratingMonths"
          :datasets="ratingData"
          type="line"
          :height="250"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GraphComponent from '@/components/GraphComponent.vue'

// Mock-Daten für verschiedene Charts
const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']

const winLossData = [
  {
    label: 'Siege',
    data: [5, 8, 12, 9, 15, 18],
    color: '#27ae60',
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
    borderColor: '#27ae60'
  },
  {
    label: 'Niederlagen',
    data: [3, 5, 8, 6, 9, 7],
    color: '#e74c3c',
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderColor: '#e74c3c'
  }
]

const deckLabels = ['Krenko Aggro', 'Teferi Control', 'Ezuri Combo', 'Liliana Midrange']

const deckPerformanceData = [
  {
    label: 'Winrate %',
    data: [75, 68, 60, 55],
    color: '#9b59b6',
    backgroundColor: 'rgba(155, 89, 182, 0.3)',
    borderColor: '#9b59b6'
  }
]

const ratingMonths = ['Sep', 'Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär', 'Apr']

const ratingData = [
  {
    label: 'Durchschnitts-Rating',
    data: [6.2, 6.8, 7.1, 7.0, 7.5, 7.8, 7.6, 8.1],
    color: '#f39c12',
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    borderColor: '#f39c12'
  }
]
</script>

<style scoped>
.graph-examples {
  padding: 20px;
}

.graph-examples .col-lg-6,
.graph-examples .col-12 {
  padding: 0 10px;
}

@media (max-width: 768px) {
  .graph-examples {
    padding: 10px;
  }

  .graph-examples .col-lg-6,
  .graph-examples .col-12 {
    padding: 0 5px;
  }
}
</style>
