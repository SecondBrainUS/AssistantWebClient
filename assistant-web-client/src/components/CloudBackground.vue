<template>
  <div 
    class="w-full h-screen overflow-hidden relative" 
    @mousemove="handleMouseMove"
    ref="sceneRef"
  >
    <!-- Sky Background -->
    <div class="absolute inset-0 bg-blue-400"></div>
    
    <!-- Clouds -->
    <div 
      v-for="(cloud, index) in clouds" 
      :key="index"
      class="absolute"
      :style="{
        top: `${cloud.top}%`,
        left: `${cloud.left}px`,
        transform: `scale(${cloud.scale})`,
        opacity: cloud.opacity,
        transition: `left ${transitionDuration}s linear`
      }"
    >
      <div class="cloud bg-white rounded-full w-16 h-16 absolute"></div>
      <div class="cloud bg-white rounded-full w-20 h-20 absolute" style="top: -10px; left: 15px;"></div>
      <div class="cloud bg-white rounded-full w-16 h-16 absolute" style="top: 0; left: 30px;"></div>
      <div class="cloud bg-white rounded-full w-12 h-12 absolute" style="top: 5px; left: 45px;"></div>
    </div>
    
    <!-- Ground/Grass -->
    <div class="absolute bottom-0 w-full h-16 bg-green-500"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

// Refs
const sceneRef = ref(null);
const mouseX = ref(0);
const clouds = ref([]);
const sceneWidth = ref(0);

// Animation speed based on mouse position
const transitionDuration = computed(() => {
  // Map mouse position to animation duration (0-1 normalized position)
  const normalizedPosition = mouseX.value / sceneWidth.value;
  // 20 seconds when far left, 5 seconds when far right
  return 20 - (normalizedPosition * 15);
});

// Track mouse position
const handleMouseMove = (e) => {
  mouseX.value = e.clientX;
};

// Initialize clouds
const initClouds = () => {
  sceneWidth.value = sceneRef.value.clientWidth;
  
  // Create 8 clouds with random positions
  clouds.value = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    top: Math.random() * 50, // Random vertical position in top half
    left: -200 + (Math.random() * sceneWidth.value), // Start at random horizontal positions
    scale: 0.5 + (Math.random() * 1), // Random sizes
    opacity: 0.7 + (Math.random() * 0.3), // Random opacity
  }));
};

// Animate clouds
const animateClouds = () => {
  clouds.value.forEach(cloud => {
    // Move cloud to the right
    cloud.left += 1;
    
    // Reset cloud position when it moves off-screen
    if (cloud.left > sceneWidth.value + 200) {
      cloud.left = -200;
      cloud.top = Math.random() * 50; // New random height
    }
  });
  
  requestAnimationFrame(animateClouds);
};

// Lifecycle hooks
let animationId = null;

onMounted(() => {
  initClouds();
  animationId = requestAnimationFrame(animateClouds);
  
  // Handle window resize
  window.addEventListener('resize', initClouds);
});

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', initClouds);
});
</script>

<style scoped>
.cloud {
  filter: blur(4px);
}
</style>