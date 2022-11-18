<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      count: 0
    }
  },

  methods: {
    increment() {
      this.count++
    }
  },

  mounted() {
    console.log(`The initial count is ${this.count}.`)
  }
});
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
  
<style scoped>
button {
  font-weight: bold;
}
</style>
