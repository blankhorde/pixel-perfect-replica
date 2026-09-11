import { useCallback, useMemo, useRef, useState } from "react";
import {
  budgetFor,
  isSolved,
  lockedCount,
  scoreFor,
  startPositions,
  tilt,
  type Dir,
  type Level,
} from "./engine";

export type GameEvent = {
  seq: number;
  kind: "locked" | "wasted" | "moved" | "solved" | "stuck" | "undo" | "reset";
  dir?: Dir;
  lockedIds?: number[];
};

export type GameStatus = "playing" | "solved" | "stuck";

export function useTiltGame(level: Level, opts?: { budget?: number }) {
  const budget = opts?.budget ?? budgetFor(level);
  const [positions, setPositions] = useState(() => startPositions(level));
  const [history, setHistory] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [event, setEvent] = useState<GameEvent>({ seq: 0, kind: "reset" });
  const seq = useRef(0);

  const fire = useCallback((e: Omit<GameEvent, "seq">) => {
    seq.current += 1;
    setEvent({ ...e, seq: seq.current });
  }, []);

  const swipe = useCallback(
    (dir: Dir) => {
      if (status !== "playing") return;
      const next = tilt(level, positions, dir);
      if (next.every((c, i) => c === positions[i])) {
        fire({ kind: "wasted", dir });
        return;
      }
      const newlyLocked = level.pieces
        .map((p, i) => (next[i] === p.slot && positions[i] !== p.slot ? i : -1))
        .filter((i) => i >= 0);
      const usedMoves = moves + 1;
      setHistory((h) => [...h, positions]);
      setPositions(next);
      setMoves(usedMoves);

      if (isSolved(level, next)) {
        setStatus("solved");
        fire({ kind: "solved", dir, lockedIds: newlyLocked });
        return;
      }
      if (usedMoves >= budget) {
        setStatus("stuck");
        fire({ kind: "stuck", dir, lockedIds: newlyLocked });
        return;
      }
      fire({ kind: newlyLocked.length ? "locked" : "moved", dir, lockedIds: newlyLocked });
    },
    [budget, fire, level, moves, positions, status],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      setPositions(h[h.length - 1]);
      setMoves((m) => Math.max(0, m - 1));
      setStatus("playing");
      fire({ kind: "undo" });
      return h.slice(0, -1);
    });
  }, [fire]);

  const reset = useCallback(() => {
    setPositions(startPositions(level));
    setHistory([]);
    setMoves(0);
    setStatus("playing");
    fire({ kind: "reset" });
  }, [fire, level]);

  const locked = useMemo(
    () => level.pieces.map((p, i) => positions[i] === p.slot),
    [level, positions],
  );

  return {
    positions,
    locked,
    lockedTotal: lockedCount(level, positions),
    moves,
    budget,
    movesLeft: budget - moves,
    par: level.par,
    status,
    event,
    canUndo: history.length > 0,
    swipe,
    undo,
    reset,
    score: scoreFor(level, moves),
  };
}
