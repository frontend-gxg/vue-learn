import { createRouter, createWebHistory } from 'vue-router'
import TimelineVue from '@/components/timeline/Timeline.vue'
import MarkdownVue from '@/shared/Markdown.vue'
import blog0 from '@/blog/0.md?raw'
import blog1 from '@/blog/1.md?raw'

const metas: Record<string, string>[] = [
  { date: "2022-11-18", title: "HELLO WORLD", md: blog0, description: "" },
  { date: "2022-11-18", title: "LATEX", md: blog1, description: "" }
];

for (let i = 0; i < metas.length; i++) {
  metas[i].href = `/blog${i}`;
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/timeline',
      name: 'timeline',
      component: TimelineVue,
      props: {
        listData: metas,
      }
    },
    {
      path: '/tag',
      name: 'tag',
      component: TimelineVue,
      props: {
        listData: metas,
      }
    },
  ]
})

for (let i = 0; i < metas.length; i++) {
  router.addRoute({
    path: `/blog${i}`,
    name: `blog${i}`,
    component: MarkdownVue,
    props: {
      title: metas[i].title,
      md: metas[i].md,
    }
  });
}

export default router
