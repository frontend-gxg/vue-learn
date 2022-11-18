<script lang="ts">
import { defineComponent } from 'vue';
import { marked } from "marked";
import Prism from "prismjs";
import renderMathInElement from "katex/contrib/auto-render";

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

const renderer = {
  code(code: string, infostring: string, escaped: boolean) {
    return `<pre class="languages-${infostring}"><code class="languages-${infostring}">${Prism.highlight(code, parse(infostring), infostring)}</code></pre>`
  },

  blockquote(quote: string) {
      return `<blockquote class="markdown-blockquote"><p>${quote}</p></blockquote>`;
  },

  table(header: string, body: string) {
    return `<table class="markdown-table">${header}${body}</table>`;
  },

  image(href: string, title: string, text: string) {
    return `<p class="markdown-image1"><img class="markdown-image2" src=${href}, alt=${text}></p>`;
  }
};

marked.use({ renderer });

const makeInnerHTML = (title: string, md: string) => {
  const innerHTML = `
    <h1 style="text-align: center; margin-top: 8px; margin-bottom: 0px; padding: 0px; font-size: 60px; line-height:1.2;">${title}</h1>
    <hr style="height:2px; border-width:0; color:gray; background-color:gray">
    <div style="margin-top: 30px; font-size: 20px">
      ${marked.parse(md)}
    </div>
  `;
  return innerHTML;
};

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    md: {
      type: String,
      required: true
    },
  },

  computed: {
    innerHTML(): string {
      return makeInnerHTML(this.title, this.md);
    }
  },

  methods: {
    makeKatex() {
      renderMathInElement(this.$refs.md as HTMLElement, {
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
  },

  mounted() {
    this.makeKatex();
  },
  
  updated() {
    this.innerHTML = makeInnerHTML(this.title, this.md);
    this.makeKatex();
  }
});
</script>

<template>
  <div ref="md" v-html="innerHTML"></div>
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

::v-deep(.markdown-blockquote) {
  background: rgba(10, 133, 255, .14);
  border-left: 4px solid #0066cc;
  border-radius: 4px;
  color: #666;
  margin: 20px 0;
  padding: 1px 20px;
}

::v-deep(.markdown-table) {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

::v-deep(.markdown-table tr:nth-child(odd)) {
  background-color: #f7f7f7;
}

::v-deep(.markdown-table tr:hover) {
  background-color: #ddd;
}

::v-deep(.markdown-table th) {
  border: 1px solid #ddd;
  padding: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: center;
  background-color: #04AA6D;
  color: white;
}

::v-deep(.markdown-table td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

::v-deep(.markdown-latex2) {
  text-align: center;
}

::v-deep(.markdown-image2) {
  width: 100%;
}
</style>