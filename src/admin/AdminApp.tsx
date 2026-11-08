"use client";

// Studio 11 Admin: change the website and follow up enquiries, without a developer.
// Same layout as the EVA admin: dark sidebar, plain-English pages in the same
// order as the website, one "Save changes" bar, "Are you sure?" before deleting.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { DEFAULTS } from "@/content/defaults";
import type { SiteContent } from "@/content/types";
import { ADMIN_EMAIL } from "@/lib/firebase-config";
import { STATUSES, type Enquiry, type EnquiryStatus } from "@/lib/enquiries";
import { Mark } from "@/components/Icons";
import { sized } from "@/lib/img";
import { fb } from "./firebase";
import { Ctx, Icon, clone, type AdminCtx, type ConfirmOpts, type PageId } from "./ui";
import { NAV } from "./nav";
import { EnquiriesPage, HomePage } from "./pages-leads";
import { BannerPage, ContactPage, GalleryPage, NumbersPage, PackagesPage, PhotosPage, ReviewsPage, ServicesPage } from "./pages-site";
import "./admin.css";

const PAGES: Record<PageId, () => ReactNode> = {
  home: HomePage, enquiries: EnquiriesPage, banner: BannerPage, numbers: NumbersPage, services: ServicesPage,
  packages: PackagesPage, photos: PhotosPage, gallery: GalleryPage, reviews: ReviewsPage, contact: ContactPage,
};
const isPage = (id: string): id is PageId => id in PAGES;

function friendlyError(err: unknown) {
  const code = (err as { code?: string })?.code || "";
  if (code.includes("permission-denied")) return "You are not allowed to do this. Please log out and log in again.";
  if (code.includes("unavailable") || !navigator.onLine) return "No internet connection. Please try again.";
  return "Something went wrong. Please try again.";
}

/* ==========================================================================
   Login
   ========================================================================== */
function Login({ message }: { message: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok?: boolean }>({ text: message });
  useEffect(() => { if (message) setMsg({ text: message }); }, [message]); // eslint-disable-line react-hooks/set-state-in-effect -- a message from the sign-in check

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setMsg({ text: "Please type your email and password." });
    setBusy(true);
    setMsg({ text: "" });
    try {
      await signInWithEmailAndPassword(fb().auth, email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string }).code || "";
      if (code.includes("too-many-requests")) setMsg({ text: "Too many tries. Please wait a few minutes and try again." });
      else if (code.includes("network")) setMsg({ text: "No internet connection. Please try again." });
      else setMsg({ text: "Wrong email or password. Please try again." });
    } finally {
      setBusy(false);
    }
  };
  const forgot = async () => {
    if (!email.trim()) return setMsg({ text: "Type your email above first, then tap “Forgot password?” again." });
    try {
      await sendPasswordResetEmail(fb().auth, email.trim());
      setMsg({ text: "We sent a link to reset your password. Please check your email (also the Spam folder).", ok: true });
    } catch {
      setMsg({ text: "Could not send the email. Please check the email address." });
    }
  };

  return (
    <section className="a-login">
      <div className="a-login__art" aria-hidden="true">
        <img src={sized(DEFAULTS.hero.image, 1400)} alt="" />
        <div className="a-login__art-text">
          <Mark className="a-login__art-mark" />
          <p className="a-login__art-word">STUDIO 11</p>
          <p className="a-login__art-sub">Interior</p>
        </div>
      </div>
      <div className="a-login__panel">
        <form className="a-login__form" onSubmit={submit} noValidate>
          <Mark className="a-login__mark" />
          <p className="a-eyebrow">Admin Panel</p>
          <h1 className="a-login__title">Welcome back</h1>
          <p className="a-login__lead">Log in to see enquiries and change your website.</p>
          <label className="a-field">
            <span className="a-field__label">Email</span>
            <input type="email" name="email" autoComplete="username" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="a-field">
            <span className="a-field__label">Password</span>
            <span className="a-field__pw">
              <input type={show ? "text" : "password"} name="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="a-field__show" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
            </span>
          </label>
          <p className={`a-form-msg${msg.ok ? " is-ok" : ""}`} role="alert">{msg.text}</p>
          <button className="a-btn a-btn--primary a-btn--block a-btn--lg" type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
          <button className="a-link-btn" type="button" onClick={forgot}>Forgot password?</button>
        </form>
      </div>
    </section>
  );
}

