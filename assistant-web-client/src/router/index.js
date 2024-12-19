import { createRouter, createWebHistory } from 'vue-router';
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
      component: () => import('@/pages/LoginCallback.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  // to.meta.previousPath = from.path
  // to.meta.previousTransition = from.meta.transition
  // next()
  const userStore = useUserStore()
  
  // Define which routes require authentication
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
});

export default router;
