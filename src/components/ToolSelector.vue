<script setup lang="ts">
import type { Tool, ToolType } from "@/types";
import { levelContext, roomContext, stateContext } from "@/utils/context";
import { expandRoom } from "@/utils/levels";

import ToolGroup from "./ToolGroup.vue";
import ToolSelectButton from "./ToolSelectButton.vue";
import ToolButton from "./ToolButton.vue";
import { useMagicKeys } from "@vueuse/core";

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

const { a: left, w: up, s: down, d: right } = useMagicKeys();
const doExpandRoom = (size: number) => {
  const none = !left.value && !right.value && !up.value && !down.value;
  const doLeft = none || left.value;
  const doRight = none || right.value;
  const doUp = none || up.value;
  const doDown = none || down.value;
  const get = (condition: boolean) => (condition ? size : 0);
  expandRoom(room.value, get(doUp), get(doRight), get(doDown), get(doLeft));
};
const bigger = () => {
  doExpandRoom(1);
};
const smaller = () => {
  doExpandRoom(-1);
};
</script>

<template>
  <div>
    {{ left ? "left" : "not" }}
    <ToolGroup>
      <ToolSelectButton
        v-for="tool of tools"
        :key="tool.toolId"
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
