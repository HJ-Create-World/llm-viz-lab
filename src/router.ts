import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/labs/tokenizer',
      name: 'tokenizer',
      component: () => import('@/labs/tokenizer/TokenizerLab.vue'),
    },
    {
      path: '/labs/context',
      name: 'context',
      component: () => import('@/labs/context/ContextLab.vue'),
    },
    {
      path: '/labs/cost',
      name: 'cost',
      component: () => import('@/labs/cost/CostLab.vue'),
    },
    {
      path: '/labs/:name',
      name: 'lab',
      component: () => import('@/views/LabPlaceholder.vue'),
    },
  ],
})

export default router
