"use client";

// Shared pieces of the admin panel: the shared state, icons, page heading,
// form fields, the "Save changes" bar and the photo picker.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { SiteContent } from "@/content/types";
import type { Enquiry, EnquiryStatus } from "@/lib/enquiries";
import { sized } from "@/lib/img";
import { checkPhoto, shrink, uploadToCloudinary } from "./upload";

/* ---------- Shared state (provided by AdminApp) ---------- */
export type PageId = "home" | "enquiries" | "banner" | "numbers" | "services" | "packages" | "photos" | "gallery" | "reviews" | "contact";
export type ConfirmOpts = { title: string; text: string; yes?: string; no?: string; danger?: boolean };

export type AdminCtx = {
  content: SiteContent;
  save: <K extends keyof SiteContent>(key: K, data: SiteContent[K]) => Promise<boolean>;
  toast: (message: string, isError?: boolean) => void;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
  openModal: (render: (close: () => void) => ReactNode) => void;
  setDirty: (dirty: boolean) => void;
  go: (id: PageId) => void;
  enquiries: Enquiry[];
  enqReady: boolean;
  setStatus: (e: Enquiry, status: EnquiryStatus) => Promise<void>;
  removeEnquiry: (e: Enquiry) => Promise<void>;
};
export const Ctx = createContext<AdminCtx | null>(null);
export const useAdmin = () => useContext(Ctx)!;

export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

/* ---------- Icons: simple line icons, same weight as the website ---------- */
const I = (d: string) => function Icon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />;
};
export const Icon = {
  home: I('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>'),
  inbox: I('<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6H3v-6Z"/>'),
  banner: I('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.6"/><path d="m21 16-5-5-9 9"/>'),
  numbers: I('<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/>'),
  services: I('<rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1"/>'),
  packages: I('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.3"/>'),
  photos: I('<path d="M4 21V9a8 8 0 0 1 16 0v12"/><path d="M2 21h20"/><path d="M9 21v-6h6v6"/>'),
  gallery: I('<rect x="3" y="3" width="8" height="10" rx="1"/><rect x="13" y="3" width="8" height="6" rx="1"/><rect x="13" y="11" width="8" height="10" rx="1"/><rect x="3" y="15" width="8" height="6" rx="1"/>'),
  reviews: I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>'),
  contact: I('<path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
  site: I('<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  logout: I('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4"/><path d="M6 12h10"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  edit: I('<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>'),
  trash: I('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>'),
  eye: I('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: I('<path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  up: I('<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>'),
  down: I('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),
  camera: I('<path d="M4 8h3l2-3h6l2 3h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/>'),
  check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  alert: I('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.3" r="0.8" fill="currentColor"/>'),
  phone: I('<path d="M6.7 3.5h2.5l1.5 3.7-1.9 1.3a11.5 11.5 0 0 0 6.7 6.7l1.3-1.9 3.7 1.5v2.5a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.7 5.7a2 2 0 0 1 2-2.2z"/>'),
  whatsapp: I('<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5"/>'),
  download: I('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
  search: I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  arrow: I('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  pin: I('<path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
};

/* ---------- Page heading ---------- */
export function PageHead({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: ReactNode; children?: ReactNode }) {
  return (
    <div className="a-head">
      <p className="a-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {text && <p className="a-head__text">{text}</p>}
      {children && <div className="a-head__actions">{children}</div>}
    </div>
  );
}

/* ---------- Form field ---------- */
export function Field({ label, hint, error, children, wide }: { label: string; hint?: string; error?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`a-field${error ? " has-error" : ""}${wide ? " a-field--wide" : ""}`}>
      <span className="a-field__label">{label}</span>
      {hint && <span className="a-field__hint">{hint}</span>}
      {children}
      {error && <span className="a-field__error">{error}</span>}
    </label>
  );
}

/* ---------- Save bar: pages with typing get one "Save changes" button ---------- */
export function SaveBar({ dirty, onSave }: { dirty: boolean; onSave: () => Promise<boolean> }) {
  const { setDirty } = useAdmin();
  const [saving, setSaving] = useState(false);
  useEffect(() => { setDirty(dirty); }, [dirty, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);
  return (
    <div className={`a-savebar is-visible${dirty ? " is-dirty" : ""}`} aria-live="polite">
      <p className="a-savebar__msg">{dirty ? "You have changes that are not saved yet." : "Everything is saved."}</p>
      <button
        className="a-btn a-btn--primary a-btn--lg"
        type="button"
        disabled={!dirty || saving}
        onClick={async () => { setSaving(true); await onSave(); setSaving(false); }}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

/* ---------- Photo picker: choose, shrink, upload with progress ---------- */
export function preview(url: string, w: number, h?: number) {
  return url ? sized(url, w, h) : "";
}

export function usePhotoUpload() {
  const { toast } = useAdmin();
  const input = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const resolver = useRef<((f: File | null) => void) | null>(null);

  const pick = () => new Promise<File | null>((resolve) => {
    resolver.current = resolve;
    input.current?.click();
  });

  // Returns the new photo link, or null if cancelled or failed.
  const upload = async (maxSide = 2000): Promise<string | null> => {
    const file = await pick();
    if (!file) return null;
    const bad = checkPhoto(file);
    if (bad) { toast(bad, true); return null; }
    setProgress(0);
    try {
      const blob = await shrink(file, maxSide);
      return await uploadToCloudinary(blob, setProgress);
    } catch (err) {
      console.error(err);
      toast(navigator.onLine ? "The photo could not be uploaded. Please try again." : "No internet connection. Please try again.", true);
      return null;
    } finally {
      setProgress(null);
    }
  };

  const fileInput = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const f = e.target.files?.[0] || null;
        e.target.value = "";
        resolver.current?.(f);
        resolver.current = null;
      }}
    />
  );
  const overlay = progress !== null && (
    <div className="a-uploading">
      <span>Uploading… <b>{Math.round(progress * 100)}%</b></span>
      <span className="a-uploading__bar"><i style={{ width: `${progress * 100}%` }} /></span>
    </div>
  );
  return { upload, fileInput, overlay, busy: progress !== null };
}

// A photo card with a "Change photo" button; saves through onChange as soon as it is picked.
export function PhotoCard({ name, hint, src, w, h, wide, maxSide, onChange }: {
  name?: string; hint?: string; src: string; w: number; h?: number; wide?: boolean; maxSide?: number;
  onChange: (url: string) => Promise<boolean>;
}) {
  const { upload, fileInput, overlay, busy } = usePhotoUpload();
  return (
    <div className={`a-photo${wide ? " a-photo--wide" : ""}`}>
      <div className="a-photo__img">
        {src ? <img src={preview(src, w, h)} alt={name || "Photo"} /> : null}
        {overlay}
      </div>
      <div className="a-photo__body">
        <span>
          {name && <span className="a-photo__name">{name}</span>}
          {hint && <span className="a-photo__hint">{hint}</span>}
        </span>
        <button
          className="a-btn a-btn--light"
          type="button"
          disabled={busy}
          onClick={async () => { const url = await upload(maxSide); if (url) await onChange(url); }}
        >
          <Icon.camera /> Change
        </button>
      </div>
      {fileInput}
    </div>
  );
}
