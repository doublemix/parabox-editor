import type { Level, Color, PlayerOrderValue, RoomRef, Id } from "@/utils/levels";

class Writer {
  output: string;
  lineEnding: string;
  indentWith: string;
  indents: string[];
  lineStart: boolean;

  constructor() {
    this.output = "";
    this.lineEnding = "\n";
    this.indentWith = "\t";

    this.indents = [];
    this.lineStart = true;
  }

  write(x: string) {
    this.ensureIndent();
    this.lineStart = false;
    this.output += x;
  }
  writeLine(x: string) {
    this.write(x);
    this.endLine();
  }
  getIndent() {
    return this.indents.join("");
  }
  ensureIndent() {
    if (this.lineStart) {
      this.output += this.getIndent();
      this.lineStart = false;
    }
  }
  endLine() {
    this.output += this.lineEnding;
    this.lineStart = true;
  }
  indented(indentWith: string, cb: () => void): void;
  indented(cb: () => void): void;
  indented(...args: any[]) {
    let indentWith: string | null = null;
    let cb: () => void;
    if (args.length >= 2) {
      indentWith = args[0];
      cb = args[1];
    } else {
      cb = args[0];
    }
    this.indents.push(indentWith ?? this.indentWith);
    cb();
    this.indents.pop();
  }
}

export function levelToFile(level: Level) {
  function b(value: boolean) {
    return value ? "1" : "0";
  }
  function color(value: Color) {
    return `${value.h / 360} ${value.s} ${value.v}`;
  }
  function player(value: PlayerOrderValue) {
    return `${b(typeof value === "number")} ${b(value != null)} ${
      typeof value === "number" ? value : "0"
    }`;
  }
  const file = new Writer();
  file.writeLine("version 4");
  if (level.extrude) {
    file.writeLine("shed 1");
  }
  if (level.innerPush) {
    file.writeLine("inner_push 1");
  }
  if (level.style !== "normal") {
    file.writeLine("draw_style " + level.style);
  }
  if (level.customLevelPalette >= 0) {
    file.writeLine(`custom_level_palette ${level.customLevelPalette}`);
  }
  file.writeLine("#");
  function infEnter(infEnterId: Id | null, order: number) {
    return infEnterId != null
      ? `1 ${order} ${roomToId.get(idToRoom.get(infEnterId))}`
      : `0 0 0`;
  }
  const idToRoom = new Map();
  const roomToId = new Map();
  let currentRoomId = 1;
  level.rooms.forEach((x) => {
    idToRoom.set(x.id, x);
    roomToId.set(x, currentRoomId++);
  });

  level.rooms.forEach((room) => {
    const roomId = roomToId.get(room);
    file.writeLine(
      `Block -1 -1 ${roomId} ${room.width} ${room.height} ${color(
        room.color
      )} ${room.zoomFactor} 0 0 0 0 0 1 ${room.specialEffect}`
    );
    file.indented(() => {
      //
      if (room.voidPlane !== null) {
        const { infEnterId, order } = room.voidPlane
        file.writeLine(`Ref -1 -1 ${roomId} 1 0 0 ${infEnter(infEnterId, order)} 0 0 0 0 1 0`);
      }
      room.contents.forEach((x) => {
        if (x.type === "wall") {
          file.writeLine(`Wall ${x.x} ${x.y} ${player(x.player)}`);
        }
        if (x.type === "floor") {
          file.writeLine(`Floor ${x.x} ${x.y} ${x.buttonType}`);
        }
        if (x.type === "block") {
          file.writeLine(
            `Block ${x.x} ${x.y} ${currentRoomId++} 1 1 ${color(
              x.color
            )} 1 1 ${player(x.player)} 0 0 0`
          );
        }
        if (x.type === "room") {
          const targetRoomId = roomToId.get(idToRoom.get(x.id));
          file.writeLine(
            `Ref ${x.x} ${x.y} ${targetRoomId} ${b(
              !(x.isClone ?? false)
            )} 0 0 ${infEnter(x.infEnterId, x.order)} ${player(x.player)} ${b(x.flipped)} 0 0`
          );
        }
        if (x.type === "inf-exit") {
          const targetRoomId = roomToId.get(idToRoom.get(x.refId));
          file.writeLine(
            `Ref ${x.x} ${x.y} ${targetRoomId} 0 1 ${x.order} 0 0 0 ${player(
              x.player
            )} ${b(x.flipped)} 0 0`
          );
        }
      });
    });
  });
  return file.output;
}
