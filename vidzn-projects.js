/* VIDZN — project library.
 *
 * Every card, the "All work" view and every case study are built from this list.
 *
 * Adding real assets: put images in  work/<key>/  and point the fields at them, e.g.
 *   cover: "work/nyota/cover.jpg"        card image           (portrait 4:5, ~1400px wide)
 *   hero:  "work/nyota/hero.jpg"         case study hero      (landscape 16:9, ~2200px wide)
 *   gallery: [["work/nyota/g1.jpg","IDENTITY"], ...]    up to 6, first one is the big tile
 *   feed:    [["work/nyota/post1.jpg","POST / 01"], ...] social posts (4:5)
 *   stories: [["work/nyota/story1.jpg","STORY / INTRO"], ...] vertical 9:16
 * Anything left empty is simply hidden in the case study. No images at all → a branded placeholder.
 *
 * featured: true  → shown on the homepage (first 4 featured, in this order).
 * live            → adds a "Visit live site" button.
 */

// Temporary stock imagery — delete once real work/<key>/ images are in.
{ // block scope keeps the helper out of the global namespace
const u = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?q=85&w=${w}&auto=format&fit=crop`;

window.VIDZN_PROJECTS = [
  {
    key: "nyota", title: "NYOTA", featured: true, year: "2026",
    category: "Digital", tags: "Brand Identity / Digital Experience",
    live: "", // TODO: live website URL
    colors: ["#e8dccb", "#8c6b4f"],
    cover: u("1519225421980-715cb0215aed"), hero: u("1519225421980-715cb0215aed", 2200),
    kicker: "BRAND / DIGITAL EXPERIENCE",
    intro: "A digital wedding experience with a distinct point of view.",
    heading: "A brand experience that feels personal before the first interaction.",
    copy: "NYOTA is presented as a refined, emotional visual world — balancing editorial typography, intimate imagery and a digital-first system that can move from identity to social and web.",
    services: "Brand Identity / Digital Experience", output: "Identity / Social / Digital",
    system: "A calm, editorial system built around hierarchy, emotion and detail.",
    gallery: [[u("1519225421980-715cb0215aed",1200),"HERO / IDENTITY"],[u("1523438885200-e635ba2c371e",900),"EDITORIAL"],[u("1511285560929-80b456fea0bc",900),"MOMENT"],[u("1465495976277-4387d4b0e4a6",900),"DETAIL"],[u("1519741497674-611481863552",900),"CAMPAIGN"],[u("1519225421980-715cb0215aed",900),"DIGITAL"]],
    feed: [[u("1519741497674-611481863552",700),"POST / 01"],[u("1465495976277-4387d4b0e4a6",700),"POST / 02"],[u("1511285560929-80b456fea0bc",700),"CAROUSEL"],[u("1519225421980-715cb0215aed",700),"POST / 03"],[u("1523438885200-e635ba2c371e",700),"QUOTE"],[u("1519741497674-611481863552",700),"POST / 04"]],
    stories: [[u("1519225421980-715cb0215aed",500),"STORY / INTRO"],[u("1465495976277-4387d4b0e4a6",500),"STORY / DETAIL"],[u("1511285560929-80b456fea0bc",500),"STORY / MOMENT"],[u("1519741497674-611481863552",500),"STORY / CTA"]],
    type: "Editorial typography, high-contrast hierarchy and generous negative space.",
    imageNote: "Intimate photography treated as part of the identity rather than decoration.",
    motion: "Soft reveals, image drift and restrained transitions keep the experience emotional.",
  },
  {
    key: "flowrian", title: "FLOWRIAN", featured: true, year: "2026",
    category: "Digital", tags: "Digital / Content System",
    live: "", // TODO: GitHub Pages landing URL
    colors: ["#1d2b53", "#7aa2ff"],
    cover: u("1618005182384-a83a8bd57fbe"), hero: u("1618005182384-a83a8bd57fbe", 2200),
    kicker: "DIGITAL / CONTENT SYSTEM",
    intro: "A flexible visual system built for everyday brand communication.",
    heading: "A content system designed to keep showing up without looking the same.",
    copy: "FLOWRIAN explores a modular visual language for digital communication — combining bold type, graphic composition, image-led layouts and repeatable content formats.",
    services: "Digital / Content System", output: "Social / Content / Digital",
    system: "A modular toolkit where every post feels like part of one larger visual universe.",
    gallery: [[u("1618005182384-a83a8bd57fbe",1200),"SYSTEM / HERO"],[u("1558655146-d09347e92766",900),"LAYOUT"],[u("1561070791-2526d30994b5",900),"IDENTITY"],[u("1559028012-481c04fa702d",900),"DIGITAL"],[u("1497366754035-f200968a6e72",900),"CONTENT"],[u("1545235617-9465d2a55698",900),"CAMPAIGN"]],
    feed: [[u("1618005182384-a83a8bd57fbe",700),"POST / 01"],[u("1558655146-d09347e92766",700),"POST / 02"],[u("1561070791-2526d30994b5",700),"CAROUSEL"],[u("1559028012-481c04fa702d",700),"POST / 03"],[u("1545235617-9465d2a55698",700),"QUOTE"],[u("1497366754035-f200968a6e72",700),"POST / 04"]],
    stories: [[u("1618005182384-a83a8bd57fbe",500),"STORY / HOOK"],[u("1558655146-d09347e92766",500),"STORY / PRODUCT"],[u("1561070791-2526d30994b5",500),"STORY / TYPE"],[u("1559028012-481c04fa702d",500),"STORY / CTA"]],
    type: "Large display typography balanced by a compact utility hierarchy.",
    imageNote: "Graphic imagery, texture and composition create repeatable content signatures.",
    motion: "Fast directional movement and staggered reveals give the system digital energy.",
  },
  {
    key: "maharaj", title: "MAHARAJ", name: "MAHARAJ SAMOSA", featured: true, year: "2026",
    category: "Packaging", tags: "Packaging / Campaign / Food",
    live: "", // TODO: GitHub Pages landing URL
    colors: ["#f2b632", "#7a1f12"],
    cover: u("1601050690597-df0568f70950"), hero: u("1601050690597-df0568f70950", 2200),
    kicker: "PACKAGING / CAMPAIGN / FOOD",
    intro: "A richer visual world for a food brand built around appetite.",
    heading: "Crispy Outside. Royal Inside.",
    copy: "MAHARAJ SAMOSA was pushed into a bold, premium food language — dramatic product photography, royal cues, rich contrast and social-first compositions designed to make the product the hero.",
    services: "Packaging / Campaign / Food", output: "Packaging / Social / Campaign",
    system: "A royal, appetite-led system where the product always owns the frame.",
    gallery: [[u("1601050690597-df0568f70950",1200),"CAMPAIGN / HERO"],[u("1628294895950-9805252327bc",900),"PRODUCT"],[u("1601050690117-94f5f6fa8bd7",900),"FOOD / DETAIL"],[u("1599487488170-d11ec9c172f0",900),"SOCIAL"],[u("1576618148400-f54bed99fcfd",900),"PACKAGING"],[u("1601050690597-df0568f70950",900),"AD / HERO"]],
    feed: [[u("1601050690597-df0568f70950",700),"POST / CRISPY"],[u("1628294895950-9805252327bc",700),"POST / ROYAL"],[u("1601050690117-94f5f6fa8bd7",700),"CAROUSEL / TASTE"],[u("1599487488170-d11ec9c172f0",700),"POST / PRODUCT"],[u("1576618148400-f54bed99fcfd",700),"PACKAGING"],[u("1601050690597-df0568f70950",700),"POST / CTA"]],
    stories: [[u("1601050690597-df0568f70950",500),"STORY / CRISPY OUTSIDE"],[u("1628294895950-9805252327bc",500),"STORY / ROYAL INSIDE"],[u("1601050690117-94f5f6fa8bd7",500),"STORY / DETAIL"],[u("1599487488170-d11ec9c172f0",500),"STORY / ORDER"]],
    type: "Bold uppercase display type with a premium, high-impact hierarchy.",
    imageNote: "Ultra-real food photography, dramatic shadows, mustard-gold glow and crisp product detail.",
    motion: "Punchy scale-ins, floating spice details and quick product reveals suit the appetite-first direction.",
  },

  // ——— New projects: copy + images pending. Until then they show a branded placeholder. ———
  {
    key: "vahika", title: "VAHIKA ORGANIC", featured: true, year: "2026",
    category: "Branding", tags: "Brand Identity", status: "In progress",
    live: "", colors: ["#3f6b3a", "#c9d98f"],
    kicker: "BRAND IDENTITY", intro: "Full case study coming soon.",
    heading: "Case study in progress.", copy: "We're putting together the full story behind this brand — strategy, identity and rollout. Check back soon, or ask us about it directly.",
    services: "Brand Identity", output: "—",
  },
  {
    key: "harsh", title: "HARSH ELECTRIC", year: "2026",
    category: "Branding", tags: "Brand Identity", status: "In progress",
    live: "", colors: ["#111827", "#facc15"],
    kicker: "BRAND IDENTITY", intro: "Full case study coming soon.",
    heading: "Case study in progress.", copy: "We're putting together the full story behind this brand — strategy, identity and rollout. Check back soon, or ask us about it directly.",
    services: "Brand Identity", output: "—",
  },
  {
    key: "bapasitaram", title: "BAPASITARAM CARTING", year: "2026",
    category: "Branding", tags: "Brand Identity", status: "In progress",
    live: "", colors: ["#7c2d12", "#fb923c"],
    kicker: "BRAND IDENTITY", intro: "Full case study coming soon.",
    heading: "Case study in progress.", copy: "We're putting together the full story behind this brand — strategy, identity and rollout. Check back soon, or ask us about it directly.",
    services: "Brand Identity", output: "—",
  },
  {
    key: "rivera", title: "RIVERA", year: "2026",
    category: "Branding", tags: "Brand Identity", status: "In progress",
    live: "", colors: ["#0e3a4f", "#7dd3fc"],
    kicker: "BRAND IDENTITY", intro: "Full case study coming soon.",
    heading: "Case study in progress.", copy: "We're putting together the full story behind this brand — strategy, identity and rollout. Check back soon, or ask us about it directly.",
    services: "Brand Identity", output: "—",
  },
];
}
