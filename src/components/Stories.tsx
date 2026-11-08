"use client";

// Why Studio 11: three stories joined by one drawn line.
//
// The line is built from where the photos and text really sit, so it never
// crosses the words. It travels through the empty space between stories and
// draws an arch frame around each photo. A small pen point leads the line and
// always sits at the same height on screen, so the drawing follows your scroll
// exactly. When a frame closes, that photo "lights up".

import { useEffect, useRef } from "react";
import { Img } from "./Img";
import { ArrowIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";

const STORY_COUNT = 3;
const FRAME_GAP = 16; // space between a photo and its drawn frame
const CORNER = 28; // rounded corners on the line
const HEAD = 0.62; // the pen point sits at 62% of the screen height

type Pt = [number, number];
type Track = { len: number; v: Float32Array; l: Float32Array; x: Float32Array; y: Float32Array };

// Straight runs with rounded corners. `move` starts a new line; otherwise it continues.
function poly(points: Pt[], move: boolean) {
  const pts = points.filter((p, i) => i === 0 || Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) > 0.5);
  let d = move ? `M${pts[0][0]} ${pts[0][1]}` : "";
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (i < pts.length - 1) {
      const [px, py] = pts[i - 1];
      const [nx, ny] = pts[i + 1];
      const l1 = Math.hypot(x - px, y - py);
      const l2 = Math.hypot(nx - x, ny - y);
      const r = Math.min(CORNER, l1 / 2, l2 / 2);
      const ax = x - ((x - px) / l1) * r, ay = y - ((y - py) / l1) * r;
      const bx = x + ((nx - x) / l2) * r, by = y + ((ny - y) / l2) * r;
      d += ` L${ax} ${ay} Q${x} ${y} ${bx} ${by}`;
    } else d += ` L${x} ${y}`;
  }
  return d;
}

// Sample a path and give every point a "scroll height" (v) that the pen must
// reach before that point is drawn. Downward parts follow the pen exactly;
// sideways parts are spread over a short scroll so they draw smoothly instead
// of appearing at once, and the line then catches up with the pen again.
function sample(el: SVGPathElement, startLag = 0): Track {
  const len = el.getTotalLength();
  const n = Math.max(2, Math.ceil(len / 5) + 1);
  const t: Track = { len, v: new Float32Array(n), l: new Float32Array(n), x: new Float32Array(n), y: new Float32Array(n) };
  let lag = startLag;
  for (let k = 0; k < n; k++) {
    const L = (len * k) / (n - 1);
    const p = el.getPointAtLength(L);
    t.l[k] = L; t.x[k] = p.x; t.y[k] = p.y;
    if (k === 0) { t.v[k] = p.y + lag; continue; }
    const dx = Math.abs(p.x - t.x[k - 1]);
    const dy = Math.max(0, p.y - t.y[k - 1]);
    lag = Math.max(0, lag + dx * 0.22 - dy * 0.5);
    t.v[k] = Math.max(t.v[k - 1] + 0.001, p.y + lag);
  }
  return t;
}

// How much of a track is drawn when the pen is at scroll height `h`.
function drawnAt(t: Track, h: number) {
  const { v, l } = t;
  if (h <= v[0]) return 0;
  const last = v.length - 1;
  if (h >= v[last]) return t.len;
  let lo = 0, hi = last;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (v[mid] <= h) lo = mid; else hi = mid; }
  return l[lo] + ((h - v[lo]) / (v[hi] - v[lo])) * (l[hi] - l[lo]);
}

function pointAt(t: Track, len: number): Pt {
  const k = Math.min(t.l.length - 1, Math.max(0, Math.round((len / t.len) * (t.l.length - 1))));
  return [t.x[k], t.y[k]];
}

