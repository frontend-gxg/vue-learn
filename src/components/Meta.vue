<script lang="ts">
import { defineComponent } from 'vue';

const monthList = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const getDay = (date: string): string => {
    const pad = (s: number) => `0${s}`.substr(-2);
    const d = new Date(date);
    const day = d.getDate();
    return `${pad(day)}`;
}

const getRest = (date: string): string => {
    const d = new Date(date);
    const month = monthList[d.getMonth()];
    const year = d.getFullYear();
    return `${month} ${year}`;
}

export default defineComponent({
  props: {
    date: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },

  computed: {
    day(): string {
      return getDay(this.date);
    },
    rest(): string {
      return getRest(this.date); 
    }
  }
});
</script>

<template>
  <div class="post-header">
    <div class="meta">
        <div class="date">
            <span class="day">{{ day }}</span>
            <span class="rest">{{ rest }}</span>
        </div>
    </div>
    <div class="matter">
        <h4 class="title small">{{ title }}</h4>
        <span class="description">{{ description }}</span>
    </div>
  </div>
</template>

<style scoped>
.post-header {
    margin-bottom: 30px;
    display: flex;
}

.post-header .meta {
    margin-bottom: 0;
    margin-left: 5px;
}

.post-header .meta .date {
    margin-right: 30px;
    width: 64px;
    text-align: center;
}

.post-header .meta .date .day {
    color: #333;
    font-family: "Playfair Display", serif;
    font-weight: 700;
    line-height: 0.45em;
    font-size: 3em;
    display: block;
    margin-bottom: 20px;
}

.post-header .meta .date .rest {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    color: #333;
    line-height: 1.8em;
    display: block;
    font-size: 0.75em;
}

.post-header .matter .title.small {
    margin: 0 0 10px 0;
}

.post-header .matter .description {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    color: #333;
    line-height: 1.8em;
    font-size: 17px;
}

h4 {
    font-family: "Inter", sans-serif;
    font-size: 1rem;
    color: #333;
    font-weight: 500;
    line-height: 1.3em;
    margin: 30px 0 20px 0;
    display: block;
    margin-block-start: 1.33em;
    margin-block-end: 1.33em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
}

a {
    color: #3700ff;
    text-decoration: none;
    word-break: break-word;
    background-color: transparent;
}
</style>
