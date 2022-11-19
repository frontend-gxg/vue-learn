import { createRouter, createWebHistory } from 'vue-router'
import TimelineVue from '@/components/Timeline.vue'
import SQLVue from '@/components/Test.vue'
import MarkdownVue from '@/shared/Markdown.vue'
import blog0 from '@/blog/0.md?raw'
import blog1 from '@/blog/1.md?raw'

const metas = [
  { date: "2022-11-18", title: "HELLO WORLD", md: blog0, tags: [], description: "" },
  { date: "2022-11-18", title: "LATEX", md: blog1, tags: [], description: "",  }
];

let listData: Record<string, string>[] = [];
for (let i = metas.length - 1; i > -1; i--) {
  listData.push({
    date: metas[i].date,
    title: metas[i].title,
    description: metas[i].description,
    href: `/blog${i}`,
  });
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'timeline',
      components: {
        app: TimelineVue
      },
      props: {
        app: {
          listData: listData
        },
      }
    },
    {
      path: '/sql',
      name: 'sql',
      components: {
        app: SQLVue
      }
    }
  ]
})

for (let i = 0; i < metas.length; i++) {
  router.addRoute({
    path: `/blog${i}`,
    name: `blog${i}`,
    components: {
      app: MarkdownVue
    },
    props: {
      app: {
        title: metas[i].title,
        md: metas[i].md,
      },
    }
  });
}

export default router
