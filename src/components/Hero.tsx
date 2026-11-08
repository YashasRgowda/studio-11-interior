"use client";

import { useEffect, useRef } from "react";
import { Img } from "./Img";
import { Mark, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { MESSAGES, waHref } from "@/lib/contact";
import { FestiveLine, FestiveSeal, FestiveSparks } from "./Festive";

// The end of the headline is set in italic: after the last comma ("Done Right."),
// or else the last sentence. Works for whatever headline the owner saves.
function splitTitle(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const comma = text.lastIndexOf(",");
  const cut = sentences.length > 1 ? text.length - sentences[sentences.length - 1].length : comma > 0 ? comma + 1 : -1;
  if (cut <= 0) return text;
  return (
    <>
      {text.slice(0, cut).trim()} <em>{text.slice(cut).trim()}</em>
    </>
  );
}

export function Hero() {
  const { hero, contact, reviews } = useContent();
  const { openBooking } = useUI();
  const frame = useRef<HTMLDivElement>(null);

  // On desktops, the room shifts gently with the cursor, like looking around.
  useEffect(() => {
    const el = document.getElementById("hero");
    if (!el || !frame.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const f = frame.current;
    const move = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      f.style.translate = `${x * -22}px ${y * -14}px`;
    };
    const leave = () => (f.style.translate = "");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section className="hero" id="hero" aria-label="Welcome">
      <div className="hero__stage">
        <div className="hero__media">
          <div className="hero__frame" ref={frame}>
            <Img src={hero.image} alt="A finished living room with a marble wall, soft ceiling lights and a pooja corner" widths={[800, 1200, 1800, 2400, 3000]} tall eager />
          </div>
        </div>
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__grain" aria-hidden="true" />
        <FestiveSparks />
      </div>
      <div className="hero__door" aria-hidden="true" />

      <div className="hero__crest" aria-hidden="true">
        <Mark className="hero__mark" />
        <span className="hero__word">STUDIO 11</span>
        <span className="hero__sub">Interior</span>
      </div>

      <FestiveSeal />

      <div className="hero__content">
        <FestiveLine />
        <h1 className="hero__title">
          <span className="line"><span>{splitTitle(hero.title)}</span></span>
        </h1>
        <p className="hero__lead">
          {(hero.lead.match(/[^.!?]+[.!?]*/g) || [hero.lead]).map((t, i) => <span key={i}>{t.trim()} </span>)}
        </p>
        <div className="hero__actions">
          <button className="btn btn--lime" onClick={() => openBooking()}>Book Free Site Visit</button>
          <a className="btn btn--ghost-light" href={waHref(contact.whatsapp, MESSAGES.consult)} target="_blank" rel="noopener">
            <WhatsAppIcon />Get Free Consultation
          </a>
        </div>
      </div>

      <p className="hero__corner hero__corner--left"><span className="star" aria-hidden="true">★★★★★</span>{reviews.rating} on Google</p>
      <p className="hero__corner hero__corner--right">{contact.days} · {contact.hours}</p>
    </section>
  );
}
