<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

interface Result {
  columns: string[],
  values: any[][]
};

export default defineComponent({
  props: {
    result: {
      type: Object as PropType<Result>,
      required: true,
    }
  }
});
</script>

<template>
  <table class="table">
    <tr>
      <th v-for="column in result.columns">{{ column }}</th>
    </tr>
    <template v-for="value in result.values">
      <tr>
        <td v-for="v in value">{{ v }}</td>
      </tr>
    </template>
  </table>
</template>

<style scoped>
.table {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

.table tr:nth-child(odd) {
  background-color: #f7f7f7;
}

.table tr:hover {
  background-color: #ddd;
}

.table th {
  border: 1px solid #ddd;
  padding: 8px;
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: center;
  background-color: #04AA6D;
  color: white;
}

.table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
</style>
