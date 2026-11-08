"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon } from "./Icons";
import { useContent } from "@/lib/content";

export function Reviews() {
  const { reviews, contact } = useContent();
  const items = reviews.items.filter((r) => r.text);
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const x0 = useRef<{ x: number; y: number } | null>(null);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
  }, [items.length]);

  useEffect(() => {
    restart();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [restart]);

  const go = (i: number) => { setIndex((i + items.length) % items.length); restart(); };

  return (
    <section className="reviews" id="reviews">
      <div className="container-narrow" data-stagger>
        <p className="kicker kicker--center" data-reveal>What Our Customers Say</p>

        {/* the rating card: the stars fill in when it comes into view */}
        <div className="rating" data-reveal style={{ "--fill": `${Math.min(100, (parseFloat(reviews.rating) / 5) * 100) || 0}%` } as React.CSSProperties}>
          <div className="rating__score">
            <span className="rating__num">{reviews.rating}</span>
            <span className="rating__stars" role="img" aria-label={`${reviews.rating} out of 5 stars`}>
              <span className="rating__base" aria-hidden="true">★★★★★</span>
              <span className="rating__fill" aria-hidden="true">★★★★★</span>
            </span>
          </div>
          <div className="rating__text">
            <p className="rating__title">Rated {reviews.rating} on Google</p>
            <p className="rating__src">Based on {reviews.count} reviews from our customers.</p>
          </div>
          <a className="btn btn--ghost rating__btn" href={contact.mapsUrl} target="_blank" rel="noopener">Read reviews<ArrowIcon /></a>
        </div>

        {items.length > 0 && (
          <>
            <div
              className="voices__track"
              data-reveal
              style={{ touchAction: "pan-y" }}
              onPointerDown={(e) => { if (e.pointerType !== "mouse") x0.current = { x: e.clientX, y: e.clientY }; }}
              onPointerCancel={() => { x0.current = null; }}
              onPointerUp={(e) => {
                const s = x0.current;
                x0.current = null;
                if (!s) return;
                const dx = e.clientX - s.x, dy = e.clientY - s.y;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(index + (dx < 0 ? 1 : -1));
              }}
            >
              {items.map((r, i) => (
                <blockquote className={`voice${i === index ? " is-active" : ""}`} key={`${r.name}-${i}`} aria-hidden={i !== index}>
                  <p>“{r.text}”</p>
                  <cite>{r.name}{r.tag && <span> · {r.tag}</span>}</cite>
                </blockquote>
              ))}
            </div>
            {items.length > 1 && (
              <div className="voices__dots" role="tablist" aria-label="Reviews">
                {items.map((_, i) => (
                  <button key={i} className={i === index ? "is-active" : undefined} onClick={() => go(i)} aria-label={`Review ${i + 1}`} aria-selected={i === index} role="tab" />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
