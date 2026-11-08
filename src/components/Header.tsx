"use client";

import { Mark, PhoneIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { telHref } from "@/lib/contact";

export function Header() {
  const { contact } = useContent();
  const { setMenuOpen, menuOpen, openBooking } = useUI();

  return (
    <header className="header" id="header">
      <div className="header__left">
        <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="menu">
          <span className="menu-toggle__icon"><i /><i /></span>
          <span>Menu</span>
        </button>
      </div>
      <a href="#top" className="header__brand" aria-label="Studio 11 Interior, back to top">
        <Mark className="header__mark" />
        <span className="header__word">Studio 11<small>Interior</small></span>
      </a>
      <div className="header__right">
        <a href={telHref(contact.phone)} className="header__call">Call {contact.phone}</a>
        <a href={telHref(contact.phone)} className="header__phone" aria-label={`Call Studio 11 on ${contact.phone}`}>
          <PhoneIcon />
        </a>
        <button className="btn btn--teak" onClick={() => openBooking()}>Book Free Site Visit</button>
      </div>
    </header>
  );
}
