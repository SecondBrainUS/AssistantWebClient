<template>
  <nav class="sticky top-0 z-50 flex justify-between items-center p-2 bg-gray-800 text-white">
    <div class="flex items-center">
      <img src="../assets/mush-v2-logo.png" alt="Logo" class="h-7 mr-3" />
      <h1 class="text-lg">Second Brain</h1>
    </div>
    <div class="flex items-center">
      <router-link to="/home" class="mx-2 text-white hover:underline">Home</router-link>
      <router-link to="/about" class="mx-2 text-white hover:underline">About</router-link>
      <router-link to="/contact" class="mx-2 text-white hover:underline">Contact</router-link>
      <div class="ml-3">
        <img src="./assets/profile.jpg" alt="Profile" class="h-7 w-7 rounded-full" />
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'SBNavbar',
};
</script>
