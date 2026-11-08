"use client";

// Home (new enquiries first, then a tile for each part of the website)
// and Enquiries (follow up every lead: call, WhatsApp, status, delete, Excel).

import { useMemo, useState } from "react";
import { STATUSES, prettyPhone, type Enquiry, type EnquiryStatus } from "@/lib/enquiries";
import { telHref, waHref } from "@/lib/contact";
import { Icon, PageHead, useAdmin, type PageId } from "./ui";
import { NAV } from "./nav";

/* ---------- Dates ---------- */
const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }) : null;
export function timeAgo(d: Date | null) {
  if (!d) return "Just now";
  const s = (d.getTime() - Date.now()) / 1000;
  const abs = Math.abs(s);
  if (abs < 60) return "Just now";
  if (abs < 3600) return rtf!.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf!.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 7) return rtf!.format(Math.round(s / 86400), "day");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
const fullDate = (d: Date | null) =>
  d ? d.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";

const customerWa = (e: Enquiry) =>
  waHref(e.phone, `Hi ${e.name}, this is Studio 11 Interior. Thank you for your enquiry. When is a good time to talk about your home?`);

const statusLabel = (s: EnquiryStatus) => STATUSES.find((x) => x.key === s)?.label || s;

/* ==========================================================================
   Home
   ========================================================================== */
