<script setup lang="ts">
import * as Vue from "vue";

type Props = { active?: boolean };
const props = defineProps<Props>();

const classes = Vue.computed(() => ({
  "tool-button--active": props.active ?? false,
}));
</script>
<style>
.tool-button {
  background: #ccc;
  border: 1px darkgray solid;
}
.tool-button:first-child {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}
.tool-button:last-child {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
.tool-button--selected,
.tool-button--active {
  background: white;
}
</style>

<template>
  <button class="tool-button" :class="classes" v-bind="$attrs">
    <slot></slot>
  </button>
</template>
