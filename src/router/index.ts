import { createRouter, createWebHistory } from 'vue-router'
import SQLVue from '@/views/SQL.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'sql',
      components: {
        app: SQLVue
      },
    },

  ]
})

export default router
