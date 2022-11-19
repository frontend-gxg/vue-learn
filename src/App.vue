<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    return {
      selectedKeys: ref<string[]>(['2']),
    };
  },
});
</script>

<template>
  <a-layout class="layout">
    <a-layout-header :style="{height: '100px'}">
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="horizontal" :style="{lineHeight: '100px', left: '60px', fontSize: '18px'}">
          <a-menu-item key="1" :style="{left: '50px', background: '#001529'}"><RouterLink to="/">时间线</RouterLink></a-menu-item>
          <a-menu-item key="2" :style="{left: '100px', background: '#001529'}"><RouterLink to="/sql">SQL</RouterLink></a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content :style="{width: '60%', marginTop: '100px', marginLeft: 'auto', marginRight: 'auto', fontSize: '18px'}">
      <RouterView name="app" />
    </a-layout-content>
  </a-layout>
</template>
