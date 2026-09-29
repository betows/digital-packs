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
  badge?: string;
  stripePriceId?: string;
  stripePriceEnv?: string;
  stripePaymentLinkId?: string;
  stripePaymentLinkUrl?: string;
  packFile?: string;
  pagePath?: string;
  successPath?: string;
};

export const INVOICEBATCH_PAYMENT_LINK_ID = "plink_1UKjjXGum6mar7mKBCp3Qycd";
export const INVOICEBATCH_PAYMENT_LINK_URL =
  "https://buy.stripe.com/3cI8wPews3n86RJa2B2wU00";

export const LIVE_PRICE_IDS = {
  "outbound-ops-kit": "price_1UJlu44v69r4DPC8TWmMaWwK",
  "gbp-post-pack": "price_1UJltG4v69r4DPC8dwKEfa3I",
  "missed-call-recovery": "price_1UJlwd4v69r4DPC8Ao7fsixe",
  "ads-swipe-pack": "price_1UJlwf4v69r4DPC8JZu7mVWh",
  "notion-crm-lite": "price_1UJweHGum6mar7mKS7M4BocS",
  "landing-page-pack": "price_1UJwlfGum6mar7mKl69AgJHC",
  "front-desk-bundle": "price_1UKMKiGum6mar7mKlPdMyGG3",
  invoicebatch: "price_1UKjjXGum6mar7mK4xhHMieB",
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
    name: "Missed-Call Recovery Pack",
    priceUsd: 29,
    tagline: "SMS + email for the lead who called and nobody answered.",
    description:
      "Day 0 / 1 / 3 templates for dental, salon, and HVAC/plumbing — plus a one-page SOP and a simple log sheet. First text within 15 minutes beats a perfect Day 3.",
    includes: [
      "SMS sequences for dental, salon, and home services",
      "Email Day 0 / Day 3 for all verticals",
      "One-page SOP",
      "Tracker / log sheet",
    ],
    notIncluded: [
      "A phone system",
      "A dialer",
      "A CRM",
      "An SMS sender",
    ],
    status: "live",
    stripePriceId: LIVE_PRICE_IDS["missed-call-recovery"],
    stripePriceEnv: "STRIPE_PRICE_MISSED_CALL_RECOVERY",
    packFile: "missed-call-recovery-pack.zip",
  },
  {
    sku: "ads-swipe-pack",
    name: "Local Ads Swipe Pack",
    priceUsd: 35,
    tagline: "20 Meta ad swipes and 10 organic captions.",
    description:
      "Paste-ready hooks for dental, salon, and HVAC/plumbing — plus a one-page SOP for Meta Ads Manager. You bring the photos and the billing.",
    includes: [
      "20 Meta (Facebook / Instagram) ad swipes",
      "10 organic captions",
      "Dental, salon, and HVAC / plumbing tracks",
      "One-page paste SOP",
    ],
    notIncluded: [
      "An ad account",
      "Pixel setup",
      "Creative design",
      "Managed ads",
    ],
    status: "live",
    stripePriceId: LIVE_PRICE_IDS["ads-swipe-pack"],
    stripePriceEnv: "STRIPE_PRICE_ADS_SWIPE_PACK",
    packFile: "ads-swipe-pack.zip",
  },
  {
    sku: "notion-crm-lite",
    name: "Notion CRM Lite",
    priceUsd: 39,
    tagline: "A small pipeline for operators who hate CRMs.",
    description:
      "A lightweight Notion pipeline: Lead → Booked → Showed → Paid. Schema, views, CSV template, and a one-page SOP — nothing else.",
    includes: [
      "Leads database schema (Lead / Booked / Showed / Paid)",
      "Status definitions and four filtered views",
      "CSV import template with example rows",
      "One-page Notion build SOP",
    ],
    notIncluded: [
      "Hosted CRM software",
      "Automations",
      "An SMS sender",
    ],
    status: "live",
    stripePriceId: LIVE_PRICE_IDS["notion-crm-lite"],
    stripePriceEnv: "STRIPE_PRICE_NOTION_CRM_LITE",
    packFile: "notion-crm-lite.zip",
  },
  {
    sku: "landing-page-pack",
    name: "Landing Page Pack",
    priceUsd: 99,
    tagline: "Copy and section map for a one-page service site.",
    description:
      "English page copy for dental, salon, and HVAC/plumbing — plus a section map you can hand to any builder. Not a hosted site.",
    includes: [
      "Page copy for dental, salon, and HVAC / plumbing",
      "Universal section map (hero through final CTA)",
      "One-page builder SOP",
      "Wireframe notes for Framer, Webflow, Carrd, or WordPress",
    ],
    notIncluded: [
      "A hosted website",
      "Developer hours",
    ],
    status: "live",
    stripePriceId: LIVE_PRICE_IDS["landing-page-pack"],
    stripePriceEnv: "STRIPE_PRICE_LANDING_PAGE_PACK",
    packFile: "landing-page-pack.zip",
  },
  {
    sku: "review-referral-rocket",
    name: "Review & Referral Rocket Pack",
    priceUsd: 29,
    tagline:
      "SMS + email scripts to ask for Google reviews and referrals (dental / salon / HVAC) — without the awkward ask.",
    description:
      "Includes 1-page SOP, 30-second QR tip, and a simple CSV tracker. Pay once, unzip, no login.",
    includes: [
      "SMS + email scripts for dental, salon, and HVAC",
      "1-page SOP",
      "30-second QR tip",
      "Simple CSV tracker",
    ],
    notIncluded: [
      "Review software",
      "SMS sender",
      "Fake reviews",
    ],
    status: "live",
    stripePriceEnv: "STRIPE_PRICE_REVIEW_REFERRAL_ROCKET",
    packFile: "review-referral-rocket.zip",
  },
  {
    sku: "front-desk-bundle",
    name: "Front Desk Bundle",
    priceUsd: 79,
    tagline: "Missed-call, reviews, and GBP posts in one zip.",
    description:
      "The front-desk stack: recover the missed call, ask for the review, and keep Google posts moving. Merge of Missed-Call Recovery + Review & Referral Rocket + GBP Post Pack.",
    includes: [
      "Missed-Call Recovery Pack (SMS + email + SOP)",
      "Review & Referral Rocket Pack (scripts + QR tip + tracker)",
      "GBP Post Pack (30 posts + 30-day calendar + paste SOP)",
    ],
    notIncluded: [
      "A phone system",
      "An SMS sender",
      "Review software",
      "A Google Business Profile login",
    ],
    status: "live",
    featured: true,
    badge: "Best for front desk",
    stripePriceId: LIVE_PRICE_IDS["front-desk-bundle"],
    stripePriceEnv: "STRIPE_PRICE_FRONT_DESK_BUNDLE",
    packFile: "front-desk-bundle.zip",
  },
  {
    sku: "invoicebatch",
    name: "InvoiceBatch",
    priceUsd: 47,
    tagline: "CSV in → branded invoice PDFs. One command, no monthly fee.",
    description:
      "A Python CLI for freelancers and small ops teams who already live in spreadsheets. Company brand, tax, and payment terms live in a 10-line JSON file.",
    includes: [
      "invoicebatch/ CLI (CSV → branded PDF)",
      "Sample CSV and company.json",
      "run.sh one-command launcher",
      "README + license (personal and commercial invoices)",
    ],
    notIncluded: [
      "Payment collection",
      "QuickBooks / Wave / Stripe Invoicing sync",
      "A hosted invoicing app",
    ],
    status: "live",
    badge: "CLI kit",
    stripePriceId: LIVE_PRICE_IDS.invoicebatch,
    stripePriceEnv: "STRIPE_PRICE_INVOICEBATCH",
    stripePaymentLinkId: INVOICEBATCH_PAYMENT_LINK_ID,
    stripePaymentLinkUrl: INVOICEBATCH_PAYMENT_LINK_URL,
    packFile: "InvoiceBatch-v1.zip",
    pagePath: "/invoicebatch",
    successPath: "/api/invoicebatch/access",
  },
];

