import { pointEqual, range, _throw, type IPoint } from ".";
import { KeyedMap } from "./collections";

export type LevelGuiStyle = "normal" | "grid" | "tui" | "oldstyle";
export type Level = {
  title: string;
  extrude: boolean;
  innerPush: boolean;
  style: LevelGuiStyle;
  customLevelPalette: number; // int
  rooms: Room[];
};

export type Id = string | number; // TODO just string in the future
export type Color = {
  h: number; // Int[0, 360]
  s: number; // Float[0, 1]
  v: number; // Float[0, 1]
};

export type Room = {
  id: Id;
  width: number; // Int
  height: number; // Int
  color: Color;
  isVoidPlane: boolean;
  zoomFactor: number;
  specialEffect: number; // int
  contents: RoomContent[];
};
export type RoomContent = RoomRef | Block | Wall | Floor | InfExit;
export interface RoomRef
  extends IPositioned,
    ICanBePlayer,
    IInfOrder,
    IFlippable {
  type: "room";
  id: Id;

  isClone: boolean;
  infEnterId: Id | null;
}
export interface Block extends IPositioned, ICanBePlayer, IColored {
  type: "block";
}
export interface Wall extends IPositioned, ICanBePlayer {
  type: "wall";
}
export interface InfExit
  extends IPositioned,
    ICanBePlayer,
    IInfOrder,
    IFlippable {
  type: "inf-exit";
  refId: Id;
}
export interface IInfOrder {
  order: number; // integer
}
export type ButtonType = "Button" | "PlayerButton";
export interface Floor extends IPositioned {
  type: "floor";
  buttonType: ButtonType;
}
export interface IColored {
  color: Color;
}
export interface IPositioned {
  x: number;
  y: number;
}
export type PlayerOrderValue = number | "possess" | null;
export interface ICanBePlayer {
  player: PlayerOrderValue;
}
export interface IFlippable {
  flipped: boolean;
}

export function defaultLevel(title: string): Level {
  return {
    title,
    extrude: false,
    innerPush: false,
    style: "normal",
    customLevelPalette: -1,
    rooms: [defaultRoom(0)],
  };
}

export function defaultRoom(id: Id): Room {
  return {
    id,
    width: 5,
    height: 5,
    color: { h: 216, s: 0.8, v: 1.0 },
    isVoidPlane: false,
    zoomFactor: 1.0,
    specialEffect: 0,
    contents: [],
  };
}

export function processWalls(room: Room) {
  type Node = {
    x: number;
    y: number;
    next: Node | null;
  };
  function getNodeKey(node: Node) {
    const { x: x1, y: y1 } = node;
    const { x: x2, y: y2 } = node.next as Node;
    if (x1 === x2) {
      return `x${x1}-${Math.min(y1, y2)}-${Math.max(y1, y2)}`;
    } else {
      return `y${y1}-${Math.min(x1, x2)}-${Math.max(x1, x2)}`;
    }
  }
  const walls = room.contents.filter((x) => x.type === "wall");
  const allNodes = new Set<Node>();
  const nodeMap = new KeyedMap(getNodeKey);
  walls.forEach((wall) => {
    const { x, y } = wall;
    const p1 = { x, y, next: null } as Node;
    const p2 = { x: x + 1, y, next: null } as Node;
    const p3 = { x: x + 1, y: y + 1, next: null } as Node;
    const p4 = { x, y: y + 1, next: null } as Node;
    p1.next = p2;
    p2.next = p3;
    p3.next = p4;
    p4.next = p1;
    allNodes.add(p1);
    allNodes.add(p2);
    allNodes.add(p3);
    allNodes.add(p4);

    for (const p of [p1, p2, p3, p4]) {
      let t;
      if ((t = nodeMap.getByValue(p))) {
        nodeMap.deleteByValue(t);
        [p.next, t.next] = [t.next, p.next];
      } else {
        nodeMap.setByValue(p);
      }
    }
  });

  const pointCycles: IPoint[][] = [];
  while (allNodes.size > 0) {
    const _p = allNodes.values().next();
    if (_p.done) throw new Error("not possible");
    const p = _p.value;
    const cycle: IPoint[] = [p];
    let pp = p;
    allNodes.delete(p);
    while (pp.next !== p) {
      pp = pp.next!;
      allNodes.delete(pp);
      cycle.push(pp);
    }
    const cycleNoDups = cycle.filter((x, i) => {
      return !pointEqual(x, cycle[(i + 1) % cycle.length]);
    });
    if (cycleNoDups.length > 0) {
      pointCycles.push(cycleNoDups);
    }
  }
  return pointCycles;
}

export function expandRoom(
  room: Room,
  expandTop: number,
  expandRight: number,
  expandBottom: number,
  expandLeft: number,
  expandWalls: boolean = true
) {
  const newWidth = room.width + expandLeft + expandRight;
  const newHeight = room.height + expandTop + expandBottom;

  const newContents: RoomContent[] = [];

  for (const x of range(0, newWidth)) {
    for (const y of range(0, newHeight)) {
      let oldX = x - expandLeft;
      let oldY = y - expandBottom;
      let outside =
        oldX < 0 || oldX >= room.width || oldY < 0 || oldY >= room.height;
      oldX = clamp(oldX, 0, room.width - 1);
      oldY = clamp(oldY, 0, room.height - 1);
      const contents = getContent(room, oldX, oldY);
      newContents.push(
        ...contents
          .filter((c: RoomContent) => {
            // only walls should be expanded
            return !outside || (expandWalls && c.type === "wall");
          })
          .map((c: RoomContent): RoomContent => ({ ...c, x, y }))
      );
    }
  }

  room.width = newWidth;
  room.height = newHeight;
  room.contents = newContents;
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

export function getContent(room: Room, x: number, y: number): RoomContent[] {
  const contents = room.contents.filter((c) => c.x === x && c.y === y);
  return contents;
}

export function removeInLevel(
  level: Level,
  pred: SpliceIfPredicate<RoomContent>
) {
  level.rooms.forEach((room) => {
    spliceIf(room.contents, (...args) => pred(...args));
  });
}
type SpliceIfPredicate<T> = (x: T, i: number, array: T[]) => boolean;
function spliceIf<T>(array: T[], pred: SpliceIfPredicate<T>) {
  let i = 0;
  while (i < array.length) {
    if (pred(array[i], i, array)) {
      array.splice(i, 1);
    } else {
      i++;
    }
  }
}
