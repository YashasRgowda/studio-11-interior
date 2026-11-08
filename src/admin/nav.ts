// The admin menu, in the same order as the website.
import type { Icon, PageId } from "./ui";

export type NavItem = { id: PageId; label: string; icon: keyof typeof Icon; text?: string } | { group: string };
export const NAV: NavItem[] = [
  { id: "home", label: "Home", icon: "home" },
  { group: "Leads" },
  { id: "enquiries", label: "Enquiries", icon: "inbox", text: "See, call and follow up everyone who asked for a quote or site visit." },
  { group: "Your website" },
  { id: "banner", label: "Top Banner", icon: "banner", text: "Change the big first photo and its words." },
  { id: "numbers", label: "Numbers", icon: "numbers", text: "Change 300+ projects, years and the warranties." },
  { id: "services", label: "Services", icon: "services", text: "Change, add, hide or delete your services." },
  { id: "packages", label: "Packages", icon: "packages", text: "Add prices for each home size." },
  { id: "photos", label: "Story Photos", icon: "photos", text: "Change the 3 “Why Studio 11” photos and the kitchen banner." },
  { id: "gallery", label: "Design Ideas", icon: "gallery", text: "Add, change or delete the photos in the gallery." },
  { id: "reviews", label: "Reviews", icon: "reviews", text: "Add your Google reviews and rating." },
  { id: "contact", label: "Contact Details", icon: "contact", text: "Change phone, WhatsApp, address, timings and map." },
];

