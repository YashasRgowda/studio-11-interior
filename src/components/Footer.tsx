"use client";

import { useEffect, useState } from "react";
import { ArrowIcon, Mark, PhoneIcon, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { MESSAGES, SVAYAM_WA, telHref, waHref } from "@/lib/contact";

export function Footer() {
  const { contact, services } = useContent();
  const { openBooking } = useUI();
  const [year, setYear] = useState(2026);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the year is read in the browser, not at build time
  useEffect(() => setYear(new Date().getFullYear()), []);
  const top = services.items.filter((s) => !s.hidden).slice(0, 4);

  return (
    <footer className="footer">
      <Mark className="footer__art" />
      <div className="footer__grid container-x">
        <div className="footer__brand">
          <Mark className="footer__mark" />
          <span className="footer__word">STUDIO 11</span>
          <span className="footer__sub">Interior</span>
        </div>

        <div className="footer__cta">
          <p className="footer__lead">Ready to start your home?</p>
          <p className="footer__note">The site visit and the quotation are free.</p>
          <div className="footer__cta-row">
            <button className="btn btn--lime" onClick={() => openBooking()}>Book Free Site Visit</button>
            <a className="btn btn--ghost-light" href={telHref(contact.phone)}><PhoneIcon />Call</a>
            <a className="btn btn--ghost-light" href={waHref(contact.whatsapp, MESSAGES.consult)} target="_blank" rel="noopener"><WhatsAppIcon />WhatsApp</a>
          </div>
        </div>

        <div className="footer__col">
          <p className="footer__head">Services</p>
          {top.map((s) => <a key={s.id} href="#services">{s.name.replace(/ Interiors$/, "")}</a>)}
        </div>
        <div className="footer__col">
          <p className="footer__head">Visit</p>
          <p>Hoskote, Bengaluru</p>
          <p>{contact.days}, {contact.hours}</p>
          <a href={contact.mapsUrl} target="_blank" rel="noopener">Get directions</a>
        </div>
        <div className="footer__col">
          <p className="footer__head">Contact</p>
          <a href={telHref(contact.phone)}>{contact.phone}</a>
          <a href={waHref(contact.whatsapp, MESSAGES.question)} target="_blank" rel="noopener">WhatsApp</a>
          {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener">Instagram</a>}
        </div>
      </div>

      <div className="footer__base container-x">
        <p>© {year} Studio 11 Interior. All rights reserved.</p>
        <a className="credit" href={SVAYAM_WA} target="_blank" rel="noopener" aria-label="Website crafted by svayam.ai. Get a website like this on WhatsApp, +91 80957 62180">
          <span className="credit__dot" aria-hidden="true" />
          <span className="credit__by">Website crafted by</span>
          <span className="credit__name">svayam.ai</span>
          <span className="credit__go" aria-hidden="true">
            <WhatsAppIcon />
            <span className="credit__go-text">Get a website like this</span>
            <ArrowIcon className="credit__arrow" />
          </span>
        </a>
        <p>Home interiors in Hoskote and across Bengaluru.</p>
      </div>
    </footer>
  );
}
