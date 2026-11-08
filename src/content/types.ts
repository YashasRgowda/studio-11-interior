// Shape of everything the owner can change. Each top-level key is one
// Firestore document: site/{key}. The admin panel edits these.

export type ServiceGroup = "rooms" | "finishing" | "spaces";

export type Service = {
  id: string;
  group: ServiceGroup;
  name: string;
  bestFor: string;
  description: string;
  image: string;
  hidden?: boolean;
};

export type Package = {
  name: string; // e.g. "2 BHK"
  price: string; // e.g. "₹4.5 Lakh"
  includes: string[];
  note?: string;
  hidden?: boolean;
};

export type Review = {
  name: string;
  text: string;
  tag?: string; // e.g. "Full home, Whitefield"
};

export type GalleryItem = {
  room: string;
  title: string;
  image: string;
};

export type Fact = { value: string; label: string };

export type SiteContent = {
  brand: { name: string; subtitle: string };
  hero: { image: string; title: string; lead: string };
  facts: { items: Fact[] };
  services: { items: Service[] };
  packages: { note: string; items: Package[] };
  stories: { oneTeam: string; materials: string; design: string };
  gallery: { kicker: string; title: string; lead: string; items: GalleryItem[] };
  quote: { image: string };
  reviews: { rating: string; count: string; items: Review[] };
  contact: {
    phone: string;
    whatsapp: string;
    days: string;
    hours: string;
    address: string;
    serviceArea: string;
    mapsUrl: string;
    mapQuery: string;
    email: string;
    instagram: string;
  };
};
