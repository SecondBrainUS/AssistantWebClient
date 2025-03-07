<template>
  <div class="sensor-metric-card rounded-lg overflow-hidden">
    <!-- Header with Sensor Metric logo -->
    <div class="flex items-center gap-2 p-2 bg-blue-600 text-white font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" stroke="white" stroke-width="2"/>
        <path d="M12 8V13" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 16V16.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Sensor Metric</span>
      <!-- Toggle button to switch between views -->
      <button @click="toggleView" class="ml-auto text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
        {{ isCustomView ? 'View JSON' : 'View Card' }}
      </button>
    </div>

    <!-- Custom Card View -->
    <div v-if="isCustomView && metricData" class="p-4 bg-slate-800 text-white">
      <div class="flex flex-col">
        <!-- Location and Value with Icon -->
        <div class="flex items-center mb-3">
          <div class="flex-shrink-0 bg-blue-700 rounded-full h-12 w-12 flex items-center justify-center mr-3">
            <!-- Temperature Icon -->
            <svg v-if="isTemperatureMetric" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3V15M12 15C10.3431 15 9 16.3431 9 18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18C15 16.3431 13.6569 15 12 15Z" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 8C11.4477 8 11 7.55228 11 7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7C13 7.55228 12.5523 8 12 8Z" fill="white"/>
            </svg>
            <!-- Humidity Icon -->
            <svg v-else-if="isHumidityMetric" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3.5C11.2044 3.5 10.4413 3.81607 9.87868 4.37868C9.31607 4.94129 9 5.70435 9 6.5V12C9 12 7 13 7 15C7 16.0609 7.42143 17.0783 8.17157 17.8284C8.92172 18.5786 9.93913 19 11 19H13C14.0609 19 15.0783 18.5786 15.8284 17.8284C16.5786 17.0783 17 16.0609 17 15C17 13 15 12 15 12V6.5C15 5.70435 14.6839 4.94129 14.1213 4.37868C13.5587 3.81607 12.7957 3.5 12 3.5Z" stroke="white" stroke-width="2"/>
              <path d="M10 10.5C10.5 12 11.4 12 12 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <!-- Generic Metric Icon (for other types) -->
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V7.5M16.25 7.75L15.2 8.8M7.75 7.75L8.8 8.8M5.5 12H7M17 12H18.5M15.25 15.25L16.25 16.3M8.75 15.25L7.7 16.3M12 16.5V18M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-white text-lg">{{ metricData.location }}</h3>
            <div class="flex items-baseline">
              <span class="text-3xl font-bold">{{ formatValue(metricData.value) }}</span>
              <span class="text-lg ml-1 text-gray-300">{{ metricData.unit }}</span>
            </div>
          </div>
        </div>
        
        <!-- Metric details -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
          <div class="text-gray-400">Metric:</div>
          <div class="text-gray-300 capitalize">{{ formatMetricName(metricData.metric) }}</div>

          <div class="text-gray-400">Method:</div>
          <div class="text-gray-300 capitalize">{{ metricData.method }}</div>
          
          <div class="text-gray-400">Start Time:</div>
          <div class="text-gray-300">{{ formatDateTime(metricData.start_time) }}</div>
          
          <div class="text-gray-400">End Time:</div>
          <div class="text-gray-300">{{ formatDateTime(metricData.end_time) }}</div>
        </div>
      </div>
    </div>

    <!-- JSON View -->
    <div v-if="!isCustomView" class="font-mono p-3 rounded-lg bg-[#222222]">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  functionCall: {
    type: Object,
    required: true
  },
  functionResult: {
    type: Object,
    default: null
  }
});

const isCustomView = ref(true);

const metricData = computed(() => {
  if (!props.functionResult || !props.functionResult.result) return null;
  return props.functionResult.result;
});

// Determine if the metric is temperature
const isTemperatureMetric = computed(() => {
  if (!metricData.value || !metricData.value.metric) return false;
  return metricData.value.metric.toLowerCase().includes('temp');
});

// Determine if the metric is humidity
const isHumidityMetric = computed(() => {
  if (!metricData.value || !metricData.value.metric) return false;
  return metricData.value.metric.toLowerCase().includes('humid');
});

// Format the metric value to have at most 1 decimal place if it's a float
function formatValue(value) {
  if (typeof value !== 'number') return value;
  return Math.round(value * 10) / 10;
}

// Format the date/time to be more readable
function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch (e) {
    return isoString;
  }
}

// Format the metric name to be more readable
function formatMetricName(metric) {
  if (!metric) return 'Unknown';
  return metric
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim();
}

function toggleView() {
  isCustomView.value = !isCustomView.value;
}
</script>

<style scoped>
.sensor-metric-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 