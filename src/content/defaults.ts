import type { SiteContent } from "./types";

// The website's built-in content. The page is built from this, so it loads
// instantly; anything the owner saves in the admin panel replaces it.
//
// PHOTOS: every photo below is a PLACEHOLDER from Unsplash (free for commercial
// use). Most are 3D design visuals by Indian interior studios. Replace them with
// Studio 11's own project photos as soon as they are ready (Admin → Photos).

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const DEFAULTS: SiteContent = {
  brand: { name: "Studio 11", subtitle: "Interior" },

  hero: {
    // Living room with a pooja corner and marble wall (@spl_interiors)
    image: u("1745301558339-44eb3217d5da"),
    title: "Your Dream Home, Done Right.",
    lead: "Complete home interiors in Bengaluru. One team, start to finish.",
  },

  facts: {
    items: [
      { value: "300+", label: "Projects completed" },
      { value: "5+", label: "Years of experience" },
      { value: "15 yrs", label: "Plywood warranty" },
      { value: "5 yrs", label: "Hardware warranty" },
      { value: "1 yr", label: "Service warranty" },
    ],
  },

  services: {
    items: [
      {
        id: "full-home",
        group: "rooms",
        name: "Full Home Interiors",
        bestFor: "new flats and homes, before you move in",
        description: "Every room designed and built by one team, from start to finish.",
        image: u("1785402231092-859d0a6c4397"), // @homemakersinterior
      },
      {
        id: "kitchen",
        group: "rooms",
        name: "Modular Kitchen",
        bestFor: "more storage and easier cooking",
        description: "Cabinets, drawers and countertops made to fit your kitchen.",
        image: u("1742280879518-ada47b660ccd"), // @homemakersinterior
      },
      {
        id: "wardrobes",
        group: "rooms",
        name: "Wardrobes & Bedrooms",
        bestFor: "bedrooms that need more storage",
        description: "Sliding or openable wardrobes, beds, side tables and dressers.",
        image: u("1744956204128-45668b7994aa"), // @homemakersinterior
      },
      {
        id: "living",
        group: "rooms",
        name: "Living Room, TV & Pooja Units",
        bestFor: "the room your guests see first",
        description: "TV units, pooja units, crockery units and shoe racks.",
        image: u("1734937743443-a50fff0c0b40"), // @homemakersinterior
      },
      {
        id: "ceiling",
        group: "finishing",
        name: "False Ceiling & Lighting",
        bestFor: "a modern look with soft, warm light",
        description: "Designer ceilings with hidden cove lights and spotlights.",
        image: u("1785232273548-4beae5334903"), // @homemakersinterior
      },
      {
        id: "electrical",
        group: "finishing",
        name: "Electrical Work",
        bestFor: "new light points and safe wiring",
        description: "Wiring, switches, light points and fittings, done neatly.",
        image: u("1665242043190-0ef29390d289"),
      },
      {
        id: "painting",
        group: "finishing",
        name: "Painting & Wallpaper",
        bestFor: "a fresh new look for your walls",
        description: "Wall painting, texture finishes and wallpaper.",
        image: u("1746253978637-2188355086cc"), // @homemakersinterior
      },
      {
        id: "villas",
        group: "spaces",
        name: "Villas & Independent Houses",
        bestFor: "bigger homes with many rooms",
        description: "Complete interiors for villas and independent houses.",
        image: u("1601086540476-7d9fa9dd6023"),
      },
      {
        id: "offices",
        group: "spaces",
        name: "Offices & Shops",
        bestFor: "workspaces that look professional",
        description: "Interiors for offices, cabins and shops.",
        image: u("1715593949273-09009558300a"),
      },
      {
        id: "renovation",
        group: "spaces",
        name: "Home Renovation",
        bestFor: "old homes that need a new look",
        description: "We redo old interiors: kitchen, wardrobes, ceiling, lights and paint.",
        image: u("1482731215275-a1f151646268"),
      },
    ],
  },

  // Packages stay hidden on the website until real prices are added.
  packages: {
    note: "Final price depends on your home size, design and materials. We share an exact quote after the free site visit.",
    items: [],
  },

  stories: {
    oneTeam: u("1786522326745-8a65e85209db"), // @homemakersinterior
    // focal point keeps the marble, wood and stone samples in the arch crop
    materials: `${u("1781859240244-61e274c2bf39")}?crop=focalpoint&fp-x=0.3&fp-y=0.72`,
    design: u("1745055218779-6c6a748f4a3a"), // @homemakersinterior
  },

  // Until Studio 11's own project photos are added, this section is called "Design Ideas".
  gallery: {
    kicker: "Design Ideas",
    title: "Looks for Every Room",
    lead: "Like a look? Show it to us. We will design one for your home.",
    items: [
      { room: "Pooja Unit", title: "White pooja wall with lotus details", image: u("1774301063167-66623449a95c") },
      { room: "Living Room", title: "Calm living room with wall panels", image: u("1742541656775-5fc717774c02") },
      { room: "Dining", title: "Dining with a glass partition", image: u("1735020693833-b149876eedcb") },
      { room: "Bedroom", title: "Warm wood and soft lights", image: u("1756100906698-3fd21bb12a90") },
      { room: "Study", title: "Study with arch shelves", image: u("1737011475260-44aa2689cc24") },
      { room: "Lounge", title: "Bright lounge with a book wall", image: u("1742367539759-6e4fc2e39209") },
    ],
  },

  quote: { image: u("1742455362478-5081fc9a9234") }, // @homemakersinterior

  // Real Google reviews go here (name + text). Until then, the site shows the
  // rating with a link to Google.
  reviews: { rating: "5.0", count: "18", items: [] },

  contact: {
    phone: "+91 74839 84415",
    whatsapp: "+91 74839 84415",
    days: "Open all 7 days",
    hours: "9 AM – 7 PM",
    address: "Hoskote, Bengaluru, Karnataka 562114",
    serviceArea: "We work across all of Bengaluru",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=STUDIO+11+INTERIOR+Hoskote",
    mapQuery: "STUDIO 11 INTERIOR, Hoskote, Karnataka",
    email: "",
    instagram: "",
  },
};
