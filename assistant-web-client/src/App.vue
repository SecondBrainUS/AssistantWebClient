<script setup>
import SBNavbar from './components/SBNavbar.vue'
import HelloWorld from './components/HelloWorld.vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <SBNavbar />
    <router-view></router-view>
  </div>
</template>

<style scoped>

</style>
