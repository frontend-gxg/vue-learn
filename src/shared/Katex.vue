<script lang="ts">
import { defineComponent } from 'vue';
import renderMathInElement from "katex/contrib/auto-render";

export default defineComponent({
  props: {
    formula: {
      type: String,
      required: true
    },
  },

  mounted() {
    renderMathInElement(this.$refs.formula as HTMLElement, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\begin{equation}", right: "\\end{equation}", display: true },
        { left: "\\begin{align}", right: "\\end{align}", display: true },
        { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
        { left: "\\begin{gather}", right: "\\end{gather}", display: true },
        { left: "\\begin{CD}", right: "\\end{CD}", display: true },
        { left: "\\[", right: "\\]", display: true },
      ]
    });
  }
});
</script>

<template>
  <div ref="formula">{{ formula }}</div>
</template>
