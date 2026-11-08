"use client";

// Our Services: one clear card per service (photo, name, one line).
// Tapping a card opens the booking form with that service already picked.

import { Img } from "./Img";
import { ArrowIcon, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { MESSAGES, waHref } from "@/lib/contact";

// The first two services get big cards; the rest sit four to a row.
const FEATURED = 2;

export function Services() {
  const { services, contact } = useContent();
  const { openBooking } = useUI();
  const visible = services.items.filter((s) => !s.hidden && s.name);

  return (
    <section className="services" id="services">
      <div className="services__head container-narrow" data-stagger>
        <p className="kicker kicker--center" data-reveal>What We Do</p>
        <h2 className="title" data-reveal>Our <em>Services</em></h2>
        <p className="services__lead" data-reveal>Tap any service to ask us about it.</p>
      </div>

      <div className="container-x">
        <ul className="svc-grid" data-stagger>
          {visible.map((s, i) => {
            const big = i < FEATURED;
            return (
              <li className={`svc${big ? " svc--big" : ""}`} key={s.id} data-reveal>
                <button className="svc__card" onClick={() => openBooking(s.name)} aria-label={`${s.name}: ask about this`}>
                  <span className="svc__media">
                    <Img
                      src={s.image}
                      alt=""
                      widths={big ? [600, 900, 1200] : [360, 540, 720]}
                      ratio={big ? 0.66 : 1.2}
                      sizes={big ? "(max-width: 700px) 100vw, 50vw" : "(max-width: 700px) 50vw, 25vw"}
                    />
                  </span>
                  <span className="svc__name">{s.name}</span>
                  <span className="svc__desc">{s.description}</span>
                  <span className="svc__ask">Ask about this<ArrowIcon /></span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="services__ask" data-reveal>
          <p>Not sure what you need?</p>
          <a className="btn btn--ghost" href={waHref(contact.whatsapp, MESSAGES.suggest)} target="_blank" rel="noopener"><WhatsAppIcon />Ask us on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
