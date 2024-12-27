<template>
  <div class="w-full h-full bg-gray-700 text-gray-100 flex items-center justify-center relative overflow-hidden flex-col">
    <div class="glow"></div>
    <img src="@/assets/mush-v2-logo.png" alt="Logo" class="logo" />
    <button 
      v-if="!isAuthenticated"
      @click="loginWithGoogle" 
      class="action-button"
    >
      Sign In
    </button>
    <router-link 
      v-if="isAuthenticated"
      class="action-button" 
      to="/workspace"
    >
      Go To Workspace
    </router-link>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const isAuthenticated = computed(() => userStore.isAuthenticated)

// Check auth status when component mounts
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('auth') === 'success') {
    console.log('Auth success detected, checking status...')
    
    // Remove query parameter but keep the timestamp
    const ts = urlParams.get('ts')
    window.history.replaceState({}, document.title, window.location.pathname)
    
    // Increased delay to ensure cookies are set
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      console.log('Checking auth status...')
      // Add timestamp to prevent caching
      await userStore.checkAuthStatus()
      console.log('Auth status check complete:', userStore.isAuthenticated)
      
      // Debug cookie information
      console.log('Document cookie string:', document.cookie)
      
      if (userStore.isAuthenticated) {
        console.log('Redirecting to workspace...')
        router.push('/workspace')
      } else {
        console.log('Not authenticated after status check')
      }
    } catch (error) {
      console.error('Error during auth status check:', error.response?.data || error)
    }
  }
})

const loginWithGoogle = () => {
  console.log('Initiating Google login...')
  window.location = '/api/v1/auth/google/login'
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

@keyframes scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.glow {
  position: absolute;
  width: 40vmax;
  height: 40vmax;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  border-radius: 50%;
  animation: pulse 6s ease-in-out infinite;
  z-index: 0;
  filter: blur(100px);
  transform: translate(-50%, -50%);

}

.logo {
  max-width: 50%;
  max-height: 50%;
  position: relative;
  z-index: 1;
  animation: scale 6s ease-in-out infinite;
  opacity: 1;
}

.action-button {
  position: absolute;
  bottom: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1;
  transition: background-color 0.3s ease;
  text-decoration: none;
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>