<script setup lang="ts">
type Props = {
  title: string;
};
defineProps<Props>();
</script>

<style scoped>
.properties-panel {
  background: white;
  border: 1px solid black;
  padding: 10px;
  margin: 10px 0;
}
.properties-panel__title {
  border-bottom: 2px solid gray;
  text-transform: uppercase;
  margin-bottom: 7px;
}
</style>

<template type="text/html" id="properties-panel">
  <div class="properties-panel">
    <div class="properties-panel__title">{{ title }}</div>
    <div class="properties.panel__content">
      <slot></slot>
    </div>
  </div>
</template>