export function HomePage() {
  const { enquiries, enqReady, go } = useAdmin();
  const fresh = enquiries.filter((e) => e.status === "new");
  const tiles = NAV.filter((n): n is { id: PageId; label: string; icon: keyof typeof Icon; text: string } => "id" in n && !!n.text && n.id !== "enquiries");

  return (
    <>
      <PageHead eyebrow="Welcome" title="Hello! Here is your day." text="New enquiries first. Then pick any part of your website to change it." />

      <section className={`a-card a-newbox${fresh.length ? " has-new" : ""}`}>
        <div className="a-newbox__top">
          <div>
            <p className="a-newbox__count">{enqReady ? fresh.length : "…"}</p>
            <p className="a-newbox__label">{fresh.length === 1 ? "New enquiry" : "New enquiries"}</p>
          </div>
          <button className="a-btn a-btn--primary" type="button" onClick={() => go("enquiries")}>See all enquiries <Icon.arrow /></button>
        </div>
        {enqReady && fresh.length === 0 && (
          <p className="a-newbox__empty">No new enquiries right now. When someone sends one from the website, it shows here straight away.</p>
        )}
        {fresh.length > 0 && (
          <ul className="a-mini">
            {fresh.slice(0, 3).map((e) => (
              <li key={e.id}>
                <div className="a-mini__main">
                  <p className="a-mini__name">{e.name}</p>
                  <p className="a-mini__meta">{[e.area, e.home, e.need].filter(Boolean).join(" · ")}</p>
                </div>
                <span className="a-mini__time" title={fullDate(e.createdAt)}>{timeAgo(e.createdAt)}</span>
                <a className="a-act" href={telHref(e.phone)}><Icon.phone /> Call</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2 className="a-subhead">Change your website</h2>
      <div className="a-tiles">
        {tiles.map((t) => {
          const C = Icon[t.icon];
          return (
            <button key={t.id} className="a-tile" type="button" onClick={() => go(t.id)}>
              <span className="a-tile__icon"><C /></span>
              <span>
                <span className="a-tile__name">{t.label}</span>
                <span className="a-tile__text">{t.text}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ==========================================================================
   Enquiries
   ========================================================================== */
type Tab = "all" | EnquiryStatus;

function toCsv(rows: Enquiry[]) {
  const head = ["Date", "Name", "Phone", "Area", "Need", "Home", "Home status", "Budget", "Start", "Asked for", "From", "Status"];
  const cell = (v: string) => `"${String(v || "").replace(/"/g, '""')}"`;
  const lines = rows.map((e) => [
    e.createdAt ? e.createdAt.toLocaleString("en-IN") : "", e.name, prettyPhone(e.phone), e.area, e.need, e.home, e.homeStatus,
    e.budget, e.start, e.type, e.source === "chat" ? "Website chat" : "Booking form", statusLabel(e.status),
  ].map((v) => cell(v || "")).join(","));
  return "﻿" + [head.map(cell).join(","), ...lines].join("\r\n");
}

export function EnquiriesPage() {
  const { enquiries, enqReady, setStatus, removeEnquiry, confirm, toast } = useAdmin();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: enquiries.length, new: 0, called: 0, visit: 0, closed: 0 };
    enquiries.forEach((e) => { c[e.status] = (c[e.status] || 0) + 1; });
    return c;
  }, [enquiries]);
  const weekAgo = Date.now() - 7 * 86400 * 1000; // eslint-disable-line react-hooks/purity -- "this week" is counted from now
  const thisWeek = enquiries.filter((e) => e.createdAt && e.createdAt.getTime() > weekAgo).length;

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    return enquiries.filter((e) => {
      if (tab !== "all" && e.status !== tab) return false;
      if (!term) return true;
      if (digits.length >= 3 && e.phone.includes(digits)) return true;
      return [e.name, e.area, e.need, e.home].some((v) => (v || "").toLowerCase().includes(term));
    });
  }, [enquiries, tab, q]);

  const download = () => {
    if (!shown.length) return toast("There are no enquiries to download here.", true);
    const blob = new Blob([toCsv(shown)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const t = new Date();
    a.download = `studio11-enquiries-${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`${shown.length} ${shown.length === 1 ? "enquiry" : "enquiries"} downloaded. Open the file in Excel.`);
  };

  const remove = async (e: Enquiry) => {
    const yes = await confirm({ title: `Delete ${e.name}’s enquiry?`, text: "It will be removed for good. You cannot undo this. Tip: mark it “Closed” instead if you only want it out of the way.", yes: "Yes, delete", danger: true });
    if (yes) await removeEnquiry(e);
  };

  const tabs: { key: Tab; label: string }[] = [{ key: "all", label: "All" }, ...STATUSES];

  return (
    <>
      <PageHead eyebrow="Leads" title="Enquiries" text="Everyone who asked for a quote or a site visit on your website. New ones appear here by themselves.">
        <button className="a-btn a-btn--light a-btn--lg" type="button" onClick={download}><Icon.download /> Download for Excel</button>
      </PageHead>

      <div className="a-stats">
        <div className="a-stat a-stat--new"><b>{counts.new}</b><span>New</span></div>
        <div className="a-stat"><b>{thisWeek}</b><span>This week</span></div>
        <div className="a-stat"><b>{counts.all}</b><span>Total</span></div>
      </div>

      <div className="a-filters">
        <div className="a-tabs" role="tablist" aria-label="Show enquiries">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`a-tab${tab === t.key ? " is-active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}<span>{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <label className="a-search">
          <Icon.search />
          <input type="search" placeholder="Search name, phone or area" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enquiries" />
        </label>
      </div>

      {!enqReady ? (
        <p className="a-empty">Loading enquiries…</p>
      ) : shown.length === 0 ? (
        <p className="a-empty">
          {enquiries.length === 0
            ? "No enquiries yet. When someone sends one from the website chat or the “Book Free Site Visit” form, it shows here straight away."
            : q ? `Nothing found for “${q}”.` : `No enquiries marked “${tabs.find((t) => t.key === tab)?.label}”.`}
        </p>
      ) : (
        <div className="a-list">
          {shown.map((e) => {
            const details = ([["Need", e.need], ["Home", e.home], ["Home status", e.homeStatus], ["Budget", e.budget], ["Start", e.start]] as const).filter(([, v]) => v);
            return (
              <article key={e.id} className={`a-enq is-${e.status}`}>
                <div className="a-enq__top">
                  <div className="a-enq__who">
                    <h3 className="a-enq__name">{e.name}</h3>
                    <span className={`a-pill a-pill--${e.status}`}>{statusLabel(e.status)}</span>
                  </div>
                  <p className="a-enq__when" title={fullDate(e.createdAt)}>{timeAgo(e.createdAt)}</p>
                </div>
                <p className="a-enq__contact">
                  <a href={telHref(e.phone)}>{prettyPhone(e.phone)}</a>
                  {e.area && <span><Icon.pin />{e.area}</span>}
                </p>
                {details.length > 0 && (
                  <dl className="a-enq__details">
                    {details.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                )}
                <p className="a-enq__from">
                  {e.type || "Enquiry"} · from the {e.source === "chat" ? "website chat" : "booking form"} · {fullDate(e.createdAt)}
                </p>
                <div className="a-enq__actions">
                  <a className="a-act a-act--call" href={telHref(e.phone)}><Icon.phone /> Call</a>
                  <a className="a-act a-act--wa" href={customerWa(e)} target="_blank" rel="noopener"><Icon.whatsapp /> WhatsApp</a>
                  <label className="a-status">
                    <span>Status</span>
                    <select value={e.status} onChange={(ev) => setStatus(e, ev.target.value as EnquiryStatus)} aria-label={`Status for ${e.name}`}>
                      {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </label>
                  <button className="a-act a-act--danger" type="button" onClick={() => remove(e)}><Icon.trash /> Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
