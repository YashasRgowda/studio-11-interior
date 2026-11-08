"use client";

// Opening curtain: the doorway mark draws itself line by line, then the curtain
// lifts and the hero's door opens. Plays once per visit; a tap skips it.

import { useEffect, useRef, useState } from "react";
import { Mark } from "./Icons";
import { useUI } from "@/lib/ui";

const SEEN_KEY = "studio11-intro";

export function Intro() {
  const { lenisRef } = useUI();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"playing" | "done" | "gone">("playing");

  useEffect(() => {
    const intro = ref.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroImg = document.querySelector<HTMLImageElement>(".hero__frame img");
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const heroReady = new Promise<void>((resolve) => {
      if (!heroImg || (heroImg.complete && heroImg.naturalWidth)) return resolve();
      heroImg.addEventListener("load", () => resolve(), { once: true });
      heroImg.addEventListener("error", () => resolve(), { once: true });
      setTimeout(resolve, 4500);
    });
    const start = () => requestAnimationFrame(() => document.body.classList.add("is-loaded"));

    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage blocked */
    }

    let cancelled = false;
    if (seen || reduceMotion || !intro) {
      setState("gone");
      heroReady.then(() => !cancelled && start());
      return () => {
        cancelled = true;
      };
    }

    document.body.classList.add("is-locked");
    lenisRef.current?.stop();
    const tap = new Promise<void>((r) => intro.addEventListener("click", () => r(), { once: true }));
    Promise.all([heroReady, Promise.race([wait(2300), tap])]).then(() => {
      if (cancelled) return;
      setState("done");
      start();
      document.body.classList.remove("is-locked");
      lenisRef.current?.start();
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage blocked */
      }
      setTimeout(() => !cancelled && setState("gone"), 1400);
    });
    return () => {
      cancelled = true;
    };
  }, [lenisRef]);

  if (state === "gone") return null;
  return (
    <div className={`intro${state === "done" ? " is-done" : ""}`} ref={ref} aria-hidden="true">
      <div className="intro__inner">
        <Mark className="intro__mark" />
        <span className="intro__word">STUDIO 11</span>
        <span className="intro__sub">Interior</span>
      </div>
      <span className="intro__skip">Tap to skip</span>
    </div>
  );
}
