<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';

// Register necessary components for the bar chart
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
}

const props = defineProps<{
  chartData: { labels: string[]; datasets: ChartDataset[] };
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = () => {
  if (chartCanvas.value) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    const config: ChartConfiguration = {
      type: 'bar',
      data: props.chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    };
    chartInstance = new Chart(chartCanvas.value, config);
  }
};

onMounted(createChart);
watch(() => props.chartData, createChart, { deep: true });
</script>
