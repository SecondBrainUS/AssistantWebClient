import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/userStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/Home.vue'),
      meta: { transition: 'fade' }
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: () => import('@/pages/Workspace.vue'),
      meta: { transition: 'slide', requiresAuth: true }
    },
    {
      path: '/login-success',
      name: 'login-success',
      component: () => import('@/pages/LoginCallback.vue'),
      meta: { requiresTemp: true } // New meta field
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Check if we need to validate authentication
  if (to.meta.requiresAuth) {
    // If we haven't checked auth status yet, do it now
    if (!userStore.loading && !userStore.isAuthenticated) {
      await userStore.checkAuth()
    }
    
    if (!userStore.isAuthenticated) {
      next('/')
      return
    }
  }
  
  // Special handling for login-success route
  if (to.meta.requiresTemp && !to.query.temp_token) {
    next('/')
    return
  }
  
  next()
})

export default router