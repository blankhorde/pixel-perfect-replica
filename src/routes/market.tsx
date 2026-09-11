import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TUTORIAL_LEVELS, budgetFor, cellX, cellY, scoreFor, type Level } from "@/game/engine";
import { useRun } from "@/game/useRun";
import { useSwipeInput } from "@/game/useSwipeInput";
import { useTiltGame } from "@/game/useTiltGame";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Market Run — Kweza tilt puzzle" },
      {
        name: "description",
        content:
          "Market Run: one swipe slides every crate on the tray. Land each crate in its stall, beat the swipe budget, earn points on this week's Kweza board.",
      },
      { property: "og:title", content: "Market Run — Kweza tilt puzzle" },
      {
        property: "og:description",
        content:
          "A warm Lagos market tray. One swipe moves everything, crates lock into stalls and become terrain, best-possible is the flex.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketRun,
});

const PIECE_BG = ["bg-mk-p1", "bg-mk-p2", "bg-mk-p3", "bg-mk-p4"];
const PIECE_BORDER = ["border-mk-p1", "border-mk-p2", "border-mk-p3", "border-mk-p4"];
const PIECE_TEXT = ["text-mk-p1", "text-mk-p2", "text-mk-p3", "text-mk-p4"];
const GOODS = ["Tomatoes", "Ugu", "Peppers", "Palm oil"];

function Glyph({ shape, className }: { shape: number; className?: string }) {
  const paths = [
    <circle key="a" cx="12" cy="12" r="7" />,
    <path key="b" d="M12 4 L20 19 H4 Z" />,
    <rect key="c" x="5" y="5" width="14" height="14" rx="2.5" />,
    <path key="d" d="M12 3.5 L20 8 V16 L12 20.5 L4 16 V8 Z" />,
  ];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {paths[shape % 4]}
    </svg>
  );
}

function Tray({
  level,
  positions,
  locked,
  flash,
  shake,
  hint,
  bind,
}: {
  level: Level;
  positions: number[];
  locked: boolean[];
  flash: number[];
  shake: number;
  hint?: boolean;
  bind: ReturnType<typeof useSwipeInput>;
}) {
  const cells = Array.from({ length: level.w * level.h }, (_, i) => i);
  const slotOf = new Map(level.pieces.map((p, i) => [p.slot, i]));
  return (
    <div
      {...bind}
      key={shake}
      className={
        "relative select-none rounded-[20px] border-4 border-mk-tray-deep bg-mk-tray p-2 shadow-[inset_0_2px_0_oklch(1_0_0/0.6),0_18px_34px_-24px_oklch(0.25_0.03_50/0.7)] " +
        (shake < 0 ? "kw-shake" : "")
      }
    >
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${level.w}, minmax(0, 1fr))` }}
      >
        {cells.map((c) => {
          const isWall = level.walls.includes(c);
          const slotIdx = slotOf.get(c);
          return (
            <div
              key={c}
              className={
                "aspect-square rounded-lg " +
                (isWall
                  ? "bg-mk-ink/80 shadow-[inset_0_-3px_0_oklch(0_0_0/0.25)]"
                  : slotIdx !== undefined
                    ? `border-2 border-dashed bg-mk-card/50 ${PIECE_BORDER[slotIdx % 4]}`
                    : "bg-mk-tray-deep/70")
              }
            >
              {slotIdx !== undefined && (
                <div className="flex h-full w-full items-center justify-center p-[22%]">
                  <Glyph
                    shape={slotIdx}
                    className={`h-full w-full opacity-30 ${PIECE_TEXT[slotIdx % 4]}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {level.pieces.map((p, i) => {
        const x = cellX(level, positions[i]);
        const y = cellY(level, positions[i]);
        return (
          <div
            key={p.id}
            className="pointer-events-none absolute p-1.5 transition-all duration-200 ease-out"
            style={{
              left: `calc(0.5rem + ${x} * ((100% - 1rem) / ${level.w}))`,
              top: `calc(0.5rem + ${y} * ((100% - 1rem) / ${level.h}))`,
              width: `calc((100% - 1rem) / ${level.w})`,
              height: `calc((100% - 1rem) / ${level.h})`,
            }}
          >
            <div
              className={
                "relative flex h-full w-full items-center justify-center rounded-lg " +
                PIECE_BG[i % 4] +
                (locked[i]
                  ? " ring-[3px] ring-mk-gold shadow-[inset_0_-4px_0_oklch(0_0_0/0.22)]"
                  : " shadow-[0_5px_0_oklch(0_0_0/0.18),0_10px_16px_-8px_oklch(0.25_0.03_50/0.6)]") +
                (flash.includes(i) ? " kw-lock" : "")
              }
            >
              <Glyph shape={i} className="h-1/2 w-1/2 text-mk-card" />
              {locked[i] && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-mk-gold text-[11px] font-black text-mk-ink">
                  ✓
                </span>
              )}
            </div>
          </div>
        );
      })}

      {hint && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="kw-thumb flex flex-col items-center gap-1">
            <span className="rounded-full bg-mk-ink px-3 py-1.5 text-[12px] font-bold text-mk-card">
              Swipe
            </span>
            <span className="text-2xl text-mk-ink">↓</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Stub({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[16px] border border-mk-line bg-mk-card px-4 py-3">
      <span className="absolute -left-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-mk-bg" />
      <span className="absolute -right-[7px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-mk-bg" />
      {children}
    </div>
  );
}

function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-mk-ink/45 px-4 pb-6">
      <div className="kw-rise w-full max-w-[358px] rounded-[24px] border border-mk-line bg-mk-card p-5">
        {children}
      </div>
    </div>
  );
}

