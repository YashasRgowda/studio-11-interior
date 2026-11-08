"use client";

// "Book Free Site Visit": a short form. The enquiry is saved straight to the
// admin panel (Enquiries page); only if that fails does WhatsApp open with the
// message typed, so no lead is lost. On phones it is a bottom sheet you can pull
// down to close.

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CloseIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { MESSAGES, telHref, waHref } from "@/lib/contact";
import { cleanPhone, prettyPhone, saveEnquiry } from "@/lib/enquiries";

const NOT_SURE = "Not sure yet";
const NEEDS = ["Full home", "Kitchen", "Wardrobes", "TV & pooja", "Ceiling & lights", "Electrical", "Painting", "Renovation", NOT_SURE];
const HOMES = ["1 BHK", "2 BHK", "3 BHK", "4 BHK+", "Villa", "Office / Shop", "Other"];

// What a service button pre-selects in the form.
const PREFILL: Record<string, { need?: string; home?: string }> = {
  "full-home": { need: "Full home" },
  kitchen: { need: "Kitchen" },
  wardrobes: { need: "Wardrobes" },
  living: { need: "TV & pooja" },
  ceiling: { need: "Ceiling & lights" },
  electrical: { need: "Electrical" },
  painting: { need: "Painting" },
  villas: { need: "Full home", home: "Villa" },
  offices: { home: "Office / Shop" },
  renovation: { need: "Renovation" },
};

