<script setup lang="ts">
import * as Vue from "vue";

import { pipe, range, collect } from "@/utils";

type Props = {
  width: number;
  height: number;
};

const props = defineProps<Props>();

defineEmits<{
  (e: "click-cell", value: [number, number]): void;
}>();

const positions = Vue.computed(() =>
  pipe(range(props.width - 1, -1, -1), collect).flatMap((y) =>
    pipe(
      range(props.height),
      pipe.map((x) => [x, y] as [number, number]),
      collect
    )
  )
);

const gridStyles = Vue.computed(() => ({
  gridTemplateColumns: `repeat(${props.width}, 1fr)`,
}));
</script>

<style scoped>
.cell-select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-auto-rows: 1fr;
  z-index: 1;
}
</style>

<template>
  <div class="cell-select-overlay" :style="gridStyles">
    <div v-for="[x, y] of positions" @click="$emit('click-cell', [x, y])"></div>
  </div>
</template>