function Btn({
  onClick,
  children,
  tone = "solid",
}: {
  onClick: () => void;
  children: React.ReactNode;
  tone?: "solid" | "ghost";
}) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full rounded-xl px-4 py-3.5 text-[15px] font-extrabold transition-transform active:scale-[0.98] " +
        (tone === "solid"
          ? "bg-mk-brand text-mk-card shadow-[0_4px_0_var(--mk-brand-deep)]"
          : "border border-mk-line bg-mk-card text-mk-ink")
      }
    >
      {children}
    </button>
  );
}

/* ---------------------------------- board ---------------------------------- */

function Board({
  level,
  boardLabel,
  points,
  onSolved,
  onGiveUp,
  onSkip,
  isLast,
  onNext,
  coach,
}: {
  level: Level;
  boardLabel: string;
  points?: number;
  onSolved?: (moves: number) => void;
  onGiveUp?: () => void;
  onSkip?: () => void;
  isLast?: boolean;
  onNext?: () => void;
  coach?: { title: string; body: string; cta: string };
}) {
  const game = useTiltGame(level, coach ? { budget: budgetFor(level) + 6 } : undefined);
  const bind = useSwipeInput(game.swipe, game.status === "playing");
  const [flash, setFlash] = useState<number[]>([]);
  const [toast, setToast] = useState<{ text: string; tone: "good" | "warn" } | null>(null);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    const e = game.event;
    if (e.kind === "wasted") {
      setShake((s) => (s <= 0 ? 1 : -s));
      setToast({ text: "Nothing shifted — that swipe is free. Try another edge.", tone: "warn" });
      return;
    }
    if (e.lockedIds?.length) {
      setFlash(e.lockedIds);
      setToast({
        text: `${GOODS[e.lockedIds[0] % 4]} landed. That crate is a wall now.`,
        tone: "good",
      });
      const t = setTimeout(() => setFlash([]), 420);
      return () => clearTimeout(t);
    }
    if (e.kind === "moved" && game.movesLeft === 1) {
      setToast({ text: "One swipe left. Make it count.", tone: "warn" });
    }
  }, [game.event, game.movesLeft]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const score = scoreFor(level, game.moves);

  return (
    <div className="relative">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mk-brand">
          {boardLabel}
        </p>
        {points !== undefined && (
          <p className="text-[13px] font-bold text-mk-muted">
            {points.toLocaleString()} <span className="font-medium">pts</span>
          </p>
        )}
      </div>

      {coach ? (
        <div className="mt-3 rounded-[16px] border border-mk-gold/60 bg-mk-gold/15 px-4 py-3">
          <p className="font-mk-display text-[17px] font-extrabold">{coach.title}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-mk-muted">{coach.body}</p>
        </div>
      ) : (
        <Stub>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mk-muted">
                Swipes left
              </p>
              <p
                className={
                  "font-mk-display text-[30px] font-extrabold leading-none " +
                  (game.movesLeft <= 1 ? "text-mk-p3" : "text-mk-ink")
                }
              >
                {game.movesLeft}
              </p>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: game.budget }, (_, i) => (
                <span
                  key={i}
                  className={
                    "h-7 w-2 rounded-full " +
                    (i < game.movesLeft
                      ? i >= level.par
                        ? "bg-mk-gold/50"
                        : "bg-mk-brand"
                      : "bg-mk-line")
                  }
                />
              ))}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mk-muted">
                Best possible
              </p>
              <p className="font-mk-display text-[30px] font-extrabold leading-none text-mk-gold">
                {level.par}
              </p>
            </div>
          </div>
        </Stub>
      )}

      <div className="mt-4">
        <Tray
          level={level}
          positions={game.positions}
          locked={game.locked}
          flash={flash}
          shake={shake}
          hint={game.moves === 0 && game.status === "playing"}
          bind={bind}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-mk-muted">
          {game.lockedTotal}/{level.pieces.length} stalls filled
        </p>
        <div className="flex gap-2">
          <button
            onClick={game.undo}
            disabled={!game.canUndo}
            className="rounded-xl border border-mk-line bg-mk-card px-4 py-2 text-[13px] font-bold disabled:opacity-40"
          >
            ↶ Undo
          </button>
          <button
            onClick={game.reset}
            className="rounded-xl border border-mk-line bg-mk-card px-4 py-2 text-[13px] font-bold"
          >
            Reset
          </button>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center px-6">
          <p
            className={
              "kw-rise rounded-full px-4 py-2.5 text-center text-[13px] font-bold " +
              (toast.tone === "good"
                ? "bg-mk-green text-mk-card"
                : "bg-mk-ink text-mk-card")
            }
          >
            {toast.text}
          </p>
        </div>
      )}

      {game.status === "solved" && (
        <Sheet>
          {coach ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mk-green">
                Got it
              </p>
              <h2 className="mt-1 font-mk-display text-[24px] font-extrabold">{coach.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-mk-muted">{coach.body}</p>
              <div className="mt-5">
                <Btn onClick={() => onNext?.()}>{coach.cta}</Btn>
              </div>
            </>
          ) : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mk-brand">
                {score.perfect ? "Best possible" : "Board cleared"}
              </p>
              <h2 className="mt-1 font-mk-display text-[26px] font-extrabold leading-tight">
                {score.perfect
                  ? "Nothing wasted. Clean run."
                  : `Tray cleared in ${game.moves} swipes.`}
              </h2>
              <div className="mt-4 space-y-2 rounded-[16px] bg-mk-bg p-4 text-[14px]">
                <Row label="Board cleared" value={`+${score.base}`} />
                <Row label={`Swipes spared (${game.budget - game.moves})`} value={`+${score.spare}`} />
                {score.perfect && <Row label="Best-possible bonus" value={`+${score.perfectBonus}`} />}
                <div className="mt-1 flex justify-between border-t border-mk-line pt-2 font-mk-display text-[19px] font-extrabold">
                  <span>To the weekly board</span>
                  <span className="text-mk-brand">+{score.total}</span>
                </div>
              </div>
              <div className="mt-5">
                <Btn onClick={() => onSolved?.(game.moves)}>
                  {isLast ? "See your run" : "Next board →"}
                </Btn>
              </div>
            </>
          )}
        </Sheet>
      )}

      {game.status === "stuck" && (
        <Sheet>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mk-p3">
            Out of swipes
          </p>
          <h2 className="mt-1 font-mk-display text-[26px] font-extrabold leading-tight">
            The tray jammed.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-mk-muted">
            {game.lockedTotal > 0
              ? "A crate locked early and boxed the rest in. Undo a step, or start the tray fresh and change your first swipe."
              : "Change your opening swipe — the first direction decides everything after it."}
          </p>
          <div className="mt-5 space-y-2.5">
            <Btn
              onClick={() => {
                game.reset();
                onGiveUp?.();
              }}
            >
              Run this tray again
            </Btn>
            {game.canUndo && (
              <Btn tone="ghost" onClick={game.undo}>
                ↶ Take back that swipe
              </Btn>
            )}
            {onSkip && (
              <Btn tone="ghost" onClick={onSkip}>
                Skip to the next board
              </Btn>
            )}
          </div>
        </Sheet>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-mk-muted">
      <span>{label}</span>
      <span className="font-bold text-mk-ink">{value}</span>
    </div>
  );
}

