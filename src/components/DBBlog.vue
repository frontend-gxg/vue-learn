<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import MarkdownVue from '@/shared/Markdown.vue';

interface Result {
  title: string,
  md: string,
};

export default defineComponent({
  components: { 
    MarkdownVue 
  },

  props: {
    result: {
      type: Object as PropType<Result>,
      required: true,
    }
  }
});
</script>

<template>
  <MarkdownVue :title="result.title" :md="result.md" />
</template>
