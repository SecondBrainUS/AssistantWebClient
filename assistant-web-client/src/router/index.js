import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/workspace', component: () => import('@/pages/Workspace.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
