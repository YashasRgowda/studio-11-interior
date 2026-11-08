// Firebase project "studio-11-interior" (Spark plan, free, no card).
// Owner account: studio11interior.db@gmail.com. Database: Firestore in Mumbai (asia-south1).
// These keys are public by design; the rules in firestore.rules decide who can
// read and write (anyone can read site content and send an enquiry; only the
// admin can change content or see enquiries).
export const firebaseConfig = {
  apiKey: "AIzaSyA2vtmbBdP9nHPDo9pGiRCg2c6xWWbzf70",
  authDomain: "studio-11-interior.firebaseapp.com",
  projectId: "studio-11-interior",
  storageBucket: "studio-11-interior.firebasestorage.app",
  messagingSenderId: "1005041602489",
  appId: "1:1005041602489:web:00626d0ad609bc579df068",
};

// The one account allowed into the admin panel (must match firestore.rules).
export const ADMIN_EMAIL = "studio11interior.db@gmail.com";

export const firebaseReady = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

// Local testing only: `NEXT_PUBLIC_FIREBASE_EMULATOR=1 npm run dev` talks to the
// Firebase emulators on this computer instead of the real database. Production
// builds never set it, so this is always false on the live site.
export const emulatorMode = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1";

// Firestore over plain web requests (the public site uses no Firebase library).
export const firestoreRest = emulatorMode
  ? `http://127.0.0.1:8080/v1/projects/${firebaseConfig.projectId}/databases/(default)`
  : `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)`;
