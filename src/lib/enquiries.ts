// Enquiries from the website (the chat helper and the booking form).
// They are saved straight into the database over a plain web request, so the
// public site needs no Firebase library. The admin panel shows them live.

import { firebaseConfig, firebaseReady, firestoreRest } from "./firebase-config";

export type EnquiryStatus = "new" | "called" | "visit" | "closed";

export type Enquiry = {
  id: string;
  name: string;
  phone: string; // 10 digits
  area?: string;
  need?: string;
  home?: string;
  homeStatus?: string;
  budget?: string;
  start?: string;
  type?: string; // what they asked for, e.g. "Get a free quote"
  source: "chat" | "form";
  status: EnquiryStatus;
  createdAt: Date | null;
};

export type NewEnquiry = Omit<Enquiry, "id" | "status" | "createdAt">;

export const STATUSES: { key: EnquiryStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "called", label: "Called" },
  { key: "visit", label: "Site visit fixed" },
  { key: "closed", label: "Closed" },
];

// "+91 98765 43210", "098765 43210" or "9876543210" -> "9876543210"; anything else -> "".
export function cleanPhone(value: string): string {
  let d = String(value || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}

// "9876543210" -> "+91 98765 43210"
export const prettyPhone = (d: string) => (d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : d);

const randomId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

// Saves one enquiry. The time is set by Google's server (not the visitor's
// phone clock), which the security rules check. Returns true when saved.
export async function saveEnquiry(e: NewEnquiry): Promise<boolean> {
  if (!firebaseReady) return false;
  const phone = cleanPhone(e.phone);
  if (!phone || !e.name.trim()) return false;
  const fields: Record<string, { stringValue: string }> = {};
  const put = (k: string, v?: string) => {
    const t = (v || "").trim();
    if (t) fields[k] = { stringValue: t };
  };
  put("name", e.name.slice(0, 60));
  put("phone", phone);
  put("area", e.area?.slice(0, 80));
  put("need", e.need?.slice(0, 200));
  put("home", e.home?.slice(0, 60));
  put("homeStatus", e.homeStatus?.slice(0, 60));
  put("budget", e.budget?.slice(0, 40));
  put("start", e.start?.slice(0, 40));
  put("type", e.type?.slice(0, 40));
  put("source", e.source);
  put("status", "new");

  const root = `projects/${firebaseConfig.projectId}/databases/(default)/documents`;
  const body = {
    writes: [
      {
        update: { name: `${root}/enquiries/${randomId()}`, fields },
        currentDocument: { exists: false },
        updateTransforms: [{ fieldPath: "createdAt", setToServerValue: "REQUEST_TIME" }],
      },
    ],
  };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${firestoreRest}/documents:commit?key=${firebaseConfig.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
