<script setup lang="ts">
import type { PlayerOrderValue } from "@/utils/levels";

import ToolGroup from "./ToolGroup.vue";
import PlayerTypeSelectButton from "./PlayerTypeSelectButton.vue";

type Props = {
  modelValue: PlayerOrderValue;
};
defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: PlayerOrderValue): void;
}>();

const set = (value: PlayerOrderValue) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <ToolGroup>
    <PlayerTypeSelectButton
      :value="null"
      :current-value="modelValue"
      @select="set($event)"
    >
      None
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="'possess'"
      :current-value="modelValue"
      @select="set($event)"
    >
      Possess
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="0"
      :current-value="modelValue"
      @select="set($event)"
    >
      1
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="1"
      :current-value="modelValue"
      @select="set($event)"
    >
      2
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="2"
      :current-value="modelValue"
      @select="set($event)"
    >
      3
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="3"
      :current-value="modelValue"
      @select="set($event)"
    >
      4
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="4"
      :current-value="modelValue"
      @select="set($event)"
    >
      5
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="5"
      :current-value="modelValue"
      @select="set($event)"
    >
      6
    </PlayerTypeSelectButton>
    <PlayerTypeSelectButton
      :value="6"
      :current-value="modelValue"
      @select="set($event)"
    >
      7
    </PlayerTypeSelectButton>
  </ToolGroup>
</template>
