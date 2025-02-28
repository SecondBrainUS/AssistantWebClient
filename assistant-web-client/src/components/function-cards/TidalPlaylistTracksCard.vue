<template>
  <div class="tidal-card rounded-lg overflow-hidden">
    <!-- Header with Tidal logo -->
    <div class="flex items-center gap-2 p-2 bg-[#000000] text-white font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.012 4L8 8.013 4 4 0 8.013 4 12l4-4.013L12.012 12 16 8.013 12.012 4zM16 4l4 4.013-4 4.012 4 4.013 4-4.013-4-4.012-4 4.012-4-4.012L16 4z" fill="#FFFFFF" />
      </svg>
      <span>Tidal Playlist</span>
      <!-- Toggle button -->
      <button @click="toggleView" class="ml-auto text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
        {{ isCustomView ? 'View JSON' : 'View Card' }}
      </button>
    </div>

    <!-- Custom Card View -->
    <div v-if="isCustomView && playlistData" class="p-4 bg-[#222222]">
      <div class="mb-4">
        <h3 class="text-xl font-medium text-white">{{ playlistData.playlist_name }}</h3>
        <p class="text-gray-400 text-sm mt-1">{{ playlistData.total }} tracks</p>
      </div>

      <!-- Track List -->
      <div class="space-y-3">
        <div v-for="(track, index) in playlistData.tracks" :key="track.id" 
             class="flex items-center p-2 rounded bg-black bg-opacity-30 hover:bg-opacity-50 transition-colors">
          <!-- Track number -->
          <div class="w-6 text-center text-gray-500 font-mono">{{ index + 1 }}</div>
          
          <!-- Track info -->
          <div class="ml-3 flex-grow">
            <p class="text-white font-medium">{{ track.name }}</p>
            <div class="flex items-center justify-between">
              <p class="text-gray-400 text-sm">{{ track.artist }}</p>
              <p class="text-gray-500 text-xs">{{ formatDuration(track.duration_ms) }}</p>
            </div>
          </div>
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
const playlistData = computed(() => {
  if (!props.functionResult || !props.functionResult.result) return null;
  return props.functionResult.result;
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
</script>

<style scoped>
.tidal-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 