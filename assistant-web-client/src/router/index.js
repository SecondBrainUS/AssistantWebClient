import { createRouter, createWebHistory } from 'vue-router';

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
      meta: { transition: 'slide' }
    }
  ]
});

router.beforeEach((to, from, next) => {
  to.meta.previousPath = from.path
  to.meta.previousTransition = from.meta.transition
  next()
});

export default router;
