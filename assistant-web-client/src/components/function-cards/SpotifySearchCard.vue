<template>
  <div class="spotify-card rounded-lg overflow-hidden">
    <!-- Header with Spotify logo -->
    <div class="flex items-center gap-2 p-2 bg-[#1DB954] text-black font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#1DB954" />
        <path d="M16.7865 16.7865C16.4532 17.1198 15.9203 17.1525 15.5547 16.8522C13.1042 14.9148 9.90881 14.55 6.94028 15.3998C6.51321 15.5266 6.06691 15.2604 5.94014 14.8334C5.81336 14.4063 6.07954 13.96 6.50662 13.8332C9.8568 12.8768 13.4366 13.2972 16.2522 15.5547C16.6178 15.855 16.6505 16.3879 16.3171 16.7212M18.1747 13.6723C17.7615 14.0855 17.096 14.128 16.6388 13.7625C13.7693 11.5387 9.45431 10.9966 6.09386 12.0802C5.56682 12.2399 5.00402 11.9278 4.84435 11.4008C4.68468 10.8737 4.99677 10.3109 5.52381 10.1513C9.43341 8.88467 14.2765 9.50763 17.6492 12.1011C18.1063 12.4667 18.1488 13.1322 17.7357 13.5453M18.2737 10.4148C14.7799 7.82287 9.12335 7.61852 5.66372 8.66037C5.04395 8.84968 4.38046 8.47548 4.19114 7.8557C4.00183 7.23591 4.37603 6.57242 4.99582 6.38311C9.00793 5.18395 15.2826 5.42727 19.3275 8.42493C19.8844 8.81032 19.9869 9.59415 19.6015 10.151C19.2161 10.7078 18.4323 10.8103 17.8755 10.4251" fill="black" />
      </svg>
      <span>Spotify Search</span>
      <!-- Toggle button to switch between views -->
      <button @click="toggleView" class="ml-auto text-xs px-2 py-1 bg-black bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
        {{ isCustomView ? 'View JSON' : 'View Card' }}
      </button>
    </div>

    <!-- Custom Card View -->
    <div v-if="isCustomView && songData" class="p-4 bg-[#191414]">
      <div class="flex gap-4">
        <!-- Album Image -->
        <div v-if="songData.album?.images && songData.album.images.length" class="flex-shrink-0">
          <img :src="songData.album.images[1]?.url || songData.album.images[0]?.url" alt="Album Cover" class="w-20 h-20 rounded shadow-md" />
        </div>
        
        <!-- Song Info -->
        <div class="flex flex-col justify-center">
          <h3 class="font-medium text-white text-lg">{{ songData.name }}</h3>
          <p class="text-gray-300">
            {{ songData.artists?.map(a => a.name).join(', ') }}
          </p>
          <p class="text-gray-400 text-sm">
            {{ songData.album?.name }}
            <span v-if="songData.album?.release_date"> • {{ formatReleaseDate(songData.album.release_date) }}</span>
          </p>
          
          <!-- Duration -->
          <p class="text-gray-400 text-sm mt-1">
            {{ formatDuration(songData.duration_ms) }}
          </p>
          
          <!-- Spotify Link Button -->
          <a 
            v-if="songData.external_urls?.spotify" 
            :href="songData.external_urls.spotify" 
            target="_blank" 
            class="mt-2 inline-block w-fit px-3 py-1 bg-[#1DB954] text-black text-sm font-medium rounded-full hover:bg-opacity-90 transition-colors"
          >
            Open in Spotify
          </a>
        </div>
      </div>
    </div>

    <!-- JSON View (Default) -->
    <div v-if="!isCustomView" class="font-mono p-3 rounded-lg bg-[#222222]">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

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
const songData = computed(() => {
  if (!props.functionResult || !props.functionResult.result) return null;
  
  // Extract the first song from the result
  const resultObj = props.functionResult.result;
  return resultObj[0] || resultObj;
});

function toggleView() {
  isCustomView.value = !isCustomView.value;
}

function formatDuration(ms) {
  if (!ms) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatReleaseDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.getFullYear();
  } catch (e) {
    return dateStr;
  }
}
</script>

<style scoped>
.spotify-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 