/* ==========================================================================
   App
   ========================================================================== */
export function AdminApp() {
  const [phase, setPhase] = useState<"boot" | "login" | "app">("boot");
  const [loginMsg, setLoginMsg] = useState("");
  const [content, setContent] = useState<SiteContent>(DEFAULTS);
  const [page, setPage] = useState<PageId>("home");
  const [sideOpen, setSideOpen] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enqReady, setEnqReady] = useState(false);
  const [toastState, setToastState] = useState<{ text: string; error: boolean; key: number } | null>(null);
  const [modal, setModal] = useState<ReactNode>(null);
  const dirty = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((text: string, error = false) => {
    setToastState({ text, error, key: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState(null), error ? 5000 : 2600);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((render: (close: () => void) => ReactNode) => setModal(render(() => setModal(null))), []);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => {
    const done = (v: boolean) => { setModal(null); resolve(v); };
    setModal(
      <>
        <h2 className="a-modal__title">{o.title}</h2>
        <p className="a-modal__text">{o.text}</p>
        <div className="a-modal__actions">
          <button className="a-btn a-btn--light a-btn--lg" type="button" onClick={() => done(false)}>{o.no || "No, go back"}</button>
          <button className={`a-btn ${o.danger ? "a-btn--danger" : "a-btn--primary"} a-btn--lg`} type="button" onClick={() => done(true)}>{o.yes || "Yes"}</button>
        </div>
      </>,
    );
  }), []);
  const setDirty = useCallback((d: boolean) => { dirty.current = d; }, []);

  const save = useCallback(async <K extends keyof SiteContent>(key: K, data: SiteContent[K]) => {
    try {
      const clean = clone(data);
      await setDoc(doc(fb().db, "site", key), clean as object);
      setContent((c) => ({ ...c, [key]: clean }));
      return true;
    } catch (err) {
      console.error(err);
      toast(friendlyError(err), true);
      return false;
    }
  }, [toast]);

  const setStatus = useCallback(async (e: Enquiry, status: EnquiryStatus) => {
    try {
      await updateDoc(doc(fb().db, "enquiries", e.id), { status });
      toast(`${e.name}: marked as ${STATUSES.find((s) => s.key === status)?.label}`);
    } catch (err) { console.error(err); toast(friendlyError(err), true); }
  }, [toast]);
  const removeEnquiry = useCallback(async (e: Enquiry) => {
    try {
      await deleteDoc(doc(fb().db, "enquiries", e.id));
      toast(`${e.name}’s enquiry deleted`);
    } catch (err) { console.error(err); toast(friendlyError(err), true); }
  }, [toast]);

  const go = useCallback(async (id: PageId, push = true) => {
    if (dirty.current && id !== page) {
      const leave = await confirm({ title: "Leave without saving?", text: "You changed something on this page but did not press “Save changes”.", yes: "Leave without saving", no: "Stay here" });
      if (!leave) { if (!push) history.replaceState(null, "", `#${page}`); return; }
      dirty.current = false;
    }
    setPage(id);
    setSideOpen(false);
    if (push && location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
    window.scrollTo(0, 0);
  }, [page, confirm]);

  useEffect(() => {
    const onPop = () => { const id = location.hash.slice(1); go(isPage(id) ? id : "home", false); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [go]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [modal, closeModal]);

  // Sign-in check, then load saved content and follow enquiries live.
  useEffect(() => {
    const { auth, db } = fb();
    let stopEnq: (() => void) | null = null;
    const stop = onAuthStateChanged(auth, async (user) => {
      stopEnq?.();
      stopEnq = null;
      if (user && (user.email || "").toLowerCase() !== ADMIN_EMAIL) {
        await signOut(auth);
        setLoginMsg("This account cannot open the admin panel.");
        setPhase("login");
        return;
      }
      if (!user) {
        dirty.current = false;
        setPhase("login");
        return;
      }
      try {
        const snap = await getDocs(collection(db, "site"));
        const next = clone(DEFAULTS) as unknown as Record<string, unknown>;
        snap.forEach((d) => {
          if (d.id in DEFAULTS) next[d.id] = { ...(DEFAULTS[d.id as keyof SiteContent] as object), ...d.data() };
        });
        setContent(next as unknown as SiteContent);
      } catch (err) {
        console.error(err);
        toast("Could not load your saved changes. Showing the website’s current content.", true);
      }
      stopEnq = onSnapshot(
        query(collection(db, "enquiries"), orderBy("createdAt", "desc")),
        (qs) => {
          setEnquiries(qs.docs.map((d) => {
            const x = d.data();
            return { ...(x as Omit<Enquiry, "id" | "createdAt">), id: d.id, createdAt: x.createdAt instanceof Timestamp ? x.createdAt.toDate() : null } as Enquiry;
          }));
          setEnqReady(true);
        },
        (err) => { console.error(err); setEnqReady(true); toast("Could not load enquiries. Please check your internet.", true); },
      );
      const id = location.hash.slice(1);
      setPage(isPage(id) ? id : "home");
      setLoginMsg("");
      setPhase("app");
    });
    return () => { stop(); stopEnq?.(); };
  }, [toast]);

  const logout = async () => {
    if (dirty.current) {
      const leave = await confirm({ title: "Log out without saving?", text: "You have changes that are not saved yet.", yes: "Log out", no: "Stay here" });
      if (!leave) return;
    }
    dirty.current = false;
    await signOut(fb().auth);
  };

  const newCount = enquiries.filter((e) => e.status === "new").length;
  const ctx: AdminCtx = useMemo(() => ({ content, save, toast, confirm, openModal, setDirty, go, enquiries, enqReady, setStatus, removeEnquiry }),
    [content, save, toast, confirm, openModal, setDirty, go, enquiries, enqReady, setStatus, removeEnquiry]);
  const Page = PAGES[page];
  const title = (NAV.find((n) => "id" in n && n.id === page) as { label: string } | undefined)?.label || "Home";

  return (
    <div className="a-root">
      {phase === "boot" && <div className="a-boot"><Mark className="a-boot__mark" /></div>}
      {phase === "login" && <Login message={loginMsg} />}
      {phase === "app" && (
        <Ctx.Provider value={ctx}>
          <div className="a-app">
            <aside className={`a-side${sideOpen ? " is-open" : ""}`} aria-label="Admin menu">
              <div className="a-side__brand">
                <Mark className="a-side__mark" />
                <div>
                  <p className="a-side__word">STUDIO 11</p>
                  <p className="a-side__sub">Admin Panel</p>
                </div>
              </div>
              <nav className="a-side__nav">
                {NAV.map((n, i) => "group" in n
                  ? <p className="a-side__group" key={i}>{n.group}</p>
                  : (
                    <button key={n.id} type="button" className={`a-nav${page === n.id ? " is-active" : ""}`} onClick={() => go(n.id)}>
                      {(() => { const C = Icon[n.icon]; return <C />; })()}
                      <span>{n.label}</span>
                      {n.id === "enquiries" && newCount > 0 && <b className="a-nav__count" aria-label={`${newCount} new`}>{newCount}</b>}
                    </button>
                  ))}
              </nav>
              <div className="a-side__foot">
                <a className="a-side__link" href="/" target="_blank" rel="noopener"><Icon.site /><span>View website</span></a>
                <button className="a-side__link" type="button" onClick={logout}><Icon.logout /><span>Log out</span></button>
              </div>
            </aside>
            <div className="a-side-backdrop" onClick={() => setSideOpen(false)} />

            <div className="a-main">
              <header className="a-topbar">
                <button className="a-topbar__menu" type="button" onClick={() => setSideOpen(true)} aria-label="Open menu">
                  <span /><span />
                  {newCount > 0 && <i className="a-topbar__dot" aria-hidden="true" />}
                </button>
                <p className="a-topbar__title">{title}</p>
                <a className="a-topbar__site" href="/" target="_blank" rel="noopener">View website</a>
              </header>
              <main className="a-page"><Page key={page} /></main>
            </div>
          </div>
        </Ctx.Provider>
      )}

      <div className={`a-modal${modal ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!modal}>
        <div className="a-modal__backdrop" onClick={closeModal} />
        <div className="a-modal__panel">
          {modal && <Ctx.Provider value={ctx}>{modal}</Ctx.Provider>}
        </div>
      </div>

      <div className={`a-toast${toastState ? " is-visible" : ""}${toastState?.error ? " is-error" : ""}`} role="status" aria-live="polite">
        {toastState && (toastState.error ? <Icon.alert /> : <Icon.check />)}
        <span>{toastState?.text}</span>
      </div>
    </div>
  );
}
