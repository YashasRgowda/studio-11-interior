# Studio 11 Interior

Website for Studio 11 Interior, a home interior company in Hoskote, Bengaluru.
Built by [svayam.ai](https://wa.me/918095762180).

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

`npm run build` writes the finished static site to `out/`.

## Tech

| Part | Tools |
|---|---|
| Frontend | Next.js 16 (App Router, static export), TypeScript, Tailwind CSS 4, Lenis smooth scroll |
| Fonts | Instrument Serif (headings), Manrope (text), self-hosted by `next/font` |
| Content | Built into the page from `src/content/defaults.ts`; saved changes are read from Firestore in the browser (once Firebase is set up) |
| Leads | WhatsApp: the booking form and the chat helper (`src/components/Chat.tsx`) open WhatsApp with the message already typed |
| Hosting | Vercel, auto-deploys from GitHub |

## Backend accounts (all free plans, no card)

| Service | Details |
|---|---|
| Owner Google account | studio11interior.db@gmail.com (owns Firebase and Cloudinary; also the admin login) |
| Firebase project | `studio-11-interior` (Spark plan) |
| Firestore | `(default)` database in Mumbai (`asia-south1`), delete protection on |
| Security rules | `firestore.rules`: site content is public to read, admin-only to change; enquiries can be sent by anyone (validated), seen only by the admin |
| Admin login | Firebase Authentication, email + password, only `studio11interior.db@gmail.com` |
| Cloudinary | cloud `m3t3s0hw`, unsigned upload preset `studio11_admin` (folder `studio11`) |
| Keys in code | `src/lib/firebase-config.ts`, `src/lib/cloudinary-config.ts` (public by design) |

Deploy rule changes with:

```bash
firebase deploy --only firestore:rules --project studio-11-interior --account studio11interior.db@gmail.com
```

## Admin panel (`/admin`)

Same layout as the EVA admin, in Studio 11's colours. Login: email + password, only `studio11interior.db@gmail.com`.

| Page | What the owner can do |
|---|---|
| Home | New enquiries first (with Call buttons), then a tile for each page |
| Enquiries | Live list of leads from the chat and the booking form; New / Called / Site visit fixed / Closed; search; Call and WhatsApp buttons; delete; download for Excel |
| Top Banner | Photo, headline, short line |
| Numbers | The 5 numbers under the banner (300+ projects, warranties...) |
| Services | Change, add, hide, reorder, delete (first 2 are shown big) |
| Packages | Add prices by home size (the section stays hidden until one is added) |
| Story Photos | The 3 "Why Studio 11" photos and the kitchen banner |
| Design Ideas | Gallery photos (add, change, reorder, delete) and the words above it |
| Reviews | Google rating, number of reviews, review quotes |
| Contact Details | Phone, WhatsApp, days, hours, address, areas, map link, email, Instagram |

Enquiries are saved by `src/lib/enquiries.ts` with a plain web request (no Firebase library on the public site). If saving fails, the visitor's WhatsApp opens with the message typed, so no lead is lost.

Code: `src/app/admin/page.tsx` → `src/admin/` (`AdminApp.tsx` shell and login, `pages-leads.tsx`, `pages-site.tsx`, `ui.tsx`, `upload.ts`, `admin.css`).

### Testing safely on this computer (no real data touched)

The Firestore and Auth emulators need Java 21+ with the latest Firebase CLI; with Java 17 use version 13:

```bash
npx -y firebase-tools@13.35.1 emulators:start --only auth,firestore --project studio-11-interior
```

Then run the site against them (in another terminal):

```bash
NEXT_PUBLIC_FIREBASE_EMULATOR=1 npm run dev
```

Create a test admin in the Auth emulator (email `studio11interior.db@gmail.com`, any test password) and log in at `/admin`. Never set `NEXT_PUBLIC_FIREBASE_EMULATOR` on Vercel.

## Project structure

```
src/app/layout.tsx        Fonts, page title, SEO
src/app/page.tsx          The home page, section by section
src/app/globals.css       All styles: colours, type, animations, phone/tablet layouts
src/content/defaults.ts   All text, facts and photo links
src/content/types.ts      Shape of the content (what the admin panel will edit)
src/components/           Header, menu, hero, services, gallery, booking sheet, footer...
src/lib/content.tsx       Loads saved content from Firestore (skipped until Firebase is set up)
src/lib/firebase-config.ts  Firebase keys (empty for now)
```

## Placeholder photos (replace with Studio 11's real projects)

Every photo is a free Unsplash photo, used as a placeholder. Most are 3D design
visuals by other Indian interior studios, so the gallery is called "Design Ideas"
(not "Our Work") until real photos are added.

| Where | Photo | By |
|---|---|---|
| Hero | Living room with pooja jaali | @spl_interiors |
| Services: full home, kitchen, wardrobes, living/TV/pooja, ceiling, painting | 3D designs | @homemakersinterior |
| Services: electrical, villas, offices, renovation | Photos | Unsplash |
| Why Studio 11 (3 photos) | Living/dining, material samples, bedroom | @homemakersinterior, Unsplash |
| Design Ideas gallery (6 photos) | Pooja, living, dining, bedroom, study, lounge | Unsplash |
| Quote banner | Parallel kitchen | @homemakersinterior |

## Waiting for real details

- **Packages**: section is built but hidden until prices are added (`packages.items` in `defaults.ts`).
- **Reviews**: shows the 5.0 rating and a Google link; review quotes appear once added (`reviews.items`).
- **Address**: shows "Hoskote, Bengaluru, Karnataka 562114"; the map uses the Google listing.
- **Admin panel**: next phase (Firebase Auth + Firestore + Cloudinary).
