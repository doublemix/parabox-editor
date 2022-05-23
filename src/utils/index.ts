type Func<In, Out> = (_: In) => Out;
export function pipe<X>(x: X): X;
export function pipe<X, A>(x: X, f1: (x: X) => A): A;
export function pipe<X, A, B>(x: X, f1: (x: X) => A, f2: (a: A) => B): B;
export function pipe(init: any, ...fs: Function[]) {
  return fs.reduce((curr, f) => f(curr), init);
}

function pipeWrap<X, A>(f: Func<X, A>): () => (x: X) => A;
function pipeWrap<X, Y, A>(f: (x: X, y: Y) => A): (y: Y) => (x: X) => A;
function pipeWrap(f: Function) {
  return (...args: any[]) =>
    (x: any) =>
      f(x, ...args);
}
pipe.map = pipeWrap(map);

export function range(hi: number): Generator<number, any, undefined>;
export function range(
  lo: number,
  hi: number
): Generator<number, any, undefined>;
export function range(
  lo: number,
  hi: number,
  step: number
): Generator<number, any, undefined>;
export function* range(...args: number[]) {
  let lo = 0,
    hi,
    step = 1;
  if (args.length === 1) {
    [hi] = args;
  } else {
    [lo, hi, step = step] = args;
  }
  let curr = lo;
  while ((hi - curr) / step > 0) {
    yield curr;
    curr += step;
  }
}

export function* map<T, R>(
  iterable: Iterable<T>,
  mapper: (x: T, index: number) => R
) {
  let i = 0;
  for (const x of iterable) {
    yield mapper(x, i);
    i++;
  }
}

export function collect<T>(iterable: Iterable<T>): T[] {
  return Array.from(iterable);
}

export function _throw<T>(err: any): T {
  throw err;
}

export interface IPoint {
  x: number;
  y: number;
}
export function pointEqual(a: IPoint, b: IPoint) {
  return a.x === b.x && a.y === b.y;
}
export function insetShape(points: IPoint[], delta: number) {
  function get(i: number) {
    return points[(i + points.length) % points.length];
  }
  const length = (a: IPoint) => Math.sqrt(a.x * a.x + a.y * a.y);
  const normalize = (a: IPoint) => {
    const aLength = length(a);
    return { x: a.x / aLength, y: a.y / aLength };
  };
  const diff = (a: IPoint, b: IPoint): IPoint => ({
    x: a.x - b.x,
    y: a.y - b.y,
  });
  // const mul = (a: IPoint, k: number): IPoint => ({ x: a.x * k, y: a.y * k });
  const add = (a: IPoint, b: IPoint): IPoint => ({
    x: a.x + b.x,
    y: a.y + b.y,
  });
  const angle = (a: IPoint) => Math.atan2(a.y, a.x);
  const polar = (r: number, theta: number): IPoint => ({
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  });
  return points.map((curr, i) => {
    const prev = get(i - 1);
    const next = get(i + 1);

    const a = normalize(diff(prev, curr));
    const b = normalize(diff(next, curr));

    const aAngle = angle(a);
    const bAngle = angle(b);
    const spanAngle = (aAngle - bAngle) / 2;
    const cAngle = (aAngle + bAngle) / 2;
    // sin(spanAngle) = delta / h
    const h = delta / Math.sin(spanAngle);

    return add(curr, polar(h, cAngle));
  });
}
