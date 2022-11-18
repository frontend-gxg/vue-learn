<script lang="ts">
import { defineComponent } from 'vue';
import mermaid from "mermaid";
mermaid.initialize({ startOnLoad: true });

export default defineComponent({
  props: {
    graphDefinition: {
      type: String,
      required: true
    },
  },

  data() {
    return {
      innerHTML: String,
    }
  },

  mounted() {
    const insertSvg = (svgCode: any, bindFunctions: any) => {
      this.innerHTML = svgCode;
    };
    mermaid.mermaidAPI.render('graphDiv', this.graphDefinition, insertSvg);
  }
});
</script>

<template>
  <div v-html="innerHTML"></div>
</template>
