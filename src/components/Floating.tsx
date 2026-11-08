"use client";

import { PhoneIcon, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { MESSAGES, telHref, waHref } from "@/lib/contact";

// Desktop: a floating button, WhatsApp and back-to-top.
// Phones and tablets: one calm dock with Call · WhatsApp · Book.
export function Floating() {
  const { contact } = useContent();
  const { openBooking, scrollTo } = useUI();
  const wa = waHref(contact.whatsapp, MESSAGES.consult);
  return (
    <>
      <button className="float-cta" id="floatCta" onClick={() => openBooking()}>Book Free Site Visit</button>
      <a className="float-wa" id="floatWa" href={wa} target="_blank" rel="noopener" aria-label="Chat with Studio 11 on WhatsApp"><WhatsAppIcon /></a>
      <button className="to-top" id="toTop" onClick={() => scrollTo(0)} aria-label="Back to top">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
      </button>
      <nav className="dock" id="dock" aria-label="Quick actions">
        <a className="dock__btn" href={telHref(contact.phone)}><PhoneIcon /><span>Call</span></a>
        <a className="dock__btn" href={wa} target="_blank" rel="noopener"><WhatsAppIcon /><span>WhatsApp</span></a>
        <button className="dock__main" onClick={() => openBooking()}>Book Free Site Visit</button>
      </nav>
    </>
  );
}
