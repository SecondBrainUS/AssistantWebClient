<template>
  <div class="spotify-card rounded-lg overflow-hidden">
    <!-- Header with Spotify logo -->
    <div class="flex items-center gap-2 p-2 bg-[#1DB954] text-black font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#1DB954" />
        <path d="M16.7865 16.7865C16.4532 17.1198 15.9203 17.1525 15.5547 16.8522C13.1042 14.9148 9.90881 14.55 6.94028 15.3998C6.51321 15.5266 6.06691 15.2604 5.94014 14.8334C5.81336 14.4063 6.07954 13.96 6.50662 13.8332C9.8568 12.8768 13.4366 13.2972 16.2522 15.5547C16.6178 15.855 16.6505 16.3879 16.3171 16.7212M18.1747 13.6723C17.7615 14.0855 17.096 14.128 16.6388 13.7625C13.7693 11.5387 9.45431 10.9966 6.09386 12.0802C5.56682 12.2399 5.00402 11.9278 4.84435 11.4008C4.68468 10.8737 4.99677 10.3109 5.52381 10.1513C9.43341 8.88467 14.2765 9.50763 17.6492 12.1011C18.1063 12.4667 18.1488 13.1322 17.7357 13.5453M18.2737 10.4148C14.7799 7.82287 9.12335 7.61852 5.66372 8.66037C5.04395 8.84968 4.38046 8.47548 4.19114 7.8557C4.00183 7.23591 4.37603 6.57242 4.99582 6.38311C9.00793 5.18395 15.2826 5.42727 19.3275 8.42493C19.8844 8.81032 19.9869 9.59415 19.6015 10.151C19.2161 10.7078 18.4323 10.8103 17.8755 10.4251" fill="black" />
      </svg>
      <span>Spotify Playlist</span>
      <!-- Toggle button to switch between views -->
      <button @click="toggleView" class="ml-auto text-xs px-2 py-1 bg-black bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
        {{ isCustomView ? 'View JSON' : 'View Card' }}
      </button>
    </div>

    <!-- Custom Card View -->
    <div v-if="isCustomView && playlistData" class="p-4 bg-[#191414]">
      <div class="flex gap-4">
        <!-- Playlist Image -->
        <div v-if="playlistData.images && playlistData.images.length" class="flex-shrink-0">
          <img :src="playlistData.images[0]?.url" alt="Playlist Cover" class="w-20 h-20 rounded shadow-md" />
        </div>
        
        <!-- Playlist Info -->
        <div class="flex flex-col justify-center">
          <h3 class="font-medium text-white text-lg">{{ playlistData.name }}</h3>
          
          <p v-if="playlistData.description" class="text-gray-300 text-sm mt-1 line-clamp-2">
            {{ playlistData.description }}
          </p>
          
          <!-- Owner and track count -->
          <div class="text-gray-400 text-sm mt-1 flex gap-2 items-center">
            <span v-if="playlistData.owner?.display_name">
              By {{ playlistData.owner.display_name }}
            </span>
            <span v-if="playlistData.tracks?.total" class="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 19V5L21 12L9 19Z" fill="currentColor" />
              </svg>
              {{ playlistData.tracks.total }} tracks
            </span>
          </div>
          
          <!-- Status info -->
          <div class="text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span v-if="playlistData.public !== undefined" class="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z" fill="currentColor" />
              </svg>
              {{ playlistData.public ? 'Public' : 'Private' }}
            </span>
            <span v-if="playlistData.collaborative" class="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 14V17H14V19H17V22H19V19H22V17H19V14H17ZM5 3H19C19.5523 3 20 3.44772 20 4V12.5C19.4072 12.1852 18.7672 11.9763 18.0976 11.8726L18 11.858V5H6V11H12.1149C11.4337 11.2066 10.8078 11.5213 10.2661 11.9211L10 12.1V5H8V12.234C7.33646 12.7165 6.77006 13.3144 6.32156 13.9951L6.2359 14.1121L6 14.9296V10H4V21C4 21.5523 4.44772 22 5 22H13.3662C13.2078 21.6878 13.0817 21.3589 12.991 21.0179L12.9136 20.7224L12.858 20.4264L12.826 20.1185L12.8159 19.7936L12.8284 19.4505L12.8631 19.1013L12.9283 18.7306L13.0359 18.3326L13.1547 18.0217L13.2831 17.7298L13.4298 17.4405L13.5947 17.1513L13.7597 16.8622L13.9351 16.5994L14.1288 16.3456L14.3407 16.0918L14.5344 15.8471L14.7464 15.6292L14.9766 15.4113L15.2251 15.2114L15.4644 15.0209L15.7219 14.8494L16.0155 14.678L16.2912 14.5333L16.585 14.3981L16.8788 14.2816L17.1907 14.1746L17.4845 14.0857L17.7965 14.0063L18.1356 13.9456L18.4385 13.9033L18.7505 13.8799C18.8332 13.8752 18.9159 13.8729 19 13.8729C19.685 13.8729 20.3397 13.9575 20.9511 14.1094L21.1147 14.1572L21.4541 14.2816L21.9979 14.5524L22 14.5524V4C22 2.89543 21.1046 2 20 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H13.1537C12.8693 21.5134 12.6481 21.0021 12.49 20.4699L12.3883 20.0629L12.3171 19.6465L12.2771 19.2015L12.2747 18.7088L12.3147 18.2161L12.3883 17.7235L12.4997 17.2592L12.6375 16.8327L12.8011 16.4062L12.9967 16.0182L13.2248 15.6208L13.4849 15.2329L13.7574 14.8642L14.066 14.5237L14.394 14.2117L14.7464 13.9192L15.1105 13.6554L15.4928 13.4301L15.9073 13.2241L16.3129 13.047L16.7367 12.9178L17.1605 12.8172L17.6025 12.7356L18.0626 12.6922L18.5408 12.6826L19.0008 12.707L19.4525 12.7547L19.8945 12.8362L20.3088 12.9368L20.7146 13.0564L21.102 13.204L21.462 13.3611L21.7915 13.5481L22 13.6843V4C22 2.89543 21.1046 2 20 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H13.1489C11.7519 20.5558 11 18.607 11 16.5C11 13.9553 12.1625 11.6561 14.0066 10.1228L14.2318 9.9421L14.6777 9.60732L15.1461 9.33376L15.6264 9.10226L16.1183 8.91729L16.6334 8.77518L17.1249 8.68353L17.6165 8.63571L18.1197 8.6323L18.6111 8.67239L19.0908 8.75289L19.4829 8.85431L19.8986 8.99643L20.3023 9.17367L20.6708 9.38058L20.9874 9.60732L21 9.61753V4C21 3.44772 20.5523 3 20 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H14.5C13.9477 21 13.4163 20.9979 13.3662 21C13.2497 20.9941 13.1481 20.9976 13.114 21C12.7288 20.5139 12.3945 19.9866 12.1144 19.4252L11.9958 19.1752L11.8818 18.9107L11.7723 18.6462L11.6765 18.3723L11.5943 18.0937L11.5213 17.8058L11.4574 17.5087L11.407 17.2116L11.3658 16.902L11.3382 16.5971L11.3244 16.2782C11.3244 14.4974 12.1053 12.8699 13.3796 11.7692L13.5942 11.5986L13.7981 11.4593L13.9943 11.3338L14.1905 11.2176L14.4313 11.1015L14.5929 11.0375L14.7546 10.9782L14.9577 10.9189L15.1194 10.8735L15.2811 10.8374L15.5011 10.8075L15.6627 10.7898L15.8244 10.7782L15.9861 10.7713L16.1477 10.7713L16.3094 10.7782L16.471 10.7898L16.6327 10.8075L16.7943 10.8335L16.956 10.8595L17.1176 10.8934L17.2793 10.9366L17.4409 10.9839L17.6026 11.0375L17.7642 11.1015L17.9259 11.1733L18.0875 11.2527L18.2492 11.3401L18.4109 11.4379L18.5725 11.544L18.7341 11.6616L18.8958 11.7871L19.0574 11.9235L19.2191 12.0705L19.3808 12.2268L19.5424 12.397L19.7041 12.5786L19.8657 12.7695L20.0274 12.979L20.1006 13.0753L19.863 12.9236L19.6226 12.7839L19.3794 12.6558L19.1444 12.5531L18.9023 12.4599L18.6603 12.3787L18.4252 12.3071L18.1761 12.245L17.941 12.1925L17.6919 12.1543L17.4498 12.1209L17.1939 12.0971L16.945 12.0875L16.6959 12.0875L16.4469 12.0971L16.1978 12.1161L15.9488 12.1448L15.6997 12.1877L15.4507 12.2402L15.2016 12.3023L14.9526 12.3739L14.7035 12.4551L14.4545 12.5483L14.2055 12.6509L13.9564 12.7649L13.7074 12.8884L13.4583 13.0262L13.2093 13.1736L12.9602 13.3305L12.7112 13.4992L12.4622 13.6799L12.2131 13.8724L11.9641 14.0767L11.7151 14.2904L11.466 14.5159L11.217 14.7509L10.968 15.0002L10.719 15.2494L10.4699 15.5129L10.2209 15.7811L9.97186 16.0588L9.72283 16.3459L9.69462 16.3792C9.28656 16.8708 8.94254 17.4023 8.66259 17.9626L8.54377 18.214L8.43343 18.4701L8.33157 18.7309L8.24679 18.9918L8.17048 19.2527L8.10265 19.5182L8.04329 19.7885L7.99969 20.0588L7.96455 20.3244L7.9432 20.5948L7.93796 20.8604L9.00729 20.8604L10.0766 20.8604L11.146 20.8604L12.2153 20.8604L13.2846 20.8604L14.354 20.8604L15.4234 20.8604L16.4927 20.8604L17.562 20.8604L18.6314 20.8604L19.7007 20.8604L20.77 20.8604L21 20.8604V19.8217L21 18.783L21 17.7443L21 16.7056L21 15.6669L21 14.6282L21 13.5896L21 12.5509L21 11.5122L21 10.4735L21 9.43484L21 8.39613L21 7.35742L21 6.31871L21 5.28L21 4.24129V4C21 3.44772 20.5523 3 20 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H14.2H14.3H14.4H14.5H7H6H5Z" fill="currentColor" />
              </svg>
              Collaborative
            </span>
          </div>
          
          <!-- Spotify Link Button -->
          <a 
            v-if="playlistData.external_urls?.spotify" 
            :href="playlistData.external_urls.spotify" 
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
  
  // Extract the first playlist from the result
  const resultObj = props.functionResult.result;
  return resultObj[0] || resultObj;
});

function toggleView() {
  isCustomView.value = !isCustomView.value;
}
</script>

<style scoped>
.spotify-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 