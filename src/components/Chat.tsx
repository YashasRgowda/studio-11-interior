"use client";

// The chat helper: 6 short steps, mostly taps. At the end the enquiry is saved
// straight to the admin panel (Enquiries page). If that ever fails, WhatsApp opens
// with every answer typed, so no lead is lost.
// Answers are kept in the browser, so closing the chat by mistake loses nothing.

import { useCallback, useEffect, useRef, useState } from "react";
import { BackIcon, ChatIcon, CheckIcon, CloseIcon, Mark, WhatsAppIcon } from "./Icons";
import { useContent } from "@/lib/content";
import { useUI } from "@/lib/ui";
import { MESSAGES, waHref } from "@/lib/contact";
import { cleanPhone, prettyPhone, saveEnquiry } from "@/lib/enquiries";

type Goal = "quote" | "visit";
type Pick = "home" | "status" | "budget" | "start";
type Step = "intro" | "need" | Pick | "details" | "summary" | "sent";
type Answers = { goal?: Goal; need: string[]; home?: string; status?: string; budget?: string; start?: string; name?: string; phone?: string; area?: string };

const STORE = "studio11-chat-v1";
const NOT_SURE = "Not sure yet";
const NEEDS = ["Full home", "Kitchen", "Wardrobes", "TV & pooja", "Ceiling & lights", "Electrical", "Painting", "Renovation", NOT_SURE];
const FLOW: Step[] = ["need", "home", "status", "budget", "start", "details"];

