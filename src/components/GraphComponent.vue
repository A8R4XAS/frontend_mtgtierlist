<!--
  GraphComponent.vue - Wiederverwendbare Graph-Komponente mit Chart.js
  Diese Komponente zeigt verschiedene Chart-Typen für MTG-Statistiken
-->
<template>
  <div class="graph-wrapper">
    <div v-if="title" class="graph-title">
      <!-- Unterstütze sowohl Font Awesome Klassen als auch Unicode/Emojis -->
      <i v-if="isFontAwesomeIcon" :class="titleIcon"></i>
      <span v-else class="title-icon-emoji">{{ titleIcon }}</span>
      {{ title }}
    </div>
    <div class="chart-container">
      <Line
        :data="processedChartData"
        :options="processedChartOptions"
        :key="chartKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Chart.js Komponenten registrieren
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Props Interface
interface Props {
  title?: string
  titleIcon?: string
  labels?: string[]
  datasets?: Array<{
    label: string
    data: number[]
    color?: string
    backgroundColor?: string
    borderColor?: string
  }>
  type?: 'line' | 'area'
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  titleIcon: 'fas fa-chart-line',
  labels: () => ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni'],
  datasets: () => [
    {
      label: 'Siege',
      data: [12, 19, 15, 25, 22, 30],
      color: '#27ae60',
      backgroundColor: 'rgba(39, 174, 96, 0.1)',
      borderColor: '#27ae60'
    },
    {
      label: 'Niederlagen',
      data: [8, 11, 20, 15, 18, 12],
      color: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      borderColor: '#e74c3c'
    }
  ],
  type: 'line',
  height: 300
})

// Computed: Prüft ob titleIcon eine Font Awesome Klasse ist (beginnt mit "fa")
const isFontAwesomeIcon = computed(() => {
  return props.titleIcon.startsWith('fa');
});

// Reactive key für Chart-Updates
const chartKey = ref(0)

// Verarbeitete Chart-Daten mit Magic-Theme
const processedChartData = computed(() => {
  return {
    labels: props.labels,
    datasets: props.datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || dataset.color || '#3498db',
      borderColor: dataset.borderColor || dataset.color || '#2980b9',
      borderWidth: 3,
      pointBackgroundColor: dataset.borderColor || dataset.color || '#2980b9',
      pointBorderColor: '#ecf0f1',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      fill: props.type === 'area',
      tension: 0.4
    }))
  }
})

// Chart-Optionen mit Magic-Card Theme
const processedChartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(52, 73, 94, 0.3)',
          borderColor: '#34495e'
        },
        ticks: {
          color: '#bdc3c7',
          font: {
            family: 'inherit',
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(52, 73, 94, 0.3)',
          borderColor: '#34495e'
        },
        ticks: {
          color: '#bdc3c7',
          font: {
            family: 'inherit',
            size: 12
          }
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ecf0f1',
          font: {
            family: 'inherit',
            size: 13,
            weight: 500
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(44, 62, 80, 0.95)',
        titleColor: '#ecf0f1',
        bodyColor: '#bdc3c7',
        borderColor: '#34495e',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        font: {
          family: 'inherit'
        }
      }
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const
      }
    }
  }
})
</script>

<style scoped>
.graph-wrapper {
  background: transparent;
  border-radius: 0;
  padding: 10px;
  color: #ecf0f1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.graph-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ecf0f1;
}

.graph-title i {
  color: #3498db;
  font-size: 1.3rem;
}

.title-icon-emoji {
  font-size: 1.3rem;
  line-height: 1;
}

.chart-container {
  flex: 1;
  position: relative;
  min-height: 200px;
  background: rgba(44, 62, 80, 0.2);
  border-radius: 6px;
  padding: 8px;
  border: 1px solid rgba(52, 73, 94, 0.3);
  width: 100%;
  box-sizing: border-box;
}

/* Entferne Magic Card Border für bessere Integration */
.graph-wrapper {
  position: relative;
  overflow: hidden;
}

/* Responsive Design */
@media (max-width: 768px) {
  .graph-wrapper {
    padding: 8px;
  }

  .chart-container {
    padding: 6px;
    min-height: 150px;
  }

  .graph-title {
    font-size: 1rem;
    margin-bottom: 10px;
  }
}
</style>
