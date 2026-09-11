import { useCallback, useState } from "react";
import { LEVELS, SESSION_LENGTH, type Level } from "./engine";

export type RunResult = {
  levelIndex: number;
  moves: number;
  par: number;
  points: number;
  perfect: boolean;
  solved: boolean;
};

export function useRun(levels: Level[] = LEVELS, length = SESSION_LENGTH) {
  const ladder = levels.slice(0, length);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RunResult[]>([]);
  const [key, setKey] = useState(0);

  const record = useCallback((r: RunResult) => {
    setResults((prev) => [...prev.filter((p) => p.levelIndex !== r.levelIndex), r]);
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
    setKey((k) => k + 1);
  }, []);

  const retry = useCallback(() => setKey((k) => k + 1), []);

  const restart = useCallback(() => {
    setIndex(0);
    setResults([]);
    setKey((k) => k + 1);
  }, []);

  return {
    ladder,
    index,
    level: ladder[Math.min(index, ladder.length - 1)],
    boardKey: key,
    results,
    points: results.reduce((n, r) => n + r.points, 0),
    solvedCount: results.filter((r) => r.solved).length,
    perfectCount: results.filter((r) => r.perfect).length,
    isLastLevel: index >= ladder.length - 1,
    finished: index >= ladder.length,
    record,
    advance,
    retry,
    restart,
  };
}
