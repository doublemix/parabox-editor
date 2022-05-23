<script setup lang="ts">
import * as Vue from "vue";

import type { Tool, ToolType } from "@/types";
import ToolButton from "./ToolButton.vue";

type Props = {
  tool: Tool;
  currentTool: string;
};
const props = defineProps<Props>();
defineEmits<{
  (e: "select-tool", value: ToolType): void;
}>();

const isSelected = Vue.computed(() => props.tool.toolId === props.currentTool);
</script>

<template>
  <ToolButton :active="isSelected" @click="$emit('select-tool', tool.toolId)">
    {{ tool.name }}
  </ToolButton>
</template>
