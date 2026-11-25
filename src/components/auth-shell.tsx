import { Logo } from "@/components/brand/logo";
import { FxGround, SAGE } from "@/components/fx/fx-ground";

/** Sign in, sign up and verify: the form on the page ground, the lit product picture beside it. */
export function AuthShell({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="wrap grid min-h-[calc(100svh-var(--nav))] gap-10 py-10 lg:grid-cols-12 lg:gap-6 lg:py-12">
      <div className="page-in grid content-center lg:col-span-5 xl:col-span-4">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:col-span-7 lg:col-start-6 lg:block xl:col-span-7 xl:col-start-6">
        <div className="frame-lit relative h-full min-h-[560px]">
          <FxGround
            effect="painterly-landscape"
            palette={SAGE}
            seed={23}
            params={{ blur: 1, brush: 0.35, slope: 10, hillY: 0.26, horizon: 0.55 }}
          />
          <div className="absolute inset-0 z-10 grid content-center justify-items-center p-10">{aside}</div>
        </div>
      </div>
    </section>
  );
}

/** The picture beside the form: a company list with its ticks, as the app shows it. */
export function AuthAside() {
  const rows: [string, string, boolean][] = [
    ["Two Sum", "Easy", true],
    ["LRU Cache", "Medium", true],
    ["Number of Islands", "Medium", true],
    ["Merge Intervals", "Medium", false],
    ["Trapping Rain Water", "Hard", false],
  ];
  return (
    <div className="grid w-full max-w-[420px] gap-5" aria-hidden="true">
      <div className="ui ui-panel ui-checks w-full">
        <div className="ui-checks__head">
          <div className="ui-title">Your Amazon list</div>
          <span className="ui-spacer" />
          <div className="ui-meta">3 of 5 solved</div>
        </div>
        <div className="ui-checks__bar">
          <i style={{ ["--k" as string]: 0.6 }} />
        </div>
        <ul className="ui-checks__list">
          {rows.map(([t, d, done]) => (
            <li key={t} className={`ui-check ${done ? "is-done" : ""}`}>
              <span className="ui-check__box">
                <svg viewBox="0 0 16 16">
                  <path d="m4.5 8.2 2.3 2.3 4.7-5" />
                </svg>
              </span>
              <span className="ui-check__label">{t}</span>
              <span className="ui-spacer" />
              <span className="ui-meta">{d}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-center text-[15px] text-ground-ink">Your ticks follow you to every company list.</p>
    </div>
  );
}
