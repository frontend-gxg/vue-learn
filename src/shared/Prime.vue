<script lang="ts">
import { defineComponent } from 'vue';
import Prism from "prismjs";

const parse = (language: string) => {
  switch (language) {
    case "c":
      return Prism.languages.c;
    case "cpp":
      return Prism.languages.cpp;
    case "rust":
      return Prism.languages.rust;
    case "go":
      return Prism.languages.go;
    case "python":
      return Prism.languages.python;
    case "javascript":
      return Prism.languages.javascript;
    case "typescript":
      return Prism.languages.typescript;
    case "latex":
      return Prism.languages.latex;
    case "markup":
      return Prism.languages.markup;
    case "markdown":
      return Prism.languages.markdown;
    case "css":
      return Prism.languages.css;
  }
  return Prism.languages.c;
};

export default defineComponent({
  props: {
    code: {
      type: String,
      required: true
    },
    info: {
      type: String,
      required: true
    }
  },

  computed: {
    innerHTML(): string {
      return `<pre class="languages-${this.info}"><code class="languages-${this.info}">${Prism.highlight(this.code, parse(this.info), this.info)}</code></pre>`;
    }
  }
});
</script>

<template>
  <div v-html="innerHTML"></div>
</template>

<style scoped>
::v-deep(pre[class*=languages-]) {
  background-color: #272822;
  padding: 1em;
  margin: 0.5em 0;
  overflow: auto;
  border-radius: 0.3em;
  color: #f8f8f2;
  text-shadow: 0 1px rgb(0 0 0 / 30%);
  font-family: Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;
  font-size: 1em;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  tab-size: 4;
  hyphens: none;
}

::v-deep(code[class*=language-]) {
  color: #f8f8f2;
  background: none;
  text-shadow: 0 1px rgb(0 0 0 / 30%);
  font-family: Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace;
  font-size: 1em;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  tab-size: 4;
  hyphens: none;
}
</style>