export function getProduct(sku: string | null | undefined): Product | undefined {
  if (!sku) return undefined;
  return PRODUCTS.find((product) => product.sku === sku);
}

export function getLiveProduct(sku: string | null | undefined): Product | undefined {
  const product = getProduct(sku);
  if (!product || product.status !== "live" || !product.packFile) {
    return undefined;
  }
  if (!product.stripePriceId && !product.stripePriceEnv) {
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
  if (product.status !== "live") {
    throw new Error(`SKU ${product.sku} is not for sale`);
  }
  if (product.stripePriceEnv) {
    const fromEnv = process.env[product.stripePriceEnv]?.trim();
    if (fromEnv) return fromEnv;
  }
  if (product.stripePriceId) {
    return product.stripePriceId;
  }
  throw new Error(`SKU ${product.sku} is not for sale`);
}

function paymentLinkIdOf(
  paymentLink: string | { id?: string | null } | null | undefined,
): string {
  if (typeof paymentLink === "string") return paymentLink.trim();
  return paymentLink?.id?.trim() ?? "";
}

export function getSkuForPaymentLinkId(
  paymentLink: string | { id?: string | null } | null | undefined,
): string {
  const id = paymentLinkIdOf(paymentLink);
  if (!id) return "";
  return (
    PRODUCTS.find((product) => product.stripePaymentLinkId === id)?.sku ?? ""
  );
}

export function getSkuForStripePriceId(
  priceId: string | null | undefined,
): string {
  const id = priceId?.trim() ?? "";
  if (!id) return "";
  for (const product of PRODUCTS) {
    if (product.stripePriceId === id) return product.sku;
    const fromEnv = product.stripePriceEnv
      ? process.env[product.stripePriceEnv]?.trim()
      : "";
    if (fromEnv && fromEnv === id) return product.sku;
  }
  return "";
}
