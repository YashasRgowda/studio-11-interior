"use client";

import { Fragment } from "react";
import { Img } from "./Img";
import { ArrowIcon, CheckIcon, Mark, PinIcon, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { MESSAGES, telHref, waHref } from "@/lib/contact";

/* ---------- Facts: the numbers people trust ---------- */
export function Facts() {
  const { facts } = useContent();
  return (
    <section className="facts" aria-label="Studio 11 in numbers">
      <div className="container-x">
        <ul className="facts__row" data-stagger>
          {facts.items.map((f, i) => (
            <li className="fact" key={i} data-reveal>
              <span className="fact__value">{f.value}</span>
              <span className="fact__label">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- About: what Studio 11 does, in one breath ---------- */
const WE_DO = ["Modular Kitchen", "Wardrobes", "TV & Pooja Units", "False Ceiling", "Lighting", "Electrical", "Painting", "Wallpaper"];

export function About() {
  return (
    <section className="about" id="about">
      <div className="container-narrow" data-stagger>
        <p className="kicker kicker--center" data-reveal>Welcome to Studio 11</p>
        <h2 className="title" data-reveal>Everything Inside Your Home. <br /><em>Except Construction.</em></h2>
        <p className="about__lead" data-reveal>We design it. We build it. You move in.</p>
      </div>
      <div className="container-x">
        <ul className="about__grid" data-reveal aria-label="What we do">
          {WE_DO.map((w) => <li key={w}>{w}</li>)}
        </ul>
        <div className="about__more" data-reveal>
          <a href="#services" className="link">See all services<ArrowIcon /></a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Packages: shown only when real prices are saved ---------- */
export function Packages() {
  const { packages } = useContent();
  const { openBooking } = useUI();
  const items = packages.items.filter((p) => !p.hidden);
  if (!items.length) return null;
  return (
    <section className="packages" id="packages">
      <div className="container-narrow" data-stagger>
        <p className="kicker kicker--center" data-reveal>Packages</p>
        <h2 className="title" data-reveal>Clear Prices for <em>Every Home Size</em></h2>
      </div>
      <div className="container-x">
        <div className="packages__grid" data-stagger>
          {items.map((p, i) => (
            <article className="pkg" key={i} data-reveal>
              <h3 className="pkg__name">{p.name}</h3>
              <p className="pkg__from">Starting from</p>
              <p className="pkg__price">{p.price}</p>
              {p.includes.length > 0 && (
                <ul className="pkg__list">
                  {p.includes.map((line, j) => <li key={j}><CheckIcon />{line}</li>)}
                </ul>
              )}
              <button className="btn btn--teak btn--block" onClick={() => openBooking(`${p.name} package`)}>Get Exact Quote</button>
            </article>
          ))}
        </div>
        {packages.note && <p className="packages__note" data-reveal>{packages.note}</p>}
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
// Line icons for the six steps (32 × 32). They draw themselves when a step is reached.
const STEP_ICONS: string[][] = [
  // talk: a chat bubble
  ["M6 8.5A2.5 2.5 0 0 1 8.5 6H23.5A2.5 2.5 0 0 1 26 8.5V18.5A2.5 2.5 0 0 1 23.5 21H14L9 25.5V21H8.5A2.5 2.5 0 0 1 6 18.5Z", "M11 12.5H21", "M11 16H17"],
  // site visit: a house being measured
  ["M5 15L16 6L27 15", "M8 12.8V26H24V12.8", "M12 20.5H20", "M12 18.5V22.5", "M20 18.5V22.5"],
  // quotation: a price sheet with the rupee sign
  ["M9 5H19L24 10V27H9Z", "M19 5V10H24", "M13 14H19.5", "M13 17H19.5", "M15 14C18.6 14 18.6 20 15 20H13L18.5 24.5"],
  // 3D design: a cube
  ["M16 5L26 10.5V21.5L16 27L6 21.5V10.5Z", "M6 10.5L16 16L26 10.5", "M16 16V27"],
  // work starts: a hammer
  ["M14.5 9.5L19.5 4.5L25.5 10.5L20.5 15.5Z", "M17.5 12.5L6.5 23.5A1.6 1.6 0 0 0 8.5 25.5L19.5 14.5", "M24 20V24", "M22 22H26"],
  // handover: a key
  ["M6 21A5 5 0 1 0 16 21A5 5 0 1 0 6 21Z", "M14.6 17.4L26 6", "M22 10L25 13", "M19.5 12.5L22 15"],
];

const STEPS = [
  { title: "Talk to Us", text: "Call or WhatsApp. Tell us what you need.", free: true },
  { title: "Site Visit", text: "We visit your home and take measurements.", free: true },
  { title: "Quotation", text: "You get a clear price before you decide.", free: true },
  { title: "3D Design", text: "See your home in 3D before work starts.", free: false },
  { title: "Work Starts", text: "Our team builds and fits everything.", free: false },
  { title: "Handover", text: "Move in. Your 1-year service warranty starts.", free: false },
];

export function Process() {
  const { openBooking } = useUI();
  return (
    <section className="process" id="process">
      {/* On big screens this part stays in place while you scroll, and the steps light up one by one. */}
      <div className="process__pin">
        <div className="process__head container-narrow" data-stagger>
          <p className="kicker kicker--center" data-reveal>How It Works</p>
          <h2 className="process__title" data-reveal>Six Simple <em>Steps</em></h2>
        </div>
        <div className="container-x">
          <div className="phases" aria-hidden="true">
            <span className="phase phase--free">Free</span>
            <span className="phase">After you book</span>
          </div>
          <ol className="steps">
            <li className="steps__track" aria-hidden="true"><span className="steps__fill" /></li>
            {STEPS.map((s, i) => (
              <li className="step" key={s.title}>
                <span className="step__dot" aria-hidden="true">
                  <svg className="step__ghost" viewBox="0 0 32 32">
                    {STEP_ICONS[i].map((d) => <path key={d} d={d} />)}
                  </svg>
                  <svg className="step__ink" viewBox="0 0 32 32">
                    {STEP_ICONS[i].map((d) => <path key={d} d={d} pathLength={1} />)}
                  </svg>
                </span>
                <span className="step__num">Step {i + 1}</span>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__text">{s.text}</p>
                {s.free && <span className="step__tag">Free</span>}
              </li>
            ))}
          </ol>
          <div className="process__cta">
            <button className="btn btn--teak" onClick={() => openBooking()}>Book Free Site Visit</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Full-bleed quote ---------- */
// Each word rises out of its own mask, one after another.
const QUOTE_LINES = ["Your home,", "the way you imagined it."];

export function Quote() {
  const { quote } = useContent();
  return (
    <section className="quote" aria-label="Studio 11">
      <div className="quote__media">
        <Img src={quote.image} alt="" widths={[800, 1400, 2000, 2600]} tall parallax={0.12} />
      </div>
      <div className="quote__content">
        <div className="seal" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs><path id="sealPath" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" /></defs>
            <text><textPath href="#sealPath">STUDIO 11 · INTERIOR · BENGALURU · </textPath></text>
          </svg>
          <Mark />
        </div>
        <p className="quote__text" data-reveal aria-label="Your home, the way you imagined it.">
          {QUOTE_LINES.map((line, l) => {
            const words = line.split(" ");
            const Tag = l === 0 ? "span" : "em";
            return (
              <Tag key={line} aria-hidden="true">
                {words.map((w, i) => (
                  <Fragment key={i}>
                    <span className="w"><span style={{ "--i": l * 2 + i } as React.CSSProperties}>{w}</span></span>
                    {i < words.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </Tag>
            );
          })}
        </p>
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
export function Contact() {
  const { contact } = useContent();
  const { openBooking } = useUI();
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&z=15&output=embed`;
  return (
    <section className="contact" id="contact">
      <div className="contact__grid container-x">
        <div className="contact__text" data-stagger>
          <p className="kicker" data-reveal>Contact Us</p>
          <h2 className="title" data-reveal>Talk to Us About <br /><em>Your Home</em></h2>
          <dl className="info" data-reveal>
            <div className="info--wide">
              <dt>Office</dt>
              <dd>{contact.address}<br />Visit our office, or we come to your home.</dd>
            </div>
            <div>
              <dt>Phone &amp; WhatsApp</dt>
              <dd><a className="info__phone" href={telHref(contact.phone)}>{contact.phone}</a></dd>
            </div>
            <div>
              <dt>Timings</dt>
              <dd>{contact.days}<br />{contact.hours}</dd>
            </div>
            <div className="info--wide">
              <dt>Areas</dt>
              <dd>{contact.serviceArea}</dd>
            </div>
            {contact.email && (
              <div>
                <dt>Email</dt>
                <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
              </div>
            )}
          </dl>
          <div className="contact__actions" data-reveal>
            <button className="btn btn--teak" onClick={() => openBooking()}>Book Free Site Visit</button>
            <a className="btn btn--ghost" href={waHref(contact.whatsapp, MESSAGES.question)} target="_blank" rel="noopener"><WhatsAppIcon />WhatsApp Us</a>
          </div>
        </div>
        <div className="contact__map" data-reveal>
          <iframe src={map} title="Studio 11 Interior on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <a className="contact__map-pin" href={contact.mapsUrl} target="_blank" rel="noopener"><PinIcon />Get directions</a>
        </div>
      </div>
    </section>
  );
}
