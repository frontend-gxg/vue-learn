import { createApp } from 'vue'
import App from './App.vue'
import Antd from "ant-design-vue";

import router from './router'

import 'ant-design-vue/dist/antd.css'
import 'katex/dist/katex.min.css'
import 'prismjs/themes/prism-okaidia.css'

import 'prismjs/components/prism-c.min.js'
import 'prismjs/components/prism-cpp.min.js'
import 'prismjs/components/prism-rust.min.js'
import 'prismjs/components/prism-go.min.js'
import 'prismjs/components/prism-python.min.js'
import 'prismjs/components/prism-javascript.min.js'
import 'prismjs/components/prism-typescript.min.js'
import 'prismjs/components/prism-latex.min.js'
import 'prismjs/components/prism-markup.min.js'
import 'prismjs/components/prism-markdown.min.js'
import 'prismjs/components/prism-css.min.js'

const app = createApp(App)

app.use(router)
   .use(Antd)

app.mount('#app')
