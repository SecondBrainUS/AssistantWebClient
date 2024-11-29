<template>
  <nav class="sticky top-0 z-50 flex justify-between items-center p-4 bg-gray-800 text-white">
    <div class="flex items-center">
      <img src="./assets/logo.svg" alt="Logo" class="h-10 mr-4" />
      <h1 class="text-xl">My Application</h1>
    </div>
    <div class="flex items-center">
      <router-link to="/home" class="mx-2 text-white hover:underline">Home</router-link>
      <router-link to="/about" class="mx-2 text-white hover:underline">About</router-link>
      <router-link to="/contact" class="mx-2 text-white hover:underline">Contact</router-link>
      <div class="ml-4">
        <img src="./assets/profile.jpg" alt="Profile" class="h-10 w-10 rounded-full" />
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'SBNavbar',
};
</script>
