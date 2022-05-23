<script setup lang="ts">
import * as Vue from "vue";

import { _throw } from "@/utils";
import { levelToFile } from "@/utils/level-code-generator";
import { levelContext, stateContext } from "@/utils/context";
import { defaultLevel, defaultRoom, type Id, type Room } from "@/utils/levels";
import type { State } from "@/types";

import RoomEditor from "./RoomEditor.vue";
import RoomSelect from "./RoomSelect.vue";
import AppModal from "./AppModal.vue";

const level = Vue.reactive(defaultLevel("Interesting Level"));

const state = Vue.reactive<State>({
  room: 0,
  roomSelect: null,
  nextRoomId: 1,
}) as State;
const levelAsText = Vue.computed(() => levelToFile(level));
const showLevel = Vue.ref(true);

const handleRoomSelect = (maybeSelectedRoomId: Id | null) => {
  if (state.roomSelect != null) {
    let selectedRoomId: Id;
    if (maybeSelectedRoomId === null) {
      const newRoom = defaultRoom(state.nextRoomId++);
      level.rooms.push(newRoom);
      selectedRoomId = newRoom.id;
    } else {
      selectedRoomId = maybeSelectedRoomId;
    }
    if (state.roomSelect.type === "inf-exit") {
      const { x, y, targetId: targetRoomId } = state.roomSelect;
      const targetRoom =
        level.rooms.find((r) => r.id === targetRoomId) ??
        _throw<Room>("Cannot find room");
      targetRoom.contents.push({
        type: "inf-exit",
        x,
        y,
        // TODO automatic order
        order: 0,
        refId: selectedRoomId,
        player: null,
        flipped: false,
      });
    } else if (state.roomSelect.type === "inf-enter") {
      state.roomSelect.target.infEnterId = selectedRoomId;
      state.roomSelect.target.order = 0;
    } else {
      const { x, y, targetId: targetRoomId } = state.roomSelect;
      const targetRoom =
        level.rooms.find((r) => r.id === targetRoomId) ??
        _throw<Room>("Cannot find room");
      // TODO if not clone, remove any other instances of this room
      targetRoom.contents.push({
        type: "room",
        x,
        y,
        id: selectedRoomId,
        isClone: state.roomSelect.type === "clone",
        infEnterId: null,
        player: null,
        order: 0,
        flipped: false,
      });
    }
    state.roomSelect = null;
  }
};

levelContext.provide(level);
stateContext.provide(state);
</script>

<style scoped>
.level-code {
  font-family: "Courier New", Courier, monospace;
  white-space: pre;
}
</style>

<template>
  <div class="container">
    <div class="full-column mt mb position-root">
      <RoomEditor v-if="state.room !== null" :room-id="state.room" />
      <button @click="showLevel = !showLevel">
        Toggle Display Level Code!
      </button>
      <div v-if="showLevel" class="level-code">{{ levelAsText }}</div>
      <AppModal v-if="state.roomSelect" @close="state.roomSelect = null">
        <RoomSelect @select="handleRoomSelect" />
      </AppModal>
    </div>
  </div>
</template>
