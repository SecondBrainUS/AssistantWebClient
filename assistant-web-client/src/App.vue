<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './store/userStore'
import SBNavbar from './components/SBNavbar.vue'
import { RouterLink, RouterView } from 'vue-router'

const route = useRoute()
const userStore = useUserStore()

onMounted(() => {
  // Only check auth status if we're not on the home page
  if (route.path !== '/') {
    userStore.initializeAuth()
  }
})

// Compute transition based on route
const transitionName = computed(() => {
  // Initial page load
  if (!route.meta.previousTransition && route.path === '/') {
    return 'fade-in-slow'
  }
  
  // Specific route combinations
  if (route.path === '/workspace' && route.meta.previousPath === '/') {
    return 'fade-in'
  }

  if (route.path === '/' && route.meta.previousPath === '/workspace') {
    return 'fade-in'
  }
  
  // Default to the transition specified in route meta
  return route.meta.transition || 'fade-in'
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <SBNavbar />
    <RouterView v-slot="{ Component }">
      <transition
        :name="transitionName"
        mode="out-in"
        appear
      >
        <component
          :is="Component" 
          class="flex-1 overflow-auto"
        />
      </transition>
    </RouterView>
  </div>
</template>

<style>
/* Fade in slow transition - for initial page load */
.fade-in-slow-enter-active{
  transition: opacity 1.1s ease-in-out, color 1.8s ease-in-out;
}
.fade-in-slow-enter-from,
.fade-in-slow-leave-to {
  opacity: 0;
  color: #171717;
}
.fade-in-enter-active{
  transition: opacity 0.2s ease-in-out, color 0.2s ease-in-out;
}
.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  color: #171717;
}
</style>