"use client";

// Shared UI state: the menu, the booking sheet and smooth scrolling.

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type Lenis from "lenis";

type UI = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  booking: { open: boolean; service: string | null };
  openBooking: (service?: string | null) => void;
  closeBooking: () => void;
  lenisRef: React.RefObject<Lenis | null>;
  scrollTo: (target: string | number) => void;
};

const UIContext = createContext<UI | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [booking, setBooking] = useState<{ open: boolean; service: string | null }>({ open: false, service: null });
  const lenisRef = useRef<Lenis | null>(null);

  const openBooking = useCallback((service?: string | null) => {
    setMenuOpen(false);
    setBooking({ open: true, service: service ?? null });
  }, []);
  const closeBooking = useCallback(() => setBooking((b) => ({ ...b, open: false })), []);

  const scrollTo = useCallback((target: string | number) => {
    const el = typeof target === "number" ? target : target === "#top" ? 0 : document.querySelector<HTMLElement>(target);
    if (el === null) return;
    const lenis = lenisRef.current;
    if (lenis) {
      // A menu link is tapped while the menu still has scrolling paused. Resume first:
      // resuming later would cancel this scroll.
      if (lenis.isStopped) lenis.start();
      lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    }
    else if (typeof el === "number") window.scrollTo({ top: el, behavior: "smooth" });
    else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const value = useMemo(
    () => ({ menuOpen, setMenuOpen, booking, openBooking, closeBooking, lenisRef, scrollTo }),
    [menuOpen, booking, openBooking, closeBooking, scrollTo],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UI {
  const ui = useContext(UIContext);
  if (!ui) throw new Error("useUI must be used inside <UIProvider>");
  return ui;
}
