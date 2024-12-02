<script setup>
import SBNavbar from './components/SBNavbar.vue'
import HelloWorld from './components/HelloWorld.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex flex-col h-screen">
    <SBNavbar />
    <RouterView v-slot="{ Component }">
      <transition
        name="fade"
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
/* 
  Using non-scoped style to ensure transitions work across components.
  Keep transitions subtle and quick for production use.
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>