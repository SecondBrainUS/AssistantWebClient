<script setup>
import SBNavbar from './components/SBNavbar.vue'
import HelloWorld from './components/HelloWorld.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex flex-col h-screen">
    <SBNavbar />
    <router-view class="flex-1 overflow-auto"></router-view>
  </div>
</template>

<style scoped>

</style>
