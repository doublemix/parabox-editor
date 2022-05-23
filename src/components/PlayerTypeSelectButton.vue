<script setup lang="ts">
import * as Vue from "vue";

import type { PlayerOrderValue } from "@/utils/levels";

import ToolButton from "./ToolButton.vue";

type Props = {
  value: PlayerOrderValue;
  currentValue: PlayerOrderValue;
};

const props = defineProps<Props>();

defineEmits<{
  (e: "select", value: PlayerOrderValue): void;
}>();

const active = Vue.computed(() => props.value === props.currentValue);
</script>

<template>
  <ToolButton :active="active" @click="$emit('select', value)">
    <slot></slot>
  </ToolButton>
</template>
