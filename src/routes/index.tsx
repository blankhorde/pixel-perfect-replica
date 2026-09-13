import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kweza Market Run — the one-swipe market tray puzzle" },
      {
        name: "description",
        content:
          "Market Run is Kweza's swipe puzzle: one swipe slides every crate at once, crates lock into stalls and become terrain, and beating the swipe budget earns points.",
      },
      { property: "og:title", content: "Kweza Market Run — one-swipe tray puzzle" },
      {
        property: "og:description",
        content:
          "One swipe moves every crate. Lock them all into their stalls under the swipe budget and print your ticket.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen justify-center bg-mk-bg font-mk-body text-mk-ink">
      <main className="w-full max-w-[390px] px-5 pb-14 pt-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-mk-brand">Kweza</p>
        <h1 className="mt-3 font-mk-display text-[34px] font-extrabold leading-[1.05] tracking-tight">
          Market Run.
          <br />
          One swipe, whole tray.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mk-muted">
          One swipe moves every crate at once. Crates that reach their stall lock in and become part
          of the tray. Beating the swipe budget is the flex.
        </p>

        <Link
          to="/market"
          className="mt-8 block overflow-hidden rounded-[22px] border border-mk-line bg-mk-card shadow-[0_14px_34px_-22px_oklch(0.25_0.03_50/0.5)]"
        >
          <div className="relative bg-mk-tray px-5 pb-6 pt-5">
            <div className="grid grid-cols-4 gap-1.5">
              {[
                "p1",
                "tray",
                "slot2",
                "wall",
                "tray",
                "tray",
                "tray",
                "p2",
                "slot1",
                "tray",
                "wall",
                "tray",
                "tray",
                "p3",
                "tray",
                "slot3",
              ].map((k, i) => (
                <div
                  key={i}
                  className={
                    "aspect-square rounded-lg " +
                    (k === "p1"
                      ? "bg-mk-p1"
                      : k === "p2"
                        ? "bg-mk-p2"
                        : k === "p3"
                          ? "bg-mk-p3"
                          : k === "wall"
                            ? "bg-mk-ink/70"
                            : k.startsWith("slot")
                              ? "border-2 border-dashed border-mk-brand/45 bg-mk-card/40"
                              : "bg-mk-tray-deep")
                  }
                />
              ))}
            </div>
          </div>
          <div className="px-5 py-5">
            <h2 className="font-mk-display text-2xl font-extrabold">Morning market tray</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-mk-muted">
              Crates slide, stalls stamp them in, your run prints on a ticket stub.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-mk-brand px-4 py-2.5 text-[14px] font-bold text-mk-card">
              Play Market Run <span aria-hidden>→</span>
            </span>
          </div>
        </Link>

        <p className="mt-8 text-[13px] leading-relaxed text-mk-muted">
          Every solve earns points on one weekly Kweza leaderboard. Winners crowned Sunday, 8 PM.
        </p>
      </main>
    </div>
  );
}
