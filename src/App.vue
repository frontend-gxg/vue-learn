<script lang="ts">
import { defineComponent } from 'vue';
import SQLVue from '@/views/SQL.vue';

export default defineComponent({
    components: { 
      SQLVue 
    }
});
</script>

<template>
  <SQLVue class="sql" />
</template>

<style scoped>
.sql {
  width: 60%;
  margin-top: 100px;
  margin-left: auto;
  margin-right: auto;
  font-size: 18px;
}
</style>