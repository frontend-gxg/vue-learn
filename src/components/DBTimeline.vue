<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import TimelineVue from '@/components/Timeline.vue';

interface Result {
  columns: string[],
  values: any[][]
};

export default defineComponent({
  components: { 
    TimelineVue 
  },

  props: {
    result: {
      type: Object as PropType<Result>,
      required: true,
    }
  },

  computed: {
    listData(): any[] {
        let metas: Record<string, String>[] = [];
        for (let value of this.result.values) {
            metas.push({
                date: value[0],
                title: value[1],
                description: value[2],
            });
        }
        return metas;
    }
  }
});
</script>

<template>
  <TimelineVue :listData="listData" />
</template>
