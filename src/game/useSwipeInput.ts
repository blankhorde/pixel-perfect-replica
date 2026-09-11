import { useEffect, useRef } from "react";
import type { Dir } from "./engine";

/**
 * One-thumb swipe input for the board, plus arrow keys for desktop review.
 */
export function useSwipeInput(onSwipe: (dir: Dir) => void, enabled = true) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const handler = useRef(onSwipe);
  handler.current = onSwipe;

  useEffect(() => {
    if (!enabled) return;
    const keys: Record<string, Dir> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const dir = keys[e.key];
      if (!dir) return;
      e.preventDefault();
      handler.current(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  const bind = {
    onPointerDown: (e: React.PointerEvent) => {
      if (!enabled) return;
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!enabled || !start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
      handler.current(
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up",
      );
    },
    onPointerCancel: () => {
      start.current = null;
    },
    style: { touchAction: "none" as const },
  };

  return bind;
}
