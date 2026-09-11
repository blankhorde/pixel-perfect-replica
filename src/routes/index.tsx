import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kweza Tilt — two design directions for the swipe puzzle" },
      {
        name: "description",
        content:
          "Pick a world for Kweza's tilt puzzle: Market Run, a warm Lagos market tray, or Voltage, a night power grid. Both fully playable at mobile width.",
      },
      { property: "og:title", content: "Kweza Tilt — two design directions" },
      {
        property: "og:description",
        content:
          "Two playable identities for the same one-swipe-moves-everything puzzle. Market Run and Voltage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Picker,
});

function Picker() {
  return (
    <div className="flex min-h-screen justify-center bg-mk-bg font-mk-body text-mk-ink">
      <main className="w-full max-w-[390px] px-5 pb-14 pt-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-mk-brand">Kweza</p>
        <h1 className="mt-3 font-mk-display text-[34px] font-extrabold leading-[1.05] tracking-tight">
          The tilt puzzle,
          <br />
          two worlds.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mk-muted">
          Same mechanic in both: one swipe moves every piece at once, pieces lock home and become
          terrain, and beating the move budget is the flex. Pick a world and play a full run.
        </p>

        <div className="mt-8 space-y-5">
          <Link
            to="/market"
            className="block overflow-hidden rounded-[22px] border border-mk-line bg-mk-card shadow-[0_14px_34px_-22px_oklch(0.25_0.03_50/0.5)]"
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
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mk-brand">
                Direction one
              </p>
              <h2 className="mt-1.5 font-mk-display text-2xl font-extrabold">Market Run</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-mk-muted">
                Morning market tray. Crates slide, stalls stamp them in, your run prints on a ticket
                stub.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-mk-brand px-4 py-2.5 text-[14px] font-bold text-mk-card">
                Play Market Run <span aria-hidden>→</span>
              </span>
            </div>
          </Link>

          <Link
            to="/voltage"
            className="block overflow-hidden rounded-[10px] border border-vt-line bg-vt-bg"
          >
            <div className="relative px-5 pb-6 pt-5">
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  "cell",
                  "grid",
                  "dead",
                  "sock2",
                  "grid",
                  "sock1",
                  "grid",
                  "grid",
                  "grid",
                  "grid",
                  "cell2",
                  "grid",
                  "dead",
                  "grid",
                  "grid",
                  "cell3",
                ].map((k, i) => (
                  <div
                    key={i}
                    className={
                      "aspect-square rounded-[3px] " +
                      (k === "cell"
                        ? "bg-vt-lime shadow-[0_0_16px_oklch(0.92_0.23_122/0.55)]"
                        : k === "cell2"
                          ? "bg-vt-cyan shadow-[0_0_16px_oklch(0.85_0.14_195/0.5)]"
                          : k === "cell3"
                            ? "bg-vt-magenta shadow-[0_0_16px_oklch(0.7_0.22_350/0.45)]"
                            : k === "dead"
                              ? "bg-vt-line"
                              : k.startsWith("sock")
                                ? "border border-vt-lime/60 bg-vt-lime/10"
                                : "bg-vt-panel")
                    }
                  />
                ))}
              </div>
            </div>
            <div className="border-t border-vt-line px-5 py-5">
              <p className="font-vt-mono text-[10px] font-bold uppercase tracking-[0.24em] text-vt-lime">
                Direction two
              </p>
              <h2 className="mt-1.5 font-vt-display text-2xl font-bold uppercase tracking-tight text-vt-ink">
                Voltage
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-vt-muted">
                Night power grid. Charge burns down a meter, cells seat into sockets with a snap,
                everything reads in monospace.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-vt-lime px-4 py-2.5 font-vt-mono text-[13px] font-bold uppercase tracking-wider text-vt-bg">
                Play Voltage <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-[13px] leading-relaxed text-mk-muted">
          Every solve in either world earns points on one weekly Kweza leaderboard. Winners crowned
          Sunday, 8 PM.
        </p>
      </main>
    </div>
  );
}
