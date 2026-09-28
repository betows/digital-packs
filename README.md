# Digital Packs

Next.js (App Router) + Tailwind sales site for instant-download digital kits. Local service SMBs pay on Stripe Checkout, then download a zip. There is no live Buy CTA without a post-payment download, no booking calendar, and no mailto to an operator.

## Live SKUs

| SKU | Product | Price | Stripe Price |
| --- | --- | --- | --- |
| `outbound-ops-kit` | Outbound Ops Kit | $49 | `price_1UJlu44v69r4DPC8TWmMaWwK` |
| `gbp-post-pack` | GBP Post Pack | $27 | `price_1UJltG4v69r4DPC8dwKEfa3I` |
| `missed-call-recovery` | Missed-Call Recovery Pack | $29 | `price_1UJlwd4v69r4DPC8Ao7fsixe` |
| `ads-swipe-pack` | Local Ads Swipe Pack | $35 | `price_1UJlwf4v69r4DPC8JZu7mVWh` |
| `notion-crm-lite` | Notion CRM Lite | $39 | `price_1UJweHGum6mar7mKS7M4BocS` |
| `landing-page-pack` | Landing Page Pack | $99 | `price_1UJwlfGum6mar7mKl69AgJHC` |
| `review-referral-rocket` | Review & Referral Rocket Pack | $29 | `STRIPE_PRICE_REVIEW_REFERRAL_ROCKET` |
| `front-desk-bundle` | Front Desk Bundle | $79 | `price_1UKMKiGum6mar7mKlPdMyGG3` |
| `invoicebatch` | InvoiceBatch | $47 | `price_1UKjjXGum6mar7mK4xhHMieB` |

Gated files live in `packs/` (not under `public/`):

- `packs/outbound-ops-kit.zip`
- `packs/gbp-post-pack.zip`
- `packs/missed-call-recovery-pack.zip`
- `packs/ads-swipe-pack.zip`
- `packs/notion-crm-lite.zip`
- `packs/landing-page-pack.zip`
- `packs/review-referral-rocket.zip`
- `packs/front-desk-bundle.zip`
- `packs/InvoiceBatch-v1.zip`

Public lead magnet (ungated):

- `/free` — Day 0 sample from Outbound Ops Kit (HTML + `public/samples/outbound-ops-kit-day0.md`)
- `/partners` — wholesale stub (bundle $40 / pack $15; reply PARTNER)
- `/invoicebatch` — InvoiceBatch landing. Primary CTA is the live Stripe Payment Link (`https://buy.stripe.com/3cI8wPews3n86RJa2B2wU00`). After payment, Stripe redirects to `/invoicebatch/success?session_id={CHECKOUT_SESSION_ID}`.

Cold links should keep UTM query params. Buy buttons forward `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` into Stripe Checkout metadata. Suggested campaign: `?utm_source=cold|gumroad|etsy|dir|reddit&utm_campaign=sprint1003`.

Checkout sessions set `allow_promotion_codes: true` so a Dashboard promo (for approved partners) can be entered later. No public coupon is published as live. Do not invent PARTNER coupons for InvoiceBatch.

## Checkout and delivery

1. `POST /api/checkout` with `{ "sku": "<live-sku>" }` creates a Stripe Checkout Session (`mode: payment`), sets `metadata.sku` (plus any `utm_*` fields), enables promo codes, and uses success `/success?session_id={CHECKOUT_SESSION_ID}` (InvoiceBatch uses `/invoicebatch/success?session_id={CHECKOUT_SESSION_ID}`) / cancel back to the page the buyer left.
2. `/success` and `/invoicebatch/success` retrieve the session and show **Download** only when Stripe reports `payment_status=paid` for that SKU. Payment Link sessions often omit `metadata.sku`; fulfillment also accepts a matching line-item price ID or the InvoiceBatch Payment Link ID.
3. `GET /api/download?sku=&session_id=` re-verifies paid + matching SKU (metadata, price ID, or Payment Link ID), then streams the zip. There is no ungated public pack URL.
4. Stripe `checkout.session.completed` hits `POST /api/webhooks/stripe`. After signature verification, the handler POSTs a small JSON sale payload to `SALE_NOTIFY_WEBHOOK_URL` when that env is set. SKU resolution falls back to Payment Link ID / price ID when session metadata is empty.

## Environment

Copy `.env.example` to `.env.local`:

```
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
SALE_NOTIFY_WEBHOOK_URL=
SALE_NOTIFY_AUTHORIZATION=
STRIPE_PRICE_OUTBOUND_OPS_KIT=price_1UJlu44v69r4DPC8TWmMaWwK
STRIPE_PRICE_GBP_POST_PACK=price_1UJltG4v69r4DPC8dwKEfa3I
STRIPE_PRICE_MISSED_CALL_RECOVERY=price_1UJlwd4v69r4DPC8Ao7fsixe
STRIPE_PRICE_ADS_SWIPE_PACK=price_1UJlwf4v69r4DPC8JZu7mVWh
STRIPE_PRICE_NOTION_CRM_LITE=price_1UJweHGum6mar7mKS7M4BocS
STRIPE_PRICE_LANDING_PAGE_PACK=price_1UJwlfGum6mar7mKl69AgJHC
STRIPE_PRICE_REVIEW_REFERRAL_ROCKET=
STRIPE_PRICE_FRONT_DESK_BUNDLE=price_1UKMKiGum6mar7mKlPdMyGG3
STRIPE_PRICE_INVOICEBATCH=price_1UKjjXGum6mar7mK4xhHMieB
NEXT_PUBLIC_META_PIXEL_ID=
```

`STRIPE_SECRET_KEY` is required for checkout, success verification, and download. Price env vars override the catalog defaults; do not invent other Price IDs. The publishable key is reserved for Stripe.js if you add client confirmation later — hosted Checkout does not need it to redirect.

Set `STRIPE_PRICE_INVOICEBATCH=price_1UKjjXGum6mar7mK4xhHMieB` on Vercel so checkout/download stay consistent with the live Payment Link price. `NEXT_PUBLIC_META_PIXEL_ID` is optional; leave empty until Meta Business Manager is unlocked. When set, `/invoicebatch` loads the base pixel and `/invoicebatch/success` fires `Purchase` (value 47, USD) only after a paid session is verified.

`STRIPE_WEBHOOK_SECRET`, `SALE_NOTIFY_WEBHOOK_URL`, and `SALE_NOTIFY_AUTHORIZATION` are server-only. Do not prefix them with `NEXT_PUBLIC_`. The webhook secret is required to verify Stripe signatures. The notify URL is optional during setup — if it is unset, the route still returns 200 after a valid signature so Stripe does not retry forever. When `SALE_NOTIFY_AUTHORIZATION` is set (full header value, e.g. `Bearer …`), it is sent as the `Authorization` header on the scoreboard POST.

Subscribe the Stripe Dashboard endpoint to **checkout.session.completed** only, pointing at `https://digital-packs.vercel.app/api/webhooks/stripe`.

## Scripts

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm start
```
