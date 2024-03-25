import type { Id, RoomRef, VoidPlane } from "@/utils/levels";

export type ToolType =
  | "select"
  | "floor"
  | "wall"
  | "room"
  | "box"
  | "player"
  | "button"
  | "player-button"
  | "clone"
  | "inf-exit";

export type Tool = {
  toolId: ToolType;
  name: string;
};

export type State = {
  room: Id;
  roomSelect: null | RoomSelectState;
  // TODO use guids or something for ids
  nextRoomId: number;
};

export type RoomSelectState =
  | {
      type: "void-plane";
      target: VoidPlane;
    }
  | {
      type: "inf-enter";
      target: RoomRef;
    }
  | {
      type: "room" | "clone" | "inf-exit";
      x: number;
      y: number;
      targetId: Id;
    };
