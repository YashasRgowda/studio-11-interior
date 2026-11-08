"use client";

// Design Ideas: a sideways gallery.
// Swipe, drag (desktop), use the arrows or the keyboard. While it moves, each
// photo glides a little inside its frame, and the line below shows how far you are.

import { useCallback, useEffect, useRef, useState } from "react";
import { Img } from "./Img";
import { ArrowIcon, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { waHref } from "@/lib/contact";

const SHARE = "Hi Studio 11, I liked a design on your website. Can we talk?";

export function Gallery() {
  const { gallery, contact } = useContent();
  const { openBooking } = useUI();
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [current, setCurrent] = useState(1);
  const count = gallery.items.length;

  // Progress line, arrows, counter and the gentle photo glide all follow the track's scroll.
  const update = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    const p = max > 0 ? t.scrollLeft / max : 0;
    if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0.04, Math.min(1, (t.clientWidth / t.scrollWidth) + p * (1 - t.clientWidth / t.scrollWidth)))})`;
    setEdge({ start: t.scrollLeft < 8, end: t.scrollLeft > max - 8 });
    const cards = [...t.querySelectorAll<HTMLElement>(".g-card")];
    const box = t.getBoundingClientRect();
    let first = 0;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      if (r.right - r.width * 0.5 < box.left + 40) first = i + 1;
      // -1 (left side) … 1 (right side): the photo shifts the other way, like looking through a window
      const k = Math.max(-1.2, Math.min(1.2, (r.left + r.width / 2 - (box.left + box.width / 2)) / box.width));
      c.style.setProperty("--x", k.toFixed(3));
    });
    setCurrent(Math.min(count, first + 1));
  }, [count]);

  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    t.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Desktop: drag the gallery with the mouse.
    let startX = 0, startLeft = 0, dragging = false, moved = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startLeft = t.scrollLeft;
      t.classList.add("is-dragging");
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      t.scrollLeft = startLeft - dx;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      t.classList.remove("is-dragging"); // snapping comes back on, so it settles on a photo
    };
    const click = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    t.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    t.addEventListener("click", click, true);
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      t.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      t.removeEventListener("click", click, true);
    };
  }, [update, count]);

  const step = (dir: 1 | -1) => {
    const t = track.current;
    if (!t) return;
    const card = t.querySelector<HTMLElement>(".g-card");
    const gap = parseFloat(getComputedStyle(t).columnGap) || 20;
    t.scrollBy({ left: dir * (card ? card.offsetWidth + gap : t.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!count) return null;
  return (
    <section className="gallery" id="gallery">
      <div className="container-x gallery__top">
        <div data-stagger>
          <p className="kicker" data-reveal>{gallery.kicker}</p>
          <h2 className="title" data-reveal>{gallery.title}</h2>
          <p className="gallery__lead" data-reveal>{gallery.lead}</p>
        </div>
        <div className="gallery__nav" data-reveal>
          <button onClick={() => step(-1)} disabled={edge.start} aria-label="Previous photos"><ArrowIcon /></button>
          <button onClick={() => step(1)} disabled={edge.end} aria-label="More photos"><ArrowIcon /></button>
        </div>
      </div>

      <div
        className="gallery__track"
        ref={track}
        data-stagger
        tabIndex={0}
        aria-label={`${gallery.kicker}: swipe or use the arrow keys to see more`}
        onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); step(1); } if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } }}
      >
        {gallery.items.map((g, i) => (
          <figure className="g-card" key={`${g.image}-${i}`} data-reveal>
            <div className="g-card__media">
              <Img src={g.image} alt={g.title} widths={[400, 600, 900, 1200]} ratio={1.25} sizes="(max-width: 700px) 78vw, 28vw" />
              <span className="g-card__num">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <figcaption>
              <p className="g-card__room">{g.room}</p>
              <p className="g-card__title">{g.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="container-x gallery__progress" aria-hidden="true">
        <span className="gallery__count">{String(current).padStart(2, "0")} <i>/ {String(count).padStart(2, "0")}</i></span>
        <span className="gallery__line"><span ref={bar} /></span>
      </div>

      <div className="gallery__foot" data-reveal>
        <button className="btn btn--teak" onClick={() => openBooking()}>Book Free Site Visit</button>
        <a className="btn btn--ghost" href={waHref(contact.whatsapp, SHARE)} target="_blank" rel="noopener"><WhatsAppIcon />Share a design you like</a>
      </div>
    </section>
  );
}
