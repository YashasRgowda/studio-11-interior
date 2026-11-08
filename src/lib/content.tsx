"use client";

// Fills the website with what the owner saved in the admin panel.
// The page is pre-built with the default content, so if the database is slow or
// unreachable nothing looks broken; saved changes simply replace it.

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { DEFAULTS } from "@/content/defaults";
import type { SiteContent } from "@/content/types";
import { firebaseConfig, firebaseReady, firestoreRest } from "./firebase-config";

const CACHE_KEY = "studio11-content-v1";
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Json = Record<string, unknown>;
type FsValue = Record<string, unknown>;

function decode(v: FsValue): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (((v.arrayValue as Json).values as FsValue[]) || []).map(decode);
  if ("mapValue" in v) return decodeFields(((v.mapValue as Json).fields as Record<string, FsValue>) || {});
  return null;
}
function decodeFields(fields: Record<string, FsValue>): Json {
  const out: Json = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decode(v);
  return out;
}

async function fetchSaved(): Promise<Partial<Record<keyof SiteContent, Json>>> {
  const url = `${firestoreRest}/documents/site?pageSize=50&key=${firebaseConfig.apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Firestore ${res.status}`);
  const data = (await res.json()) as { documents?: { name: string; fields?: Record<string, FsValue> }[] };
  const out: Json = {};
  (data.documents || []).forEach((d) => {
    out[d.name.split("/").pop() as string] = decodeFields(d.fields || {});
  });
  return out as Partial<Record<keyof SiteContent, Json>>;
}

// Saved sections replace the defaults field by field, so a half-filled section never breaks the page.
export function mergeContent(saved: Partial<Record<keyof SiteContent, Json>> | null): SiteContent {
  if (!saved) return DEFAULTS;
  const out = { ...DEFAULTS } as Record<string, unknown>;
  for (const key of Object.keys(DEFAULTS) as (keyof SiteContent)[]) {
    const s = saved[key];
    if (s && typeof s === "object") out[key] = { ...(DEFAULTS[key] as object), ...s };
  }
  return out as SiteContent;
}

const ContentContext = createContext<SiteContent>(DEFAULTS);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULTS);

  // Last saved copy first (before paint, so there is no flash), then the fresh one.
  useIsoLayoutEffect(() => {
    if (!firebaseReady) return;
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached) setContent(mergeContent(cached));
    } catch {
      /* storage blocked */
    }
  }, []);

  useEffect(() => {
    if (!firebaseReady) return;
    let alive = true;
    fetchSaved()
      .then((fresh) => {
        if (!alive) return;
        const text = JSON.stringify(fresh);
        try {
          if (localStorage.getItem(CACHE_KEY) === text) return;
          localStorage.setItem(CACHE_KEY, text);
        } catch {
          /* storage blocked */
        }
        setContent(mergeContent(fresh));
      })
      .catch((err) => console.warn("Studio 11: showing built-in content", err));
    return () => {
      alive = false;
    };
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
