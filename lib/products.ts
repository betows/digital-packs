export type ProductStatus = "live" | "coming-soon";

export type Product = {
  sku: string;
  name: string;
  priceUsd: number;
  tagline: string;
  description: string;
  includes: string[];
  notIncluded: string[];
  status: ProductStatus;
  featured?: boolean;
  stripePriceId?: string;
  stripePriceEnv?: string;
  packFile?: string;
};

export const LIVE_PRICE_IDS = {
  "outbound-ops-kit": "price_1UJlu44v69r4DPC8TWmMaWwK",
  "gbp-post-pack": "price_1UJltG4v69r4DPC8dwKEfa3I",
} as const;

export const PRODUCTS: Product[] = [
  {
    sku: "outbound-ops-kit",
    name: "Outbound Ops Kit",
    priceUsd: 49,
    tagline: "Sequences, subjects, snippets, tracker, SOP.",
    description:
      "The Day 0 / 3 / 7 cadence for operators who still chase follow-ups by hand. Built for dental, salon, and home-service shops — plus a general B2B track.",
    includes: [
      "3 email sequences (service SMB, ops angle, general B2B)",
      "20 subject lines",
      "Reply snippets",
      "Tracker columns for Notion or Sheets",
      "One-page SOP",
    ],
    notIncluded: [
      "A sending tool",
      "A lead list",
      "An Instantly clone",
    ],
    status: "live",
    featured: true,
    stripePriceId: LIVE_PRICE_IDS["outbound-ops-kit"],
    stripePriceEnv: "STRIPE_PRICE_OUTBOUND_OPS_KIT",
    packFile: "outbound-ops-kit.zip",
  },
  {
    sku: "gbp-post-pack",
    name: "GBP Post Pack",
    priceUsd: 27,
    tagline: "30 ready-to-paste Google Business Profile posts.",
    description:
      "English posts for dental, salon, and HVAC/plumbing — plus a 30-day rotation map and a one-page paste SOP.",
    includes: [
      "10 dental posts",
      "10 salon posts",
      "10 HVAC / plumbing posts",
      "30-day calendar",
      "SOP for pasting into GBP",
    ],
    notIncluded: [
      "Ad accounts",
      "Boosting",
      "Review generation",
    ],
    status: "live",
    stripePriceId: LIVE_PRICE_IDS["gbp-post-pack"],
    stripePriceEnv: "STRIPE_PRICE_GBP_POST_PACK",
    packFile: "gbp-post-pack.zip",
  },
  {
    sku: "missed-call-recovery",
    name: "Missed-Call Recovery",
    priceUsd: 29,
    tagline: "Same-day scripts for the slot that just cancelled.",
    description:
      "Text and call scripts to fill an empty chair or truck before the day is gone.",
    includes: ["Recovery scripts", "Same-day offer frames"],
    notIncluded: ["A dialer or SMS sender"],
    status: "coming-soon",
  },
  {
    sku: "ads-swipe",
    name: "Ads Swipe",
    priceUsd: 35,
    tagline: "Local-service ad angles you can rewrite today.",
    description:
      "Swipe copy for the offers local shops actually run — not generic SaaS ads.",
    includes: ["Ad angles", "Rewrite prompts"],
    notIncluded: ["Ad accounts or media spend"],
    status: "coming-soon",
  },
  {
    sku: "notion-crm-lite",
    name: "Notion CRM Lite",
    priceUsd: 39,
    tagline: "A small pipeline for operators who hate CRMs.",
    description:
      "A lightweight Notion pipeline: lead, booked, showed, paid. Nothing else.",
    includes: ["Notion schema", "Status definitions"],
    notIncluded: ["Hosted CRM software"],
    status: "coming-soon",
  },
  {
    sku: "landing-page-pack",
    name: "Landing Page Pack",
    priceUsd: 99,
    tagline: "Copy and section map for a one-page service site.",
    description:
      "Headlines, proof blocks, and a section order you can hand to any builder.",
    includes: ["Page copy", "Section map"],
    notIncluded: ["A hosted website or developer hours"],
    status: "coming-soon",
  },
];

export function getProduct(sku: string | null | undefined): Product | undefined {
  if (!sku) return undefined;
  return PRODUCTS.find((product) => product.sku === sku);
}

export function getLiveProduct(sku: string | null | undefined): Product | undefined {
  const product = getProduct(sku);
  if (!product || product.status !== "live" || !product.packFile || !product.stripePriceId) {
    return undefined;
  }
  return product;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStripePriceId(product: Product): string {
  if (product.status !== "live" || !product.stripePriceId) {
    throw new Error(`SKU ${product.sku} is not for sale`);
  }
  if (product.stripePriceEnv) {
    const fromEnv = process.env[product.stripePriceEnv]?.trim();
    if (fromEnv) return fromEnv;
  }
  return product.stripePriceId;
}
