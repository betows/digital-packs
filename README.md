# Digital Packs

Next.js (App Router) + Tailwind sales site for instant-download digital kits. Local service SMBs pay on Stripe Checkout, then download a zip. There is no live Buy CTA without a post-payment download, no booking calendar, and no mailto to an operator.

## Live SKUs

| SKU | Product | Price | Stripe Price |
| --- | --- | --- | --- |
| `outbound-ops-kit` | Outbound Ops Kit | $49 | `price_1UJlu44v69r4DPC8TWmMaWwK` |
| `gbp-post-pack` | GBP Post Pack | $27 | `price_1UJltG4v69r4DPC8dwKEfa3I` |

Gated files live in `packs/` (not under `public/`):

- `packs/outbound-ops-kit.zip`
- `packs/gbp-post-pack.zip`

Coming soon (cards shown, Buy disabled): Missed-Call Recovery $29 · Ads Swipe $35 · Notion CRM Lite $39 · Landing Page Pack $99.

## Checkout and delivery

1. `POST /api/checkout` with `{ "sku": "outbound-ops-kit" }` or `{ "sku": "gbp-post-pack" }` creates a Stripe Checkout Session (`mode: payment`), sets `metadata.sku`, and uses success `/success?session_id={CHECKOUT_SESSION_ID}` / cancel `/`.
2. `/success` retrieves the session and shows **Download** only when Stripe reports `payment_status=paid` for that SKU.
3. `GET /api/download?sku=&session_id=` re-verifies paid + matching `metadata.sku`, then streams the zip. There is no ungated public pack URL.

## Environment

Copy `.env.example` to `.env.local`:

```
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_OUTBOUND_OPS_KIT=price_1UJlu44v69r4DPC8TWmMaWwK
STRIPE_PRICE_GBP_POST_PACK=price_1UJltG4v69r4DPC8dwKEfa3I
```

`STRIPE_SECRET_KEY` is required for checkout, success verification, and download. Price env vars override the catalog defaults; do not invent other Price IDs. The publishable key is reserved for Stripe.js if you add client confirmation later — hosted Checkout does not need it to redirect.

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
```
