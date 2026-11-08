import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { DEFAULTS } from "@/content/defaults";
import { sized } from "@/lib/img";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const description =
  "Studio 11 Interior designs and builds complete home interiors in Hoskote and across Bengaluru: modular kitchens, wardrobes, TV and pooja units, false ceilings, lighting, electrical work and painting. Free site visit and free quotation.";

export const metadata: Metadata = {
  title: "Studio 11 Interior · Home Interior Designers in Hoskote, Bengaluru",
  description,
  openGraph: {
    title: "Studio 11 Interior · Hoskote, Bengaluru",
    description: "Complete home interiors by one team. Free site visit and free quotation.",
    images: [sized(DEFAULTS.hero.image, 1200, 630)],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b1916",
};

const INTRO_CHECK = `try{if(sessionStorage.getItem("studio11-intro")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-seen")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* Skip the opening curtain before first paint on repeat visits */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_CHECK }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
