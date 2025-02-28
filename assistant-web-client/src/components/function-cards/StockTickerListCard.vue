<template>
  <div class="stock-card rounded-lg overflow-hidden">
    <!-- Header with Stock Market logo -->
    <div class="flex items-center gap-2 p-2 bg-blue-600 text-white font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12H4L7 3L10 21L13 14L15 17L17 10L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Stock Tickers</span>
      <!-- Toggle button to switch between views -->
      <button @click="toggleView" class="ml-auto text-xs px-2 py-1 bg-black bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
        {{ isCustomView ? 'View JSON' : 'View Card' }}
      </button>
    </div>

    <!-- Custom Card View -->
    <div v-if="isCustomView && tickerData" class="p-4 bg-gray-900">
      <h3 class="text-white text-lg font-medium mb-3">Available Tickers ({{ tickerCount }})</h3>
      
      <!-- Tickers Grid -->
      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        <div
          v-for="(ticker, index) in tickerArray"
          :key="index"
          class="bg-blue-500 bg-opacity-10 hover:bg-opacity-20 text-blue-300 px-3 py-2 rounded-md text-center transition-colors"
          @click="copyTicker(ticker)"
        >
          {{ ticker }}
        </div>
      </div>
      
      <!-- Copy notification -->
      <div
        v-if="showCopyNotification"
        class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg text-sm"
      >
        Ticker copied to clipboard!
      </div>
    </div>

    <!-- JSON View (Default) -->
    <div v-if="!isCustomView" class="font-mono p-3 rounded-lg bg-[#222222]">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

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
const showCopyNotification = ref(false);

const tickerData = computed(() => {
  if (!props.functionResult || !props.functionResult.result) return null;
  return props.functionResult.result;
});

const tickerArray = computed(() => {
  if (!tickerData.value) return [];
  // Convert object with numeric keys to array
  return Object.values(tickerData.value);
});

const tickerCount = computed(() => {
  return tickerArray.value.length;
});

function toggleView() {
  isCustomView.value = !isCustomView.value;
}

function copyTicker(ticker) {
  navigator.clipboard.writeText(ticker).then(() => {
    showCopyNotification.value = true;
    setTimeout(() => {
      showCopyNotification.value = false;
    }, 2000);
  });
}

// Expose toggleView method for external use
defineExpose({
  toggleView,
  hasCustomView: true
});
</script>

<style scoped>
.stock-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 