<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import baseApi from '../utils/baseApi'

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

    const response = await baseApi.get('/auth/validate-token', {
      params: { temp_token: tempToken }
    })

    if (response.status !== 200) {
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