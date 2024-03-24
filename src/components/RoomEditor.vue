<script setup lang="ts">
import * as Vue from "vue";
import ColorInput from "vue-color-input";

import { _throw } from "@/utils";
import type { Room, RoomRef, Id } from "@/utils/levels";
import { removeInLevel, getContent } from "@/utils/levels";
import { stateContext, levelContext, roomContext } from "@/utils/context";
import type { ToolType } from "@/types";

import ToolSelector from "./ToolSelector.vue";
import RoomView from "./RoomView.vue";
import CellSelectOverlay from "./CellSelectOverlay.vue";
import PropertiesPanel from "./PropertiesPanel.vue";
import PlayerTypeSelect from "./PlayerTypeSelect.vue";
import ToolGroup from "./ToolGroup.vue";
import ToolButton from "./ToolButton.vue";

type SelectedCellValue = [number, number];

type Props = {
  roomId: Id;
};
const props = defineProps<Props>();

const currentTool = Vue.ref<ToolType>("floor");
const state = stateContext.inject();
const level = levelContext.inject();
const room = Vue.computed(
  () =>
    level.rooms.find((r) => r.id === props.roomId) ??
    _throw<Room>("room not found")
);
const onCellClicked = ([x, y]: [number, number]) => {
  function removeAt() {
    room.value.contents = room.value.contents.filter((c) => {
      if (c.x === x && c.y === y) {
        return false;
      }
      return true;
    });
  }
  if (currentTool.value === "select") {
    if (
      selectedCell.value &&
      selectedCell.value[0] === x &&
      selectedCell.value[1] === y
    ) {
      selectedCell.value = null;
    } else {
      selectedCell.value = [x, y];
    }
  }
  if (currentTool.value === "floor") {
    removeAt();
  }
  if (currentTool.value === "wall") {
    removeAt();
    room.value.contents.push({ type: "wall", x, y, player: null });
  }
  if (currentTool.value === "box") {
    removeAt();
    room.value.contents.push({
      type: "block",
      x,
      y,
      color: { h: 40, s: 1, v: 1 },
      player: null,
    });
  }
  if (currentTool.value === "player") {
    removeAt();
    removeInLevel(level, (c) => c.type === "block" && c.player === 0);
    room.value.contents.push({
      type: "block",
      x,
      y,
      player: 0,
      color: { h: 0, s: 1, v: 1 },
    });
  }
  if (currentTool.value === "button") {
    removeAt();
    room.value.contents.push({
      type: "floor",
      x,
      y,
      buttonType: "Button",
    });
  }
  if (currentTool.value === "player-button") {
    removeAt();
    room.value.contents.push({
      type: "floor",
      x,
      y,
      buttonType: "PlayerButton",
    });
  }
  if (currentTool.value === "room") {
    removeAt();
    state.roomSelect = {
      type: "room",
      x,
      y,
      targetId: state.room,
    };
  }
  if (currentTool.value === "clone") {
    removeAt();
    state.roomSelect = {
      type: "clone",
      x,
      y,
      targetId: state.room,
    };
  }
  if (currentTool.value === "inf-exit") {
    removeAt();
    state.roomSelect = {
      type: "inf-exit",
      x,
      y,
      targetId: state.room,
    };
  }
};

const selectedCell = Vue.ref<SelectedCellValue | null>(null);

