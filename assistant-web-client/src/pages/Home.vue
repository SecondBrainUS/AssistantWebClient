<template>
  <div class="w-full h-full bg-gray-700 text-gray-100 flex items-center justify-center relative overflow-hidden flex-col">
    <div class="glow"></div>
    <img src="@/assets/mush-v2-logo.png" alt="Logo" class="logo" />

    <!-- Google mode: manual sign-in button -->
    <button
      v-if="!isAuthenticated && authMode === 'google'"
      @click="loginWithGoogle"
      class="action-button"
    >
      Sign In
    </button>

    <!-- Cloudflare mode: CF handles the login before the page loads; show a quiet indicator -->
    <div
      v-if="!isAuthenticated && authMode === 'cloudflare'"
      class="action-button"
      style="opacity: 0.5; cursor: default; pointer-events: none;"
    >
      Signing in…
    </div>

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
import { computed, ref, onMounted } from 'vue'
import { getAuthConfig } from '../utils/authConfig'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)

const authMode = ref('google')  // default until config loads

onMounted(async () => {
  try {
    const config = await getAuthConfig()
    authMode.value = config.auth_mode
  } catch {
    // backend unreachable — fall back to google mode UI
  }
})

const loginWithGoogle = () => {
  window.location = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_BASE_PATH}/api/v1/auth/google/login`
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
