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

const profilePictureUrl = computed(() => {
  const picture = userStore.profilePicture
  if (picture) {
    // Preload the image
    const img = new Image()
    img.src = picture
    return picture
  }
  return defaultProfilePicture
})

// Add this watch to debug when the URL changes
watch(() => userStore.profilePicture, (newVal) => {
  console.log('Profile picture URL changed to:', newVal)
  if (newVal) {
    const img = new Image()
    img.onload = () => console.log('Pre-load successful')
    img.onerror = (e) => console.log('Pre-load failed:', e)
    img.src = newVal
  }
})

const handleImageError = (e) => {
  console.error('Image failed to load:', e.target.src)
  if (e.target.src !== defaultProfilePicture) {
    console.log('Falling back to default profile picture')
    e.target.src = defaultProfilePicture
  }
}

const handleImageLoad = (e) => {
  console.log('=== IMAGE LOAD SUCCESS ===')
  console.log('Loaded src:', e.target.src)
  console.log('Natural dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight)
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
