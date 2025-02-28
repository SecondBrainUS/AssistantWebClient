<template>
  <div class="stock-card rounded-lg overflow-hidden">
    <!-- Header with Stock Market logo -->
    <div class="flex items-center gap-2 p-2 bg-blue-600 text-white font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12H4L7 3L10 21L13 14L15 17L17 10L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Stock Data</span>
      <!-- Toggle button to switch between views -->
      <button @click="toggleView" class="ml-auto text-xs px-2 py-1 bg-black bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
        {{ isCustomView ? 'View JSON' : 'View Card' }}
      </button>
    </div>

    <!-- Custom Card View -->
    <div v-if="isCustomView && stockData" class="p-4 bg-gray-900">
      <!-- Search and filter controls -->
      <div class="mb-4 flex gap-4 items-center">
        <div class="relative flex-grow">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search tickers..." 
            class="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div>
          <select 
            v-model="sortBy" 
            class="bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ticker">Ticker</option>
            <option value="current_price">Current Price</option>
            <option value="percent_change_3_days">3 Days %</option>
            <option value="percent_change_7_days">7 Days %</option>
            <option value="percent_change_14_days">14 Days %</option>
            <option value="percent_change_30_days">30 Days %</option>
            <option value="percent_change_90_days">90 Days %</option>
            <option value="percent_change_180_days">180 Days %</option>
          </select>
        </div>
        <button 
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" 
          class="bg-gray-800 text-white px-3 py-2 rounded-md hover:bg-gray-700"
        >
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
      </div>

      <!-- Stocks Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-white border-collapse">
          <thead>
            <tr class="bg-gray-800">
              <th class="text-left px-4 py-2">Ticker</th>
              <th class="text-right px-4 py-2">Price</th>
              <th class="text-right px-4 py-2">3d</th>
              <th class="text-right px-4 py-2">7d</th>
              <th class="text-right px-4 py-2">14d</th>
              <th class="text-right px-4 py-2">30d</th>
              <th class="text-right px-4 py-2">90d</th>
              <th class="text-right px-4 py-2">180d</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in sortedAndFilteredStocks" 
              :key="item.ticker"
              class="border-t border-gray-800 hover:bg-gray-800"
            >
              <td class="px-4 py-2 font-medium">{{ item.ticker }}</td>
              <td class="text-right px-4 py-2">${{ formatPrice(item.data.current_price) }}</td>
              <td 
                class="text-right px-4 py-2" 
                :class="getPercentageClass(item.data.percent_change_3_days)"
              >
                {{ formatPercentage(item.data.percent_change_3_days) }}
              </td>
              <td 
                class="text-right px-4 py-2" 
                :class="getPercentageClass(item.data.percent_change_7_days)"
              >
                {{ formatPercentage(item.data.percent_change_7_days) }}
              </td>
              <td 
                class="text-right px-4 py-2" 
                :class="getPercentageClass(item.data.percent_change_14_days)"
              >
                {{ formatPercentage(item.data.percent_change_14_days) }}
              </td>
              <td 
                class="text-right px-4 py-2" 
                :class="getPercentageClass(item.data.percent_change_30_days)"
              >
                {{ formatPercentage(item.data.percent_change_30_days) }}
              </td>
              <td 
                class="text-right px-4 py-2" 
                :class="getPercentageClass(item.data.percent_change_90_days)"
              >
                {{ formatPercentage(item.data.percent_change_90_days) }}
              </td>
              <td 
                class="text-right px-4 py-2" 
                :class="getPercentageClass(item.data.percent_change_180_days)"
              >
                {{ formatPercentage(item.data.percent_change_180_days) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Summary Stats -->
      <div class="mt-4 text-gray-400 text-sm">
        Showing {{ sortedAndFilteredStocks.length }} of {{ totalStocks }} stocks
      </div>
    </div>

    <!-- JSON View (Default) -->
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
const searchQuery = ref('');
const sortBy = ref('ticker');
const sortOrder = ref('desc');

const stockData = computed(() => {
  if (!props.functionResult || !props.functionResult.result) return null;
  return props.functionResult.result;
});

const stocksArray = computed(() => {
  if (!stockData.value) return [];
  
  // Convert the object to an array of objects with ticker and data
  return Object.entries(stockData.value).map(([ticker, data]) => ({
    ticker,
    data
  }));
});

const totalStocks = computed(() => {
  return stocksArray.value.length;
});

const sortedAndFilteredStocks = computed(() => {
  let filtered = stocksArray.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.ticker.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting
  return filtered.sort((a, b) => {
    let valueA, valueB;
    
    if (sortBy.value === 'ticker') {
      valueA = a.ticker;
      valueB = b.ticker;
      return sortOrder.value === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } else {
      valueA = sortBy.value === 'current_price' 
        ? a.data.current_price 
        : a.data[sortBy.value];
      
      valueB = sortBy.value === 'current_price' 
        ? b.data.current_price 
        : b.data[sortBy.value];
        
      return sortOrder.value === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
  });
});

function formatPrice(price) {
  return price.toFixed(2);
}

function formatPercentage(value) {
  if (value === undefined || value === null) return 'N/A';
  return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
}

function getPercentageClass(value) {
  if (value === undefined || value === null) return '';
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-400';
}

function toggleView() {
  isCustomView.value = !isCustomView.value;
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