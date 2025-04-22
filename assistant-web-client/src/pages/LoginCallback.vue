<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  try {
    const tempToken = route.query.temp_token
    if (!tempToken) {
      router.push('/')
      return
    }

    // Now make a second request to actually set the cookies
    const response = await fetch(
      `/assistant/api/v1/auth/validate-token?temp_token=${tempToken}`,
      {
        credentials: 'include'
      }
    )

    if (!response.ok) {
      throw new Error('Failed to complete authentication')
    }

    await userStore.checkAuth()
    router.push('/workspace')
    
  } catch (error) {
    console.error('Authentication error:', error)
    router.push('/')
  }
})
</script>