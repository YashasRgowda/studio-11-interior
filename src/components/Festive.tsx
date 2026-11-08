// Diwali + 5 years of Studio 11: a quiet festive touch on the hero.
// It shows only until the end of 12 Nov 2026 (India time). A tiny script in
// the page head adds `festive` to <html> before first paint while the date is
// still within the window, and every piece here is hidden by CSS otherwise, so
// nothing flashes and nothing needs to be removed by hand afterwards.

export const FESTIVE_UNTIL = "2026-11-13T00:00:00+05:30";
export const FESTIVE_CHECK = `try{if(Date.now()<Date.parse("${FESTIVE_UNTIL}"))document.documentElement.classList.add("festive")}catch(e){}`;

// Golden sparks rising like diya light. Fixed positions (not random), so the
// page renders the same on the server and in the browser.
const SPARKS = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    left: `${(4 + r(1) * 92).toFixed(1)}%`,
    size: `${(2 + r(2) * 3).toFixed(1)}px`,
    dur: `${(9 + r(3) * 9).toFixed(1)}s`,
    delay: `${(-r(4) * 18).toFixed(1)}s`,
    drift: `${((r(5) - 0.5) * 80).toFixed(0)}px`,
    rise: `${(38 + r(6) * 40).toFixed(0)}vh`,
  };
});

export function FestiveSparks() {
  return (
    <div className="fest-sparks festive-only" aria-hidden="true">
      {SPARKS.map((s, i) => (
        <i key={i} style={{ left: s.left, width: s.size, height: s.size, animationDuration: s.dur, animationDelay: s.delay, "--drift": s.drift, "--rise": s.rise } as React.CSSProperties} />
      ))}
    </div>
  );
}

// A small lit diya: clay lamp, flickering flame, warm glow.
export function Diya({ className = "" }: { className?: string }) {
  return (
    <span className={`diya ${className}`} aria-hidden="true">
      <span className="diya__glow" />
      <svg viewBox="0 0 48 40">
        <path className="diya__flame" d="M24 3c3.6 4.6 5.4 8.4 5.4 11.4A5.4 5.4 0 0 1 24 19.8a5.4 5.4 0 0 1-5.4-5.4C18.6 11.4 20.4 7.6 24 3Z" />
        <path className="diya__core" d="M24 9.5c1.6 2.2 2.4 3.9 2.4 5.2a2.4 2.4 0 0 1-4.8 0c0-1.3.8-3 2.4-5.2Z" />
        <path className="diya__lamp" d="M4 22.5h40c-1.6 8.2-9.6 13.5-20 13.5S5.6 30.7 4 22.5Z" />
        <path className="diya__rim" d="M3 22.5h42" />
        <path className="diya__dots" d="M13 28.5h.01M19 30.5h.01M24 31h.01M29 30.5h.01M35 28.5h.01" />
      </svg>
    </span>
  );
}

// The line above the headline.
export function FestiveLine() {
  return (
    <p className="fest-line festive-only">
      <Diya />
      <em>Happy Diwali</em>
      <i className="fest-line__dot" aria-hidden="true" />
      <span className="fest-line__text">Celebrating 5 Years of Studio 11</span>
    </p>
  );
}

// A gold seal that turns slowly: "5 Years".
export function FestiveSeal() {
  return (
    <div className="fest-seal festive-only" aria-hidden="true">
      <svg className="fest-seal__ring" viewBox="0 0 140 140">
        <defs><path id="festRing" d="M70 70 m-56 0 a56 56 0 1 1 112 0 a56 56 0 1 1 -112 0" /></defs>
        <text textLength="346" lengthAdjust="spacing"><textPath href="#festRing">HAPPY DIWALI · 5 YEARS OF STUDIO 11 INTERIOR ·</textPath></text>
      </svg>
      <span className="fest-seal__core">
        <b>5</b>
        <small>Years</small>
      </span>
    </div>
  );
}
