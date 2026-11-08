"use client";

import { useEffect, useMemo, useState } from "react";
import { Mark, PhoneIcon, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { sized } from "@/lib/img";
import { MESSAGES, telHref, waHref } from "@/lib/contact";

type SceneKind = "shutters" | "tiles" | "steps" | "arch" | "pendant" | "window";
type Link = { href: string; label: string; scene: SceneKind; color: string; img: string };

const PIECES: Record<SceneKind, React.ReactNode> = {
  shutters: <><span className="piece" /><span className="piece" /><span className="piece" /><span className="piece" /><span className="scene__line" /></>,
  tiles: <>{Array.from({ length: 9 }, (_, i) => <span key={i} className="piece" />)}</>,
  steps: <><span className="piece" /><span className="piece" /><span className="piece" /><span className="piece" /></>,
  arch: <><span className="scene__line" /><span className="piece" /></>,
  pendant: <><span className="scene__line" /><span className="scene__line" /><span className="piece" /></>,
  window: <><span className="piece" /><span className="piece" /><span className="piece" /><span className="piece" /><span className="scene__line" /></>,
};

export function Menu() {
  const c = useContent();
  const { menuOpen, setMenuOpen, openBooking, lenisRef } = useUI();
  const [scene, setScene] = useState<string | null>(null);
  const [primed, setPrimed] = useState(false);

  const links = useMemo<Link[]>(() => {
    const svc = c.services.items.filter((s) => !s.hidden);
    const list: Link[] = [
      { href: "#services", label: "Services", scene: "shutters", color: "#8b5e3c", img: svc.find((s) => s.id === "kitchen")?.image || c.hero.image },
    ];
    if (c.packages.items.some((p) => !p.hidden)) {
      list.push({ href: "#packages", label: "Packages", scene: "tiles", color: "#b5a487", img: svc[0]?.image || c.hero.image });
    }
    list.push(
      { href: "#process", label: "How It Works", scene: "steps", color: "#6c6650", img: c.stories.design },
      { href: "#gallery", label: c.gallery.kicker, scene: "arch", color: "#c7b597", img: c.gallery.items[0]?.image || c.hero.image },
      { href: "#reviews", label: "Reviews", scene: "pendant", color: "#b89a5e", img: c.hero.image },
      { href: "#contact", label: "Contact", scene: "window", color: "#5b5046", img: c.stories.oneTeam },
    );
    return list;
  }, [c]);

  // Lock the page behind the menu.
  useEffect(() => {
    if (!menuOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- scene photos load the first time the menu opens
    setPrimed(true);
    const lenis = lenisRef.current;
    document.body.classList.add("is-locked");
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("is-locked");
      lenis?.start();
      document.removeEventListener("keydown", onKey);
      setTimeout(() => setScene(null), 900);
    };
  }, [menuOpen, lenisRef, setMenuOpen]);

  const active = links.find((l) => l.scene === scene);

  return (
    <div className={`menu${menuOpen ? " is-open" : ""}`} id="menu" aria-hidden={!menuOpen} inert={!menuOpen}>
      <div className="menu__inner">
        <div className="menu__top">
          <button className="menu-toggle menu-toggle--close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <span className="menu-toggle__icon"><i /><i /></span>
            <span>Close</span>
          </button>
          <button className="btn btn--teak btn--sm" onClick={() => openBooking()}>Book Free Site Visit</button>
        </div>

        <nav className="menu__nav" aria-label="Main" onMouseLeave={() => setScene(null)}>
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={scene === l.scene ? "is-current" : undefined}
              style={{ "--i": i } as React.CSSProperties}
              onMouseEnter={() => setScene(l.scene)}
              onFocus={() => setScene(l.scene)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="menu__actions">
          <button className="btn btn--lime" onClick={() => openBooking()}>Book Free Site Visit</button>
          <div className="menu__quick">
            <a href={telHref(c.contact.phone)}><PhoneIcon />Call</a>
            <a href={waHref(c.contact.whatsapp, MESSAGES.consult)} target="_blank" rel="noopener"><WhatsAppIcon />WhatsApp</a>
          </div>
          <p className="menu__hours">{c.contact.days} · {c.contact.hours}</p>
        </div>

        <div className="menu__foot">
          <div>
            <p className="menu__label">Call or WhatsApp</p>
            <a href={telHref(c.contact.phone)}>{c.contact.phone}</a>
            <a href={waHref(c.contact.whatsapp, MESSAGES.consult)} target="_blank" rel="noopener">Get Free Consultation</a>
          </div>
          <div>
            <p className="menu__label">{c.contact.days}</p>
            <p>{c.contact.hours}</p>
            <p>Hoskote, Bengaluru</p>
          </div>
        </div>
      </div>

      <div className={`menu__art${active ? " has-scene" : ""}`} aria-hidden="true" style={active ? ({ "--art-bg": active.color } as React.CSSProperties) : undefined}>
        <Mark className="menu__mark" />
        {links.map((l) => (
          <div
            key={l.scene}
            className={`scene scene--${l.scene}${scene === l.scene ? " is-active" : ""}`}
            style={primed ? ({ "--img": `url("${sized(l.img, 1200)}")`, "--scene-bg": l.color } as React.CSSProperties) : undefined}
          >
            {PIECES[l.scene]}
          </div>
        ))}
      </div>
    </div>
  );
}
