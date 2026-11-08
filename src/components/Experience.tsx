"use client";

// Everything that moves with the scroll: smooth scrolling, the header, the
// floating buttons, parallax photos, lines that draw themselves and reveals.

import { useEffect } from "react";
import Lenis from "lenis";
import { useUI } from "@/lib/ui";

export function Experience() {
  const { lenisRef, scrollTo, setMenuOpen } = useUI();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (!reduceMotion) {
      lenisRef.current = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
      const loop = (time: number) => {
        lenisRef.current?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    /* In-page links scroll smoothly */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href") || "";
      if (id === "#") return;
      if (id !== "#top" && !document.querySelector(id)) return;
      e.preventDefault();
      setMenuOpen(false);
      scrollTo(id);
    };
    document.addEventListener("click", onClick);

    /* Reveal on scroll */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    const watch = () => {
      // Siblings inside a [data-stagger] group come in one after another.
      document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
        group.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
          if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", `${Math.min(i, 8) * 0.08}s`);
        });
      });
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    };
    watch();
    // Sections rebuilt from saved content get watched too.
    const mo = new MutationObserver(() => watch());
    mo.observe(document.querySelector("main") || document.body, { childList: true, subtree: true });

    /* Scroll-driven UI */
    const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s);
    const header = $("#header");
    const hero = $("#hero");
    const heroMedia = $(".hero__media");
    const heroLayers = [...document.querySelectorAll<HTMLElement>(".hero__crest, .hero__content, .hero__corner")];
    const floatCta = $("#floatCta");
    const floatWa = $("#floatWa");
    const toTop = $("#toTop");
    const dock = $("#dock");
    const chatBubble = $("#chatBubble");
    const footer = $(".footer");
    const steps = $(".steps");
    const stepEls = [...document.querySelectorAll<HTMLElement>(".step")];
    const processEl = $(".process");
    const processPin = $(".process__pin");
    // Big screens pin "How It Works" (CSS sticky); then scroll inside it plays the steps.
    let pinned = false;
    const measurePin = () => { pinned = !!processPin && getComputedStyle(processPin).position === "sticky"; };
    measurePin();
    steps?.classList.toggle("is-live", !reduceMotion);
    const ctaZones = [...document.querySelectorAll<HTMLElement>(".about__more, .process__cta, .gallery__foot, .contact__actions, .services__ask, .rating")];


    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const heroH = hero?.offsetHeight || vh;
      const nearFooter = footer ? footer.getBoundingClientRect().top < vh - 40 : false;
      const pastHero = y > heroH * 0.85;

      // The floating button steps aside when a section's own button is on screen.
      const inlineCta = ctaZones.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < vh - 20 && r.bottom > vh * 0.45;
      });

      header?.classList.toggle("is-solid", y > heroH - 90);
      floatCta?.classList.toggle("is-visible", pastHero && !nearFooter && !inlineCta);
      floatWa?.classList.toggle("is-visible", pastHero);
      dock?.classList.toggle("is-visible", pastHero && !nearFooter);
      toTop?.classList.toggle("is-visible", y > vh * 1.2);
      // Chat bubble: shows with the other buttons; on phones it steps aside with the dock near the footer.
      chatBubble?.classList.toggle("is-visible", pastHero && !(window.innerWidth <= 1100 && nearFooter));

      if (!reduceMotion && heroMedia && y < heroH) {
        const p = y / heroH;
        heroMedia.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
        // Untouched at the very top, so the opening fade-in still plays.
        heroLayers.forEach((el) => {
          el.style.opacity = y > 0 ? String(Math.max(0, 1 - p * 1.6)) : "";
          el.style.translate = y > 0 ? `0 ${y * 0.18}px` : "";
        });
      }

      if (!reduceMotion) {
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          // Measure the frame, not a <picture> wrapper (which has no box of its own).
          let frame = el.parentElement!;
          if (frame.tagName === "PICTURE") frame = frame.parentElement!;
          const r = frame.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const speed = parseFloat(el.dataset.parallax || "0");
          el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - vh / 2) * speed}px, 0)`;
        });
      }


      if (steps) {
        let reached = 0;
        if (pinned && processEl) {
          // 0 → 6 as you scroll through the pinned section; each step gets an equal share.
          const r = processEl.getBoundingClientRect();
          const a = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh))) * 6.6;
          reached = stepEls.filter((_, i) => a >= i + 0.3).length;
          steps.style.setProperty("--p", Math.min(1, Math.max(0, (a - 0.3) / 5)).toFixed(4));
        } else {
          // Stacked list: the line fills as you scroll; a step lights up as it passes 70% of the screen.
          const r = steps.getBoundingClientRect();
          steps.style.setProperty("--p", Math.min(1, Math.max(0, (vh * 0.7 - r.top - 32) / Math.max(1, r.height - 64))).toFixed(4));
          reached = stepEls.filter((el) => {
            const n = el.querySelector(".step__dot")!.getBoundingClientRect();
            return n.top + n.height / 2 < vh * 0.7;
          }).length;
        }
        if (reduceMotion) reached = stepEls.length;
        stepEls.forEach((el, i) => {
          el.classList.toggle("is-reached", i < reached);
          el.classList.toggle("is-current", !reduceMotion && i === reached - 1 && reached < stepEls.length);
        });
      }
    };

    const l = lenisRef.current;
    if (l) l.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { measurePin(); onScroll(); };
    window.addEventListener("resize", onResize);
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      mo.disconnect();
      l?.destroy();
      lenisRef.current = null;
    };
  }, [lenisRef, scrollTo, setMenuOpen]);

  return null;
}
