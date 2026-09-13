export type Dir = "up" | "down" | "left" | "right";

export const DIR_VECTORS: Record<Dir, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export type LevelPiece = { id: number; start: number; slot: number };

export type Level = {
  w: number;
  h: number;
  walls: number[];
  pieces: LevelPiece[];
  par: number;
};

export const cellX = (level: Level, cell: number) => cell % level.w;
export const cellY = (level: Level, cell: number) => Math.floor(cell / level.w);

/** A piece is locked exactly when it rests on its own slot. */
export const isLocked = (level: Level, positions: number[], i: number) =>
  positions[i] === level.pieces[i]?.slot;

export function startPositions(level: Level) {
  return level.pieces.map((p) => p.start);
}

/** One swipe: every loose piece slides until something stops it. */
export function tilt(level: Level, positions: number[], dir: Dir): number[] {
  const [dx, dy] = DIR_VECTORS[dir];
  const { w, h } = level;
  const order = positions.map((_, i) => i).sort((a, b) => {
    const ax = cellX(level, positions[a]!);
    const ay = cellY(level, positions[a]!);
    const bx = cellX(level, positions[b]!);
    const by = cellY(level, positions[b]!);
    return bx * dx + by * dy - (ax * dx + ay * dy);
  });

  const occupied = new Set<number>([...level.walls, ...positions]);
  const next = positions.slice();

  for (const i of order) {
    if (isLocked(level, positions, i)) continue; // locked pieces are terrain
    let cur = next[i]!;
    occupied.delete(cur);
    for (;;) {
      const nx = cellX(level, cur) + dx;
      const ny = cellY(level, cur) + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) break;
      const candidate = ny * w + nx;
      if (occupied.has(candidate)) break;
      cur = candidate;
    }
    occupied.add(cur);
    next[i] = cur;
  }


  return next;
}

export const isSolved = (level: Level, positions: number[]) =>
  level.pieces.every((p, i) => positions[i] === p.slot);

export const lockedCount = (level: Level, positions: number[]) =>
  level.pieces.reduce((n, p, i) => (positions[i] === p.slot ? n + 1 : n), 0);

/** Extra swipes a player gets on top of the best-possible count. */
export const SLACK = 3;
export const budgetFor = (level: Level) => level.par + SLACK;

export function scoreFor(level: Level, movesUsed: number) {
  const base = 100 + level.par * 25;
  const perfect = movesUsed <= level.par;
  const spare = Math.max(0, budgetFor(level) - movesUsed);
  return {
    base,
    spare: spare * 15,
    perfectBonus: perfect ? Math.round(base * 0.5) : 0,
    perfect,
    get total() {
      return this.base + this.spare + this.perfectBonus;
    },
  };
}

/** Two coached boards used by the learn-it flow. */
export const TUTORIAL_LEVELS: Level[] = [
  { w: 4, h: 4, walls: [], pieces: [{ id: 0, start: 0, slot: 15 }], par: 2 },
  {
    w: 4,
    h: 4,
    walls: [5],
    pieces: [
      { id: 0, start: 12, slot: 15 },
      { id: 1, start: 0, slot: 12 },
    ],
    par: 3,
  },
];

/** Session ladder — verified solvable, par = best possible. */
export const LEVELS: Level[] = [
  {
    w: 4,
    h: 4,
    walls: [4],
    pieces: [
      { id: 0, start: 7, slot: 0 },
      { id: 1, start: 1, slot: 13 },
    ],
    par: 3,
  },
  {
    w: 4,
    h: 4,
    walls: [9, 12],
    pieces: [
      { id: 0, start: 3, slot: 15 },
      { id: 1, start: 8, slot: 4 },
    ],
    par: 4,
  },
  {
    w: 5,
    h: 5,
    walls: [0, 15],
    pieces: [
      { id: 0, start: 18, slot: 20 },
      { id: 1, start: 12, slot: 9 },
      { id: 2, start: 13, slot: 21 },
    ],
    par: 6,
  },
  {
    w: 5,
    h: 5,
    walls: [10, 6, 5],
    pieces: [
      { id: 0, start: 13, slot: 3 },
      { id: 1, start: 24, slot: 2 },
      { id: 2, start: 12, slot: 22 },
    ],
    par: 6,
  },
  {
    w: 5,
    h: 5,
    walls: [5, 21, 10],
    pieces: [
      { id: 0, start: 16, slot: 0 },
      { id: 1, start: 2, slot: 18 },
      { id: 2, start: 17, slot: 19 },
      { id: 3, start: 4, slot: 22 },
    ],
    par: 7,
  },
  {
    w: 6,
    h: 6,
    walls: [11, 30, 33, 12],
    pieces: [
      { id: 0, start: 3, slot: 4 },
      { id: 1, start: 27, slot: 35 },
      { id: 2, start: 24, slot: 5 },
      { id: 3, start: 25, slot: 31 },
    ],
    par: 8,
  },
];

export const SESSION_LENGTH = 4;
