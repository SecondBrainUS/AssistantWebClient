<template>
  <nav class="sticky top-0 z-50 flex justify-between items-center p-2 bg-gray-800 text-white">
    <div class="flex items-center">
      <img src="../assets/mush-v2-logo.png" alt="Logo" class="h-7 mr-3" />
      <h1 class="text-lg">Second Brain</h1>
    </div>
    <div class="flex items-center">
      <router-link to="/contact" class="mx-2 text-white hover:underline">About</router-link>
      <div class="ml-3 relative">
        <img 
          :src="profilePictureUrl" 
          alt="Profile" 
          crossorigin="anonymous"
          class="h-7 w-7 rounded-full object-cover cursor-pointer"
          @error="handleImageError"
          @load="handleImageLoad"
          ref="profileImage"
          @click.stop="isDropdownOpen = !isDropdownOpen"
        />
        
        <div 
          v-show="isDropdownOpen"
          class="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-50"
        >
          <button
            @click="handleSignOut"
            class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useUserStore } from '../store/userStore'
import { useRouter } from 'vue-router'
import defaultProfileImg from '../assets/mush-v2-logo.png'

const userStore = useUserStore()
const router = useRouter()
const defaultProfilePicture = defaultProfileImg
const isDropdownOpen = ref(false)
const profileImage = ref(null)
const loadAttempts = ref(0)
const MAX_RETRIES = 5

const profilePictureUrl = computed(() => {
  return userStore.profilePicture || defaultProfilePicture
})

const handleImageError = (e) => {
  console.error('Image failed to load:', e.target.src)
  if (e.target.src !== defaultProfilePicture) {
    loadAttempts.value++
    console.log(`Load attempt ${loadAttempts.value} of ${MAX_RETRIES}`)
    
    if (loadAttempts.value >= MAX_RETRIES) {
      console.error(`Failed to load profile picture after ${MAX_RETRIES} attempts`)
      e.target.src = defaultProfilePicture
      loadAttempts.value = 0  // Reset for potential future attempts
    } else {
      // Add a small delay before retry
      setTimeout(() => {
        e.target.src = userStore.profilePicture
      }, 1000 * loadAttempts.value) // Increasing delay with each attempt
    }
  }
}

const handleImageLoad = (e) => {
  console.log('=== IMAGE LOAD SUCCESS ===')
  console.log('Loaded src:', e.target.src)
  loadAttempts.value = 0  // Reset attempts on successful load
}

const handleSignOut = () => {
  userStore.logout()
  isDropdownOpen.value = false
  router.push('/')
}

const handleClickOutside = (event) => {
  if (isDropdownOpen.value) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  console.log('Initial profile picture:', userStore.profilePicture)
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        console.log('Image src changed:', profileImage.value?.src)
      }
    })
  })
  
  if (profileImage.value) {
    observer.observe(profileImage.value, { attributes: true })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
