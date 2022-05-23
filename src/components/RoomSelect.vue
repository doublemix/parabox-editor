<script setup lang="ts">
import { levelContext } from "@/utils/context";
import type { Id } from "@/utils/levels";

import RoomView from "./RoomView.vue";
import ToolGroup from "./ToolGroup.vue";
import ToolButton from "./ToolButton.vue";

defineEmits<{
  (e: "select", id: Id | null): void;
}>();

const level = levelContext.inject();
</script>

<style scoped>
.room-select__grid {
  display: flex;
  gap: 10px;
  flex: row wrap;
  justify-content: start;
}
.room-select__grid-cell {
  border-radius: 5px;
  padding: 10px;
}
.room-select__grid-cell:hover {
  background: #bbb;
}
</style>

<template>
  <!-- TODO introduce a component for AppModalCard -->
  <div class="app-modal__card">
    <div class="room-select__grid">
      <template v-for="room of level.rooms">
        <div class="room-select__grid-cell" @click="$emit('select', room.id)">
          <RoomView :room-id="room.id" :depth="0" />
        </div>
      </template>
    </div>
    <ToolGroup>
      <ToolButton @click="$emit('select', null)">New</ToolButton>
    </ToolGroup>
  </div>
</template>