type Selected = {
  title: string;
  item: any; // TODO expand type if it's worth it
  hasColor: boolean;
  canBePlayer: boolean;
  canFlip: boolean;
  canBeInfEnter: boolean;
  hasInfiniteOrder: boolean;
};
const selected = Vue.computed<Selected | null>((): Selected | null => {
  if (selectedCell.value == null) {
    return null;
  }

  for (const x of getContent(
    room.value,
    selectedCell.value[0],
    selectedCell.value[1]
  )) {
    if (x.type === "room") {
      return {
        title: "room ref",
        item: x,
        hasColor: false,
        canBePlayer: true,
        canFlip: true,
        canBeInfEnter: true,
        hasInfiniteOrder: x.infEnterId != null,
      };
    }
    if (x.type === "block") {
      return {
        title: "block",
        item: x,
        hasColor: true,
        canBePlayer: true,
        canFlip: false,
        canBeInfEnter: false,
        hasInfiniteOrder: false,
      };
    }
    if (x.type === "wall") {
      return {
        title: "wall",
        item: x,
        hasColor: false,
        canBePlayer: true,
        canFlip: false,
        canBeInfEnter: false,
        hasInfiniteOrder: false,
      };
    }
    if (x.type === "inf-exit") {
      return {
        title: "infinite exit",
        item: x,
        hasColor: false,
        canBePlayer: true,
        canFlip: true,
        canBeInfEnter: false,
        hasInfiniteOrder: true,
      };
    }
  }
  return null;
});

const selectInfEnterRoom = (target: RoomRef) => {
  state.roomSelect = {
    type: "inf-enter",
    target,
  };
};

roomContext.provide(room);
</script>

<template>
  <ToolSelector
    :current-tool="currentTool"
    @select-tool="currentTool = $event"
  />
  <div class="room-view-container">
    <div style="width: 520px; height: 520px; position: relative">
      <RoomView :room-id="roomId" :depth="1" />
      <CellSelectOverlay
        :width="room.width"
        :height="room.height"
        @click-cell="onCellClicked"
      />
    </div>
  </div>
  <PropertiesPanel title="ROOM">
    <div>
      Color:
      <ColorInput v-model="room.color" />
    </div>
    <div>Void Plane: <input type="checkbox" v-model="room.isVoidPlane" /></div>
    <div>
      Zoom Factor:
      <input
        v-model="room.zoomFactor"
        type="range"
        min="0.1"
        max="1.0"
        step="0.01"
      />
    </div>
    <div>
      Special Effect:
      <input v-model="room.specialEffect" type="number" min="0" />
    </div>
  </PropertiesPanel>
  <PropertiesPanel v-if="selected" :title="selected.title">
    <template v-if="selected.hasColor">
      <div>
        Color:
        <ColorInput v-model="selected.item.color" />
      </div>
    </template>
    <template v-if="selected.canBePlayer">
      <div>
        Player:
        <PlayerTypeSelect v-model="selected.item.player" />
      </div>
    </template>
    <template v-if="selected.canFlip">
      <div>Flip: <input type="checkbox" v-model="selected.item.flipped" /></div>
    </template>
    <template v-if="selected.canBeInfEnter">
      <div>
        Infinite Enter:
        <ToolGroup>
          <ToolButton @click="selectInfEnterRoom(selected!.item)">
            Select
          </ToolButton>
          <ToolButton
            v-if="selected.item.infEnterId != null"
            @click="selected!.item.infEnterId = null"
          >
            Clear
          </ToolButton>
        </ToolGroup>
      </div>
    </template>
    <template v-if="selected.hasInfiniteOrder">
      <div>
        Order:
        <ToolGroup>
          <ToolButton
            @click="selected!.item.order = Math.max(selected!.item.order - 1, 0)"
          >
            -
          </ToolButton>
          <ToolButton>{{ selected.item.order + 1 }}</ToolButton>
          <ToolButton @click="selected!.item.order++">+</ToolButton>
        </ToolGroup>
      </div>
    </template>
  </PropertiesPanel>
  <PropertiesPanel title="level">
    <div>Extrude: <input type="checkbox" v-model="level.extrude" /></div>
    <div>Inner Push: <input type="checkbox" v-model="level.innerPush" /></div>
    <div>
      Style:
      <select v-model="level.style">
        <option value="normal">Normal</option>
        <option value="tui">TUI</option>
        <option value="grid">Grid</option>
        <option value="oldstyle">Gallery</option>
      </select>
    </div>
    <div>
      Custom Level Palette:
      <input type="number" v-model="level.customLevelPalette" min="-1" />
    </div>
  </PropertiesPanel>
</template>

<style scoped>
.room-view-container {
  margin: 20px 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
}
</style>
