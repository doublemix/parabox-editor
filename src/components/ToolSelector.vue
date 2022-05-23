<script setup lang="ts">
import type { Tool, ToolType } from "@/types";
import { levelContext, roomContext, stateContext } from "@/utils/context";
import { expandRoom } from "@/utils/levels";

import ToolGroup from "./ToolGroup.vue";
import ToolSelectButton from "./ToolSelectButton.vue";
import ToolButton from "./ToolButton.vue";

const makeTool = (toolId: ToolType, name: string): Tool => ({ toolId, name });
const tools = [
  makeTool("select", "Select"),
  makeTool("floor", "Floor"),
  makeTool("wall", "Wall"),
  makeTool("box", "Box"),
  makeTool("player", "Player"),
  makeTool("button", "Button"),
  makeTool("player-button", "Goal"),
  makeTool("room", "Room"),
  makeTool("clone", "Clone"),
  makeTool("inf-exit", "InfExit"),
];
type Props = {
  currentTool: ToolType;
};
defineProps<Props>();

defineEmits<{
  (e: "select-tool", value: ToolType): void;
}>();

const level = levelContext.inject();
const state = stateContext.inject();
const room = roomContext.inject();
const changeRoom = (delta: number) => {
  const roomIndex = level.rooms.findIndex((r) => r === room.value);
  const newRoomIndex =
    (roomIndex + level.rooms.length + delta) % level.rooms.length;
  state.room = level.rooms[newRoomIndex].id;
};
const bigger = () => {
  expandRoom(room.value, 1, 1, 1, 1);
};
const smaller = () => {
  expandRoom(room.value, -1, -1, -1, -1);
};
</script>

<template>
  <div>
    <ToolGroup>
      <ToolSelectButton
        v-for="tool of tools"
        :tool="tool"
        :current-tool="currentTool"
        @select-tool="$emit('select-tool', $event)"
      ></ToolSelectButton>
    </ToolGroup>
    <ToolGroup>
      <ToolButton @click="changeRoom(-1)">Prev Room</ToolButton>
      <ToolButton @click="changeRoom(+1)">Next Room</ToolButton>
    </ToolGroup>
    <ToolGroup>
      <ToolButton @click="bigger">+</ToolButton>
      <ToolButton @click="smaller">-</ToolButton>
    </ToolGroup>
  </div>
</template>