export function Stories() {
  const { stories } = useContent();
  const { openBooking } = useUI();
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const line = svg.querySelector<SVGPathElement>(".stories__line")!;
    const frames = [...svg.querySelectorAll<SVGPathElement>(".stories__frame")];
    const nodes = [...svg.querySelectorAll<SVGCircleElement>(".stories__node")];
    const tip = svg.querySelector<SVGGElement>(".stories__tip")!;
    const end = svg.querySelector<SVGCircleElement>(".stories__end")!;
    const storyEls = [...root.querySelectorAll<HTMLElement>(".story")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 700px)");

    let lineTrack: Track | null = null;
    let frameTracks: (Track | null)[] = [];
    let litAt: number[] = []; // scroll height at which each story lights up

    // Layout position inside the section (ignores reveal and parallax transforms).
    const box = (el: HTMLElement) => {
      let x = 0, y = 0;
      for (let e: HTMLElement | null = el; e && e !== root; e = e.offsetParent as HTMLElement | null) { x += e.offsetLeft; y += e.offsetTop; }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };

    const build = () => {
      const W = root.offsetWidth, H = root.offsetHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("width", String(W));
      svg.setAttribute("height", String(H));
      const head = box(root.querySelector<HTMLElement>(".stories__head")!);
      const parts = storyEls.map((st) => ({ s: box(st), m: box(st.querySelector<HTMLElement>(".story__media")!), t: box(st.querySelector<HTMLElement>(".story__text")!), num: box(st.querySelector<HTMLElement>(".story__num")!) }));
      const last = parts[parts.length - 1];

      if (phone.matches) {
        // Phones: one quiet line in the side margin, with a dot at each story number.
        const x = Math.max(8, Math.round(parts[0].t.x / 2));
        line.setAttribute("d", `M${x} ${parts[0].s.y - 40} V${last.s.y + last.s.h + 24}`);
        frames.forEach((f) => f.setAttribute("d", ""));
        parts.forEach((p, i) => { nodes[i]?.setAttribute("cx", String(x)); nodes[i]?.setAttribute("cy", String(p.num.y + p.num.h / 2)); });
        lineTrack = sample(line);
        frameTracks = frames.map(() => null);
        litAt = parts.map((p) => p.num.y + p.num.h / 2);
        end.setAttribute("cx", String(x));
        end.setAttribute("cy", String(last.s.y + last.s.h + 24));
      } else {
        // Big screens: the line leaves the heading, frames each photo, and crosses
        // to the next story through the empty space between them.
        let d = "";
        let cur: Pt = [W / 2, head.y + head.h + 10];
        let prevBottom = head.y + head.h;
        const tops: Pt[] = [];
        const inner: string[] = [];
        parts.forEach(({ s, m, t }, i) => {
          const cx = m.x + m.w / 2;
          const rx = m.w / 2 + FRAME_GAP;
          const ry = m.h * 0.4 + FRAME_GAP;
          const top = m.y - FRAME_GAP;
          const sideY = m.y + m.h * 0.4;
          const bottom = m.y + m.h + FRAME_GAP;
          const gapY = (prevBottom + s.y) / 2;
          const photoLeft = cx < t.x + t.w / 2; // the line keeps to the photo's outer side
          const outerX = photoLeft ? cx - rx : cx + rx;
          const innerX = photoLeft ? cx + rx : cx - rx;
          d += poly([cur, [cur[0], gapY], [cx, gapY], [cx, top]], i === 0);
          d += ` A${rx} ${ry} 0 0 ${photoLeft ? 0 : 1} ${outerX} ${sideY} V${bottom}`;
          inner.push(`M${cx} ${top} A${rx} ${ry} 0 0 ${photoLeft ? 1 : 0} ${innerX} ${sideY} V${bottom}`);
          tops.push([cx, top]);
          cur = [outerX, bottom];
          prevBottom = s.y + s.h;
        });
        const endY = Math.min(H - 24, prevBottom + 64);
        d += poly([cur, [cur[0], endY], [W / 2, endY]], false);
        line.setAttribute("d", d);
        end.setAttribute("cx", String(W / 2));
        end.setAttribute("cy", String(endY));
        nodes.forEach((n) => n.setAttribute("cx", "-99"));
        lineTrack = sample(line);
        // Each frame's far side starts when the line reaches the top of the arch,
        // so both sides draw together, like a mirror.
        frameTracks = frames.map((f, i) => {
          if (!inner[i]) { f.setAttribute("d", ""); return null; }
          f.setAttribute("d", inner[i]);
          const [tx, ty] = tops[i];
          let best = 0, bestD = Infinity;
          for (let k = 0; k < lineTrack!.x.length; k++) {
            const dd = Math.hypot(lineTrack!.x[k] - tx, lineTrack!.y[k] - ty);
            if (dd < bestD) { bestD = dd; best = k; }
          }
          return sample(f, lineTrack!.v[best] - ty);
        });
        litAt = frameTracks.map((ft) => (ft ? ft.v[ft.v.length - 1] : Infinity));
      }

      line.style.strokeDasharray = `${lineTrack.len} ${lineTrack.len + 2}`;
      frames.forEach((f, i) => { const ft = frameTracks[i]; if (ft) f.style.strokeDasharray = `${ft.len} ${ft.len + 2}`; });
      update();
    };

    const update = () => {
      if (!lineTrack) return;
      const h = reduce ? Infinity : window.innerHeight * HEAD - root.getBoundingClientRect().top;
      const drawn = drawnAt(lineTrack, h);
      line.style.strokeDashoffset = String(lineTrack.len - drawn);
      frames.forEach((f, i) => { const ft = frameTracks[i]; if (ft) f.style.strokeDashoffset = String(ft.len - drawnAt(ft, h)); });
      const moving = drawn > 0.5 && drawn < lineTrack.len - 0.5;
      tip.classList.toggle("is-on", moving && !reduce);
      if (moving) { const [x, y] = pointAt(lineTrack, drawn); tip.setAttribute("transform", `translate(${x} ${y})`); }
      end.classList.toggle("is-on", drawn >= lineTrack.len - 0.5);
      storyEls.forEach((st, i) => {
        const on = h >= litAt[i];
        st.classList.toggle("is-lit", on);
        nodes[i]?.classList.toggle("is-on", on);
      });
    };

    let raf = 0;
    const schedule = (fn: () => void) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); };
    const onScroll = () => schedule(update);
    const ro = new ResizeObserver(() => schedule(build));
    ro.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    phone.addEventListener("change", build);
    build();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      phone.removeEventListener("change", build);
    };
  }, []);

  return (
    <div className="stories" id="why" ref={rootRef}>
      <svg className="stories__art" ref={svgRef} aria-hidden="true">
        <path className="stories__line" />
        {Array.from({ length: STORY_COUNT }, (_, i) => <path className="stories__frame" key={i} />)}
        {Array.from({ length: STORY_COUNT }, (_, i) => <circle className="stories__node" key={i} r="4.5" cx="-99" cy="-99" />)}
        <circle className="stories__end" r="5" cx="-99" cy="-99" />
        <g className="stories__tip">
          <circle className="stories__halo" r="12" />
          <circle r="3.5" />
        </g>
      </svg>

      <div className="stories__head container-narrow" data-stagger>
        <p className="kicker kicker--center" data-reveal>Our Promise</p>
        <h2 className="title" data-reveal>Why Choose <em>Studio 11</em></h2>
      </div>

      <section className="story">
        <figure className="story__media" data-reveal>
          <Img src={stories.oneTeam} alt="A finished living and dining area with soft ceiling lights" widths={[500, 800, 1100, 1400]} ratio={1.45} sizes="(max-width: 700px) 90vw, 42vw" parallax={-0.06} />
        </figure>
        <div className="story__text" data-stagger>
          <span className="story__num" data-reveal>01</span>
          <p className="kicker" data-reveal>One Team</p>
          <h3 className="title" data-reveal>Everything Done <br />by One Team</h3>
          <p className="body" data-reveal>Carpentry, false ceiling, electrical work and painting. Our team handles all of it, so you do not have to manage different workers.</p>
          <p className="body" data-reveal>You talk to one team, from the first visit to the day we hand over your home.</p>
          <a href="#services" className="link" data-reveal>See what we do<ArrowIcon /></a>
        </div>
      </section>

      <section className="story story--reverse">
        <figure className="story__media" data-reveal>
          <Img src={stories.materials} alt="Samples of marble, wood and fabric laid out together" widths={[500, 800, 1100, 1400]} ratio={1.45} sizes="(max-width: 700px) 90vw, 42vw" parallax={-0.06} />
        </figure>
        <div className="story__text" data-stagger>
          <span className="story__num" data-reveal>02</span>
          <p className="kicker" data-reveal>Built to Last</p>
          <h3 className="title" data-reveal>Strong Materials, <br />Real Warranty</h3>
          <p className="body" data-reveal>We use plywood with a <strong>15-year warranty</strong> and hardware with a <strong>5-year warranty</strong>.</p>
          <p className="body" data-reveal>After handover, you also get a <strong>1-year service warranty</strong> on our work.</p>
          <button className="link" onClick={() => openBooking()} data-reveal>Book a free site visit<ArrowIcon /></button>
        </div>
      </section>

      <section className="story">
        <figure className="story__media" data-reveal>
          <Img src={stories.design} alt="A 3D design of a bedroom with soft wall panels and a large wardrobe" widths={[500, 800, 1100, 1400]} ratio={1.45} sizes="(max-width: 700px) 90vw, 42vw" parallax={-0.06} />
        </figure>
        <div className="story__text" data-stagger>
          <span className="story__num" data-reveal>03</span>
          <p className="kicker" data-reveal>No Surprises</p>
          <h3 className="title" data-reveal>See It Before <br />We Build It</h3>
          <p className="body" data-reveal>The site visit and the quotation are free, so you know the price before you decide.</p>
          <p className="body" data-reveal>Once you book, we show you your home in 3D. You see the look first, then we start the work.</p>
          <a href="#process" className="link" data-reveal>See how it works<ArrowIcon /></a>
        </div>
      </section>
    </div>
  );
}