/* --------------------------------- screens --------------------------------- */

function MarketRun() {
  const run = useRun();
  const [screen, setScreen] = useState<"entry" | "learn" | "play" | "done">("entry");
  const [step, setStep] = useState(0);

  return (
    <div className="flex min-h-screen justify-center bg-mk-bg font-mk-body text-mk-ink">
      <main className="w-full max-w-[390px] px-5 pb-16 pt-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-[13px] font-bold text-mk-muted">
            ← Kweza games
          </Link>
          {screen === "play" && (
            <button
              onClick={() => {
                setStep(0);
                setScreen("learn");
              }}
              className="rounded-full border border-mk-line bg-mk-card px-3 py-1.5 text-[12px] font-bold"
            >
              How to play
            </button>
          )}
        </div>

        {screen === "entry" && (
          <div className="kw-rise mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-mk-brand">
              Game 01 · Market Run
            </p>
            <h1 className="mt-2 font-mk-display text-[40px] font-extrabold leading-[0.98] tracking-tight">
              One swipe
              <br />
              moves the
              <br />
              whole market.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-mk-muted">
              Every crate on the tray slides at once. Land each one in its own stall — the moment it
              lands, it becomes part of the market and blocks everything else.
            </p>

            <div className="mt-6 rounded-[20px] border border-dashed border-mk-line bg-mk-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mk-muted">
                    Tonight&rsquo;s run
                  </p>
                  <p className="font-mk-display text-[22px] font-extrabold">4 trays, back to back</p>
                </div>
                <span className="rounded-full bg-mk-gold/25 px-3 py-1 text-[12px] font-bold text-mk-ink">
                  ~3 min
                </span>
              </div>
              <div className="my-4 border-t border-dashed border-mk-line" />
              <p className="text-[13.5px] leading-relaxed text-mk-muted">
                Each tray you clear adds points to this week&rsquo;s Kweza leaderboard. Cleaner
                solves are worth more. Positions are settled Sunday, 8 PM — cash paid to your bank.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <Btn onClick={() => setScreen("play")}>Start the run</Btn>
              <Btn
                tone="ghost"
                onClick={() => {
                  setStep(0);
                  setScreen("learn");
                }}
              >
                Show me how it works
              </Btn>
            </div>
          </div>
        )}

        {screen === "learn" && (
          <div className="mt-5">
            <div className="mb-4 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={
                    "h-1.5 flex-1 rounded-full " + (i <= step ? "bg-mk-brand" : "bg-mk-line")
                  }
                />
              ))}
            </div>
            {step === 0 && (
              <Board
                key="coach-0"
                level={TUTORIAL_LEVELS[0]}
                boardLabel="Learn · 1 of 3"
                coach={{
                  title: "Swipe anywhere on the tray.",
                  body: "You don't drag one crate — you tilt the whole tray. Everything slides until it hits an edge, a rock, or another crate. Get this crate into the matching stall.",
                  cta: "Next: crates that stick",
                }}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <Board
                key="coach-1"
                level={TUTORIAL_LEVELS[1]}
                boardLabel="Learn · 2 of 3"
                coach={{
                  title: "A landed crate turns into a wall.",
                  body: "Once a crate sits in its own stall it locks for good — and now it blocks the others. Land the wrong one first and you box yourself in. Order is the real puzzle.",
                  cta: "Next: the swipe budget",
                }}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <div className="kw-rise">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mk-brand">
                  Learn · 3 of 3
                </p>
                <h2 className="mt-2 font-mk-display text-[28px] font-extrabold leading-tight">
                  Every tray has a best possible.
                </h2>
                <div className="mt-4 space-y-3">
                  <Stub>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mk-muted">
                      Swipes left
                    </p>
                    <p className="font-mk-display text-[28px] font-extrabold leading-none">7</p>
                    <p className="mt-1 text-[13px] text-mk-muted">
                      Your budget. Run dry and the tray is over — reset and go again.
                    </p>
                  </Stub>
                  <Stub>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mk-muted">
                      Best possible
                    </p>
                    <p className="font-mk-display text-[28px] font-extrabold leading-none text-mk-gold">
                      4
                    </p>
                    <p className="mt-1 text-[13px] text-mk-muted">
                      The fewest swipes that can clear it. Match it and your points jump by half
                      again.
                    </p>
                  </Stub>
                </div>
                <p className="mt-4 text-[14px] leading-relaxed text-mk-muted">
                  Undo is always there, so experiment freely. Nothing you learn on a tray is wasted —
                  the same shapes come back all week.
                </p>
                <div className="mt-5">
                  <Btn
                    onClick={() => {
                      run.restart();
                      setScreen("play");
                    }}
                  >
                    I&rsquo;m ready — start the run
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === "play" && (
          <div className="mt-4">
            <Board
              key={`play-${run.boardKey}`}
              level={run.level}
              boardLabel={`Tray ${Math.min(run.index + 1, run.ladder.length)} of ${run.ladder.length}`}
              points={run.points}
              isLast={run.isLastLevel}
              onSolved={(moves) => {
                const s = scoreFor(run.level, moves);
                run.record({
                  levelIndex: run.index,
                  moves,
                  par: run.level.par,
                  points: s.total,
                  perfect: s.perfect,
                  solved: true,
                });
                if (run.isLastLevel) setScreen("done");
                else run.advance();
              }}
              onGiveUp={() => run.retry()}
              onSkip={() => {
                run.record({
                  levelIndex: run.index,
                  moves: 0,
                  par: run.level.par,
                  points: 0,
                  perfect: false,
                  solved: false,
                });
                if (run.isLastLevel) setScreen("done");
                else run.advance();
              }}
            />
          </div>
        )}

        {screen === "done" && (
          <div className="kw-rise mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-mk-brand">
              Run complete
            </p>
            <h1 className="mt-2 font-mk-display text-[34px] font-extrabold leading-[1.02]">
              Market closed.
              <br />
              Points banked.
            </h1>

            <div className="mt-6 overflow-hidden rounded-[20px] border border-mk-line bg-mk-card">
              <div className="bg-mk-ink px-5 py-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mk-gold">
                  Points to the weekly board
                </p>
                <p className="mt-1 font-mk-display text-[52px] font-extrabold leading-none text-mk-card">
                  +{run.points.toLocaleString()}
                </p>
              </div>
              <div className="relative border-t border-dashed border-mk-line">
                <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-mk-bg" />
                <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-mk-bg" />
              </div>
              <div className="space-y-3 px-5 py-5">
                {run.ladder.map((l, i) => {
                  const r = run.results.find((x) => x.levelIndex === i);
                  return (
                    <div key={i} className="flex items-center justify-between text-[14px]">
                      <span className="font-semibold">
                        Tray {i + 1}{" "}
                        <span className="text-mk-muted">
                          · best possible {l.par}
                        </span>
                      </span>
                      <span
                        className={
                          "font-bold " +
                          (!r?.solved ? "text-mk-muted" : r.perfect ? "text-mk-gold" : "text-mk-ink")
                        }
                      >
                        {!r?.solved
                          ? "jammed"
                          : r.perfect
                            ? `${r.moves} swipes · best`
                            : `${r.moves} swipes`}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-mk-line pt-3 text-[13.5px] leading-relaxed text-mk-muted">
                  {run.perfectCount > 0
                    ? `${run.perfectCount} tray${run.perfectCount > 1 ? "s" : ""} cleared at best possible. That's the part that separates the top of the board.`
                    : "Nobody clears every tray at best possible on the first run. Same shapes come back — try again and shave your swipes."}
                </div>
              </div>
            </div>

            <p className="mt-5 text-[14px] leading-relaxed text-mk-muted">
              Your points are on this week&rsquo;s board now. Positions settle Sunday, 8 PM, and top
              positions are paid straight to your bank.
            </p>

            <div className="mt-5 space-y-2.5">
              <Btn
                onClick={() => {
                  run.restart();
                  setScreen("play");
                }}
              >
                Run it back
              </Btn>
              <Link
                to="/"
                className="block w-full rounded-xl border border-mk-line bg-mk-card px-4 py-3.5 text-center text-[15px] font-extrabold"
              >
                Back to games
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
