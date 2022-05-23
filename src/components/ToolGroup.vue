<style scoped>
.tool-group {
  display: inline-block;
  margin-right: 10px;
}
</style>

<template>
  <div class="tool-group" v-bind="$attrs">
    <slot></slot>
  </div>
</template>