const PICKS: Record<Pick, { q: string; note?: string; options: string[]; label: string }> = {
  home: { q: "What type of home is it?", label: "Home", options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+", "Villa / Independent house", "Office / Shop"] },
  status: { q: "Is the home ready for interiors?", label: "Home status", options: ["New home (keys received)", "Still being built", "Old home, needs a makeover"] },
  budget: { q: "What budget do you have in mind?", note: "This helps us suggest the right materials.", label: "Budget", options: ["₹2–4 Lakh", "₹4–7 Lakh", "₹7–10 Lakh", "Above ₹10 Lakh", NOT_SURE] },
  start: { q: "When would you like to start?", label: "Start", options: ["Right away", "In 1–3 months", "Just exploring"] },
};
const GOALS: Record<Goal, { label: string; line: string }> = {
  quote: { label: "Get a free quote", line: "Hi Studio 11, I would like a free quote for my home interiors." },
  visit: { label: "Book free site visit", line: "Hi Studio 11, I would like to book a free site visit." },
};
const EMPTY: Answers = { need: [] };

function Bot({ children, typing }: { children?: React.ReactNode; typing?: boolean }) {
  return (
    <div className="msg msg--bot">
      <span className="msg__avatar" aria-hidden="true"><Mark /></span>
      <div className="msg__bubble">{typing ? <span className="dots" aria-label="Typing"><i /><i /><i /></span> : children}</div>
    </div>
  );
}
const You = ({ children }: { children: React.ReactNode }) => <div className="msg msg--you"><div className="msg__bubble">{children}</div></div>;

export function Chat() {
  const { contact } = useContent();
  const { lenisRef } = useUI();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [a, setA] = useState<Answers>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [typing, setTyping] = useState(false);
  const [err, setErr] = useState<{ name?: boolean; phone?: boolean; area?: boolean }>({});
  const [sending, setSending] = useState(false);
  const [viaWa, setViaWa] = useState(false); // saving failed, so WhatsApp was opened instead
  const [ready, setReady] = useState(false); // saved answers restored; only then start saving
  const log = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const reduce = useRef(false);

  // Bring back unfinished answers.
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "null");
      /* eslint-disable react-hooks/set-state-in-effect -- restoring saved answers once, in the browser */
      // A chat that was already sent starts fresh next time.
      if (saved?.a && saved.step !== "sent") { setA({ ...EMPTY, ...saved.a }); setStep(saved.step || "intro"); }
    } catch { /* storage blocked: start fresh */ }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORE, JSON.stringify({ a, step })); } catch { /* storage blocked */ }
  }, [a, step, ready]);

  // Phones: the chat fills the screen, so the page behind stays still. Escape closes.
  useEffect(() => {
    if (!open) return;
    const lenis = lenisRef.current;
    const full = window.matchMedia("(max-width: 600px)").matches;
    if (full) { document.body.classList.add("is-locked"); lenis?.stop(); }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      if (full) { document.body.classList.remove("is-locked"); lenis?.start(); }
      document.removeEventListener("keydown", onKey);
    };
  }, [open, lenisRef]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = log.current;
    if (!el || !open) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: reduce.current ? "auto" : "smooth" }));
  }, [step, typing, open, a]);

  useEffect(() => {
    if (step === "details" && !typing && open && window.matchMedia("(hover: hover)").matches) nameRef.current?.focus({ preventScroll: true });
  }, [step, typing, open]);

  // Move to a step; the bot "types" for a moment first, like a real chat.
  const go = useCallback((next: Step) => {
    setStep(next);
    if (reduce.current || next === "sent") return;
    setTyping(true);
    window.setTimeout(() => setTyping(false), 650);
  }, []);
  const after = (s: Step): Step => (editing ? "summary" : FLOW[FLOW.indexOf(s) + 1] ?? "summary");
  const done = (s: Step) => { const n = after(s); setEditing(false); go(n); };

  const chooseGoal = (goal: Goal) => { setA((x) => ({ ...x, goal })); go("need"); };
  const toggleNeed = (n: string) =>
    setA((x) => {
      if (n === NOT_SURE) return { ...x, need: x.need.includes(n) ? [] : [n] };
      const rest = x.need.filter((v) => v !== NOT_SURE);
      return { ...x, need: rest.includes(n) ? rest.filter((v) => v !== n) : [...rest, n] };
    });
  const pick = (key: Pick, value: string) => { setA((x) => ({ ...x, [key]: value })); done(key); };
  const submitDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phone = cleanPhone(String(f.get("phone") || ""));
    const area = String(f.get("area") || "").trim();
    const bad = { name: !name, phone: !phone, area: !area };
    setErr(bad);
    if (bad.name || bad.phone || bad.area) return;
    setA((x) => ({ ...x, name, phone, area }));
    done("details");
  };
  const back = () => {
    setEditing(false);
    if (step === "summary" || step === "sent") return go("details");
    const i = FLOW.indexOf(step);
    setStep(i <= 0 ? "intro" : FLOW[i - 1]);
  };
  const edit = (s: Step) => { setEditing(true); go(s); };
  const restart = () => { setA(EMPTY); setEditing(false); setErr({}); setViaWa(false); go("intro"); };

  const message = [
    GOALS[a.goal || "quote"].line,
    "",
    `Name: ${a.name || ""}`,
    `Phone: ${a.phone ? prettyPhone(a.phone) : ""}`,
    `Area: ${a.area || ""}`,
    `Need: ${a.need.join(", ") || NOT_SURE}`,
    a.home ? `Home: ${a.home}` : "",
    a.status ? `Home status: ${a.status}` : "",
    a.budget ? `Budget: ${a.budget}` : "",
    a.start ? `Start: ${a.start}` : "",
  ].filter((l, i) => l || i === 1).join("\n");
  const openWa = () => window.open(waHref(contact.whatsapp, message), "_blank", "noopener");
  // Save to the admin panel; only if that fails, hand the message to WhatsApp.
  const send = async () => {
    if (sending) return;
    setSending(true);
    const ok = await saveEnquiry({
      name: a.name || "", phone: a.phone || "", area: a.area, need: a.need.join(", "),
      home: a.home, homeStatus: a.status, budget: a.budget, start: a.start,
      type: GOALS[a.goal || "quote"].label, source: "chat",
    });
    setSending(false);
    if (!ok) openWa();
    setViaWa(!ok);
    go("sent");
  };

  // The conversation so far: every answered step before the current one.
  const at = step === "summary" || step === "sent" ? FLOW.length : Math.max(0, FLOW.indexOf(step));
  const answered = step === "intro" ? [] : FLOW.slice(0, at);
  const answerOf = (s: Step) =>
    s === "need" ? a.need.join(", ") : s === "details" ? `${a.name} · ${prettyPhone(a.phone || "")} · ${a.area}` : (a[s as Pick] as string | undefined);
  const question = (s: Step) =>
    s === "need" ? "Great! What do you need? Pick all that apply." : s === "details" ? "Almost done! Where can we call you?" : PICKS[s as Pick].q;
  const stepNo = FLOW.indexOf(step) + 1;

  return (
    <>
      <button className={`chat-bubble${open ? " is-open" : ""}`} id="chatBubble" onClick={() => setOpen(true)} aria-label="Chat with Studio 11: get a free quote" aria-expanded={open}>
        <ChatIcon />
        <span className="chat-bubble__dot" aria-hidden="true" />
      </button>

      <div className={`chat${open ? " is-open" : ""}`} role="dialog" aria-modal="false" aria-label="Chat with Studio 11 Interior" aria-hidden={!open} inert={!open}>
        <header className="chat__head">
          {step !== "intro" && step !== "sent" ? (
            <button className="chat__icon" onClick={back} aria-label="Go back one step"><BackIcon /></button>
          ) : <span className="chat__logo" aria-hidden="true"><Mark /></span>}
          <div className="chat__who">
            <p className="chat__name">{"Studio 11 Interior"}</p>
            <p className="chat__status"><i aria-hidden="true" />We call you back · {contact.hours}</p>
          </div>
          <button className="chat__icon" onClick={() => setOpen(false)} aria-label="Close chat"><CloseIcon /></button>
        </header>
        {stepNo > 0 && (
          <div className="chat__progress" aria-label={`Step ${stepNo} of ${FLOW.length}`}>
            <span>Step {stepNo} of {FLOW.length}</span>
            <i><b style={{ transform: `scaleX(${stepNo / FLOW.length})` }} /></i>
          </div>
        )}

        <div className="chat__log" ref={log} data-lenis-prevent aria-live="polite">
          <Bot>Hello! Welcome to <b>Studio 11 Interior</b>.</Bot>
          <Bot>Planning interiors for your home? Answer 6 quick questions and our team will call you back.</Bot>
          {a.goal && step !== "intro" && <You>{GOALS[a.goal].label}</You>}

          {answered.map((s) => (
            <div key={s} className="msg-pair">
              <Bot>{question(s)}</Bot>
              <You>{answerOf(s)}</You>
            </div>
          ))}

          {FLOW.includes(step) && (
            <Bot typing={typing}>
              {question(step)}
              {step in PICKS && PICKS[step as Pick].note && <small>{PICKS[step as Pick].note}</small>}
            </Bot>
          )}

          {(step === "summary" || step === "sent") && (
            <>
              <Bot typing={typing}>Thank you, {a.name}! Here is your request. Check it once, then tap Send.</Bot>
              {!typing && (
                <div className="chat-card">
                  <p className="chat-card__head">{GOALS[a.goal || "quote"].label}</p>
                  <dl>
                    {[["Name", a.name, "details"], ["Phone", a.phone && prettyPhone(a.phone), "details"], ["Area", a.area, "details"], ["Need", a.need.join(", "), "need"],
                      ...(Object.keys(PICKS) as Pick[]).map((k) => [PICKS[k].label, a[k], k])].map(([label, value, s]) => value ? (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                        {step === "summary" && <button onClick={() => edit(s as Step)} aria-label={`Change ${label}`}>Edit</button>}
                      </div>
                    ) : null)}
                  </dl>
                </div>
              )}
            </>
          )}

          {step === "sent" && (viaWa ? (
            <Bot>We could not send it from here, so WhatsApp is open with your message. <b>Please press send there.</b></Bot>
          ) : (
            <Bot><b>Sent!</b> Our team will call you on {prettyPhone(a.phone || "")} soon. We work {contact.days.replace(/^open\s+/i, "")}, {contact.hours}.</Bot>
          ))}
        </div>

        {/* Answers: taps for most steps, two short fields for the last one */}
        <div className={`chat__foot${typing ? " is-waiting" : ""}`}>
          {step === "intro" && (
            <div className="chat__choices chat__choices--stack">
              <button className="chat-opt chat-opt--main" onClick={() => chooseGoal("quote")}>{GOALS.quote.label}</button>
              <button className="chat-opt" onClick={() => chooseGoal("visit")}>{GOALS.visit.label}</button>
              <a className="chat-opt chat-opt--wa" href={waHref(contact.whatsapp, MESSAGES.consult)} target="_blank" rel="noopener"><WhatsAppIcon />Just chat on WhatsApp</a>
            </div>
          )}

          {step === "need" && (
            <>
              <div className="chat__choices">
                {NEEDS.map((n) => (
                  <button key={n} className={`chat-opt${a.need.includes(n) ? " is-on" : ""}`} aria-pressed={a.need.includes(n)} onClick={() => toggleNeed(n)}>
                    {a.need.includes(n) && <CheckIcon />}{n}
                  </button>
                ))}
              </div>
              <button className="chat-next" disabled={!a.need.length} onClick={() => done("need")}>
                {a.need.length ? `Continue (${a.need.length} picked)` : "Pick at least one"}
              </button>
            </>
          )}

          {step in PICKS && (
            <div className="chat__choices">
              {PICKS[step as Pick].options.map((o) => (
                <button key={o} className={`chat-opt${a[step as Pick] === o ? " is-on" : ""}`} onClick={() => pick(step as Pick, o)}>{o}</button>
              ))}
            </div>
          )}

          {step === "details" && (
            <form className="chat__form" onSubmit={submitDetails} noValidate>
              <label className={`chat__wide${err.name ? " has-error" : ""}`}>
                <span>Your name</span>
                <input ref={nameRef} name="name" defaultValue={a.name} placeholder="Full name" autoComplete="name" onInput={() => setErr((e) => ({ ...e, name: false }))} />
              </label>
              <label className={err.phone ? "has-error" : undefined}>
                <span>Mobile number</span>
                <input name="phone" type="tel" inputMode="numeric" defaultValue={a.phone} placeholder="10-digit number" autoComplete="tel-national" maxLength={16} onInput={() => setErr((e) => ({ ...e, phone: false }))} />
              </label>
              <label className={err.area ? "has-error" : undefined}>
                <span>Your area</span>
                <input name="area" defaultValue={a.area} placeholder="e.g. Whitefield" autoComplete="address-level2" onInput={() => setErr((e) => ({ ...e, area: false }))} />
              </label>
              {(err.name || err.phone || err.area) && (
                <p className="chat__error">
                  {[err.name && "Please add your name.", err.phone && "Please type a 10-digit mobile number.", err.area && "Please add your area."].filter(Boolean).join(" ")}
                </p>
              )}
              <button className="chat-next" type="submit">Continue</button>
            </form>
          )}

          {step === "summary" && !typing && (
            <button className="chat-send" onClick={send} disabled={sending}>{sending ? "Sending…" : "Send enquiry"}</button>
          )}

          {step === "sent" && (
            <div className="chat__choices chat__choices--stack">
              {viaWa ? (
                <button className="chat-send" onClick={openWa}><WhatsAppIcon />Open WhatsApp again</button>
              ) : (
                <a className="chat-opt chat-opt--wa" href={waHref(contact.whatsapp, MESSAGES.consult)} target="_blank" rel="noopener"><WhatsAppIcon />Want to talk now? Chat on WhatsApp</a>
              )}
              <button className="chat-link" onClick={restart}>Start a new chat</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
