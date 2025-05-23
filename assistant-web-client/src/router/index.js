import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/userStore'

const router = createRouter({
  history: createWebHistory('/assistant'),
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
      meta: { requiresTemp: true }
    }
    ,
    {
      path: '/cloud',
      name: 'cloud',
      component: () => import('@/components/CloudBackground.vue'),
      meta: {}
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (!userStore.authInitialized) {
    await userStore.initializeAuth()
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/')
    return
  }

  if (to.meta.requiresTemp && !to.query.temp_token) {
    next('/')
    return
  }

  next()
})

export default router