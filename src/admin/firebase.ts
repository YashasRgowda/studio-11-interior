// Firebase for the admin panel only (the public website never loads this).
// Started on first use in the browser, never during the static build.

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { emulatorMode, firebaseConfig } from "@/lib/firebase-config";

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function fb() {
  if (cached) return cached;
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  // Local testing only (see firebase-config.ts): use the emulators on this computer.
  if (emulatorMode) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  cached = { app, auth, db };
  return cached;
}
