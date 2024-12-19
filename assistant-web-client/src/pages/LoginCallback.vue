<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  const token = route.query.token
  if (token) {
    userStore.setToken(token)
    router.push('/workspace')
  } else {
    router.push('/')
  }
})
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <p>Logging you in...</p>
  </div>
</template> 