export function BookingSheet() {
  const { contact, services } = useContent();
  const { booking, closeBooking, lenisRef } = useUI();
  const panel = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [needs, setNeeds] = useState<string[]>([]);
  const [home, setHome] = useState("");
  const [interest, setInterest] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ name: string; phone: string; viaWa: boolean } | null>(null);
  const drag = useRef<number | null>(null);

  // Apply what the visitor tapped ("Ask about this" on Kitchen, a package, ...).
  useEffect(() => {
    if (!booking.open) return;
    /* eslint-disable react-hooks/set-state-in-effect -- the form is prefilled each time it opens */
    setErrors({});
    setDone(null);
    const svc = services.items.find((s) => s.name === booking.service);
    const pre = svc ? PREFILL[svc.id] : undefined;
    if (pre?.need) setNeeds((n) => (n.includes(pre.need!) ? n : [...n.filter((x) => x !== NOT_SURE), pre.need!]));
    if (pre?.home) setHome(pre.home);
    setInterest(booking.service && !svc ? booking.service : null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [booking.open, booking.service, services.items]);

  // Lock the page behind the sheet; Escape closes it.
  useEffect(() => {
    if (!booking.open) return;
    const lenis = lenisRef.current;
    const sheet = panel.current;
    document.body.classList.add("is-locked");
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBooking();
    document.addEventListener("keydown", onKey);
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setTimeout(() => form.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true }), 500);
    }
    return () => {
      document.body.classList.remove("is-locked");
      lenis?.start();
      document.removeEventListener("keydown", onKey);
      if (sheet) sheet.style.transform = "";
    };
  }, [booking.open, closeBooking, lenisRef]);

  const toggleNeed = (n: string) => {
    setNeeds((cur) => {
      if (n === NOT_SURE) return cur.includes(n) ? [] : [n];
      const next = cur.filter((x) => x !== NOT_SURE);
      return next.includes(n) ? next.filter((x) => x !== n) : [...next, n];
    });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phone = cleanPhone(String(f.get("phone") || ""));
    const area = String(f.get("area") || "").trim();
    const errs = { name: !name, phone: !phone, area: !area, home: !home };
    setErrors(errs);
    if (errs.name || errs.phone || errs.area || errs.home) {
      const first = errs.name ? "name" : errs.phone ? "phone" : errs.area ? "area" : "home";
      form.current?.querySelector<HTMLElement>(`[name=${first}]`)?.focus();
      return;
    }
    const need = [interest ? `Interested in: ${interest}` : "", needs.join(", ")].filter(Boolean).join(" · ");
    setSending(true);
    const ok = await saveEnquiry({ name, phone, area, home, need, type: "Book free site visit", source: "form" });
    setSending(false);
    if (!ok) {
      const lines = [
        "Hi Studio 11, I would like to book a free site visit.",
        "",
        `Name: ${name}`,
        `Phone: ${prettyPhone(phone)}`,
        `Area: ${area}`,
        `Home: ${home}`,
        need ? `Need: ${need}` : "",
      ].filter((l, i) => l || i === 1);
      window.open(waHref(contact.whatsapp, lines.join("\n")), "_blank", "noopener");
    }
    form.current?.reset();
    setNeeds([]);
    setHome("");
    setDone({ name, phone, viaWa: !ok });
  };

  // Phones: pull the sheet down by its handle to close it.
  const onGrabDown = (e: React.PointerEvent) => {
    drag.current = e.clientY;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* released */ }
    panel.current?.classList.add("is-dragging");
  };
  const onGrabMove = (e: React.PointerEvent) => {
    if (drag.current === null || !panel.current) return;
    panel.current.style.transform = `translateY(${Math.max(0, e.clientY - drag.current)}px)`;
  };
  const onGrabEnd = (e: React.PointerEvent) => {
    if (drag.current === null || !panel.current) return;
    const pulled = e.clientY - drag.current;
    drag.current = null;
    panel.current.classList.remove("is-dragging");
    if (pulled > 90) closeBooking();
    else panel.current.style.transform = "";
  };

  return (
    <div className={`sheet${booking.open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="sheetTitle" aria-hidden={!booking.open} inert={!booking.open}>
      <div className="sheet__backdrop" onClick={closeBooking} />
      <div className="sheet__panel" ref={panel} data-lenis-prevent>
        <div className="sheet__grab" aria-hidden="true" onPointerDown={onGrabDown} onPointerMove={onGrabMove} onPointerUp={onGrabEnd} onPointerCancel={onGrabEnd}><span /></div>
        <button className="sheet__close" onClick={closeBooking} aria-label="Close"><CloseIcon /></button>

        <h2 className="sheet__title" id="sheetTitle">Book a <em>Free Site Visit</em></h2>
        <p className="sheet__lead">We will call you to fix a time.</p>

        {done && (
          <div className="sheet__done" role="status">
            <span className="sheet__done-icon" aria-hidden="true"><CheckIcon /></span>
            {done.viaWa ? (
              <>
                <p className="sheet__done-title">Almost done, {done.name}!</p>
                <p className="sheet__done-text">We could not send it from here, so WhatsApp is open with your message. Please press send there.</p>
              </>
            ) : (
              <>
                <p className="sheet__done-title">Thank you, {done.name}!</p>
                <p className="sheet__done-text">Your request has reached our team. We will call you on <b>{prettyPhone(done.phone)}</b> soon. We work {contact.days.replace(/^open\s+/i, "")}, {contact.hours}.</p>
              </>
            )}
            <button className="btn btn--teak btn--block sheet__submit" onClick={closeBooking}>Done</button>
            <a className="sheet__call" href={waHref(contact.whatsapp, MESSAGES.consult)} target="_blank" rel="noopener">Want to talk now? Chat on WhatsApp</a>
          </div>
        )}

        <form className="form" ref={form} onSubmit={submit} noValidate autoComplete="on" hidden={!!done}>
          <div className="field-row">
            <label className={`field${errors.name ? " has-error" : ""}`}>
              <span>Name</span>
              <input name="name" type="text" placeholder="Your name" autoComplete="name" aria-invalid={errors.name || undefined} />
              {errors.name && <em className="field__error">Please add your name</em>}
            </label>
            <label className={`field${errors.phone ? " has-error" : ""}`}>
              <span>Mobile</span>
              <input name="phone" type="tel" inputMode="numeric" placeholder="10-digit number" autoComplete="tel-national" maxLength={16} aria-invalid={errors.phone || undefined} />
              {errors.phone && <em className="field__error">Please type a 10-digit number</em>}
            </label>
          </div>

          <div className="field-row">
            <label className={`field${errors.area ? " has-error" : ""}`}>
              <span>Area</span>
              <input name="area" type="text" placeholder="e.g. Whitefield" autoComplete="address-level2" aria-invalid={errors.area || undefined} />
              {errors.area && <em className="field__error">Please add your area</em>}
            </label>
            <label className={`field${errors.home ? " has-error" : ""}`}>
              <span>Home type</span>
              <select name="home" value={home} onChange={(e) => setHome(e.target.value)} aria-invalid={errors.home || undefined}>
                <option value="" disabled>Select</option>
                {HOMES.map((h) => <option key={h}>{h}</option>)}
              </select>
              {errors.home && <em className="field__error">Please choose one</em>}
            </label>
          </div>

          <fieldset className="field">
            <legend>What do you need?</legend>
            <div className="picks">
              {NEEDS.map((n) => (
                <label className="pick" key={n}>
                  <input type="checkbox" checked={needs.includes(n)} onChange={() => toggleNeed(n)} />
                  <span>{n}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="sheet__send">
            <button className="btn btn--teak btn--block sheet__submit" type="submit" disabled={sending}>{sending ? "Sending…" : "Send request"}</button>
            <a className="sheet__call" href={telHref(contact.phone)}>Or call {contact.phone}</a>
          </div>
        </form>
      </div>
    </div>
  );
}
