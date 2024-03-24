<script setup lang="ts">
import * as Vue from "vue";
import tinycolor from "tinycolor2";

import { levelContext, roomContext } from "@/utils/context";
import { _throw, pipe, range, insetShape, collect } from "@/utils";
import type { Room, ICanBePlayer, Id } from "@/utils/levels";
import { processWalls } from "@/utils/levels";

interface Props {
  roomId: Id;
  depth: number;
  width?: string;
  height?: string;
}
const props = withDefaults(defineProps<Props>(), {
  width: "100%",
  height: "100%",
});

const level = levelContext.inject();
const room = Vue.computed(() => {
  return (
    level.rooms.find((x) => x.id === props.roomId) ??
    _throw<Room>(new Error("missing room"))
  );
});

roomContext.provide(room);

const roomWidth = Vue.computed(() => room.value.width);
const roomHeight = Vue.computed(() => room.value.height);

const positions = Vue.computed(() =>
  pipe(range(roomWidth.value - 1, -1, -1), collect).flatMap((x) =>
    pipe(
      range(roomHeight.value),
      pipe.map((y) => [x, y] as [number, number]),
      collect
    )
  )
);

type Eyes = "player" | "possess" | null;

function getEyes(item: ICanBePlayer): Eyes {
  return typeof item.player === "number"
    ? "player"
    : item.player === "possess"
    ? "possess"
    : null;
}

type Element = {
  x: number;
  y: number;
  roomId?: Id;
  box?: { color: string };
  eyes?: Eyes;
  text?: string;
  button?: boolean;
};

const elements = Vue.computed<Element[]>(() => {
  // TODO maybe improve this typing
  const result: Element[] = [];
  room.value.contents.forEach((item) => {
    const { x, y } = item;
    if (item.type === "wall") {
      const eyes = getEyes(item);
      if (eyes) {
        result.push({
          x,
          y,
          eyes,
        });
      }
    }
    if (item.type === "block") {
      result.push({
        x,
        y,
        box: { color: tinycolor(item.color).toRgbString() },
        eyes: getEyes(item),
      });
    }
    if (item.type === "floor" && item.buttonType === "PlayerButton") {
      result.push({ x, y, button: true, eyes: "player" });
    }
    if (item.type === "floor" && item.buttonType === "Button") {
      result.push({ x, y, button: true });
    }
    if (item.type === "room") {
      if (props.depth > 0) {
        result.push({ x, y, roomId: item.id, eyes: getEyes(item) });
      } else {
        result.push({
          x,
          y,
          box: { color: "black" },
          eyes: getEyes(item),
        });
      }
      if (item.isClone ?? false) {
        result.push({ x, y, box: { color: "#FFFA" } });
      }
      if (item.infEnterId != null) {
        result.push({ x, y, text: "ε" });
      }
    }
    if (item.type === "inf-exit") {
      result.push({ x, y, text: "∞", roomId: item.refId });
    }
  });
  return result;
});

const wallPath = Vue.computed(() => {
  const pointCycles = processWalls(room.value);
  let path = "";
  pointCycles.map((cycle) => {
    path += "M";
    cycle = insetShape(cycle, 0.05);
    cycle.forEach(({ x, y }) => {
      path += `${x},${y} `;
    });
    path += "z";
  });
  return path;
});

const roomFloorColor = Vue.computed(() => {
  return tinycolor(room.value.color).desaturate(50).toHexString();
});

const roomWallColor = Vue.computed(() => {
  return tinycolor(room.value.color).toHexString();
});

const viewBox = Vue.computed(() => {
  const majorDimension = Math.max(room.value.width, room.value.height);
  const viewBox = `0 ${-majorDimension} ${majorDimension} ${majorDimension}`;
  return viewBox;
});

const transform = Vue.computed(() => {
  const majorDimension = Math.max(room.value.width, room.value.height);
  const transform = `scale(${majorDimension / room.value.width} ${
    majorDimension / room.value.height
  })`;
  return transform;
});
</script>

<template>
  <svg class="cartesian" :viewBox="viewBox" :width="width" :height="height">
    <g>
      <g :transform="transform">
        <!-- floor -->
        <template v-for="[x, y] of positions">
          <rect
            :x="x"
            :y="y"
            width="0.99"
            height="0.99"
            stroke="#333"
            :fill="roomFloorColor"
            stroke-width="0.01"
          ></rect>
        </template>
        <!-- walls -->
        <path
          :d="wallPath"
          :fill="roomWallColor"
          stroke-width="0.1"
          stroke="#666"
        ></path>
        <template v-for="{ x, y, box, button, eyes, roomId, text } of elements">
          <g :transform="`translate(${x}, ${y})`">
            <rect
              v-if="box"
              x="0"
              y="0"
              width="1"
              height="1"
              :fill="box.color"
              stroke="black"
              :stroke-width="0.05"
            ></rect>
            <template v-if="roomId != null && depth > 0">
              <g transform="scale(1, -1) translate(0, -1)">
                <RoomView
                  :room-id="roomId"
                  width="1"
                  height="1"
                  :depth="depth - 1"
                />
              </g>
            </template>
            <rect
              v-if="button"
              x="0.1"
              y="0.1"
              width="0.8"
              height="0.8"
              stroke="#ddd"
              :stroke-width="0.05"
              fill="none"
            ></rect>
            <template v-if="eyes">
              <g
                :fill="button ? '#ddd' : eyes === 'possess' ? 'none' : '#333'"
                :stroke-width="eyes === 'possess' ? '0.02' : '0'"
                stroke="#333"
              >
                <circle cx="0.3" cy="0.6" r="0.1"></circle>
                <circle cx="0.7" cy="0.6" r="0.1"></circle>
              </g>
            </template>
            <template v-if="text">
              <text
                x="0.5"
                y="0.5"
                fill="black"
                font-size="0.7"
                text-anchor="middle"
                alignment-baseline="middle"
              >
                {{ text }}
              </text>
            </template>
          </g>
        </template>
      </g>
    </g>
  </svg>
</template>
