import { BuyButton } from "@/components/buy-button";
import { PackPreview } from "@/components/pack-preview";
import { ProductCard } from "@/components/product-card";
import { formatUsd, PRODUCTS } from "@/lib/products";

const HERO_SKU = "outbound-ops-kit";
const FEATURED_SKU = "front-desk-bundle";

const featured = PRODUCTS.find((product) => product.sku === FEATURED_SKU);
const hero = PRODUCTS.find((product) => product.sku === HERO_SKU);
const catalog = PRODUCTS.filter(
  (product) => product.sku !== FEATURED_SKU && product.sku !== HERO_SKU,
);

export default function Home() {
  if (!featured || !hero) {
    throw new Error("Featured catalog SKUs are missing");
  }

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
          Digital packs for local service SMBs
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight text-cream sm:text-6xl">
          Stop rewriting the same follow-up every Monday.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Instant-download kits for dental, salon, and home-service operators.
          Pay once. Unzip. Run it today. The Outbound Ops Kit is the primary
          pack — sequences, subjects, snippets, tracker, SOP.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
          <li className="rounded-full border border-brass/40 bg-brass/10 px-3 py-1 text-brass">
            Instant download after Stripe
          </li>
          <li className="rounded-full border border-brass/40 bg-brass/10 px-3 py-1 text-brass">
            30-day email refund
          </li>
          <li className="rounded-full border border-line px-3 py-1 text-muted">
            Pay once · keep the files
          </li>
        </ul>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <BuyButton
                sku={hero.sku}
                priceLabel={formatUsd(hero.priceUsd)}
                available
                featured
              />
              <a
                href="#front-desk-bundle"
                className="inline-flex h-12 items-center justify-center rounded-md border border-line px-5 text-sm text-cream/85 transition hover:border-cream/30"
              >
                Front Desk Bundle {formatUsd(featured.priceUsd)}
              </a>
            </div>
            <p className="mt-3 text-sm text-muted">
              Instant zip after Stripe confirms payment. 30-day email refund if
              the files are not useful.
            </p>
            <dl className="mt-8 grid max-w-2xl grid-cols-1 gap-4 text-sm text-muted sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-cream">Instant download after Stripe</dt>
                <dd className="mt-1">The zip unlocks on the success page — no email drip.</dd>
              </div>
              <div>
                <dt className="font-semibold text-cream">30-day email refund</dt>
                <dd className="mt-1">Write us within 30 days if you want your money back.</dd>
              </div>
              <div>
                <dt className="font-semibold text-cream">No calls</dt>
                <dd className="mt-1">Downloads only. Nobody is waiting on a calendar.</dd>
              </div>
            </dl>
          </div>
          <PackPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
              Best for front desk
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight text-cream">
              Front Desk Bundle
            </h2>
          </div>
        </div>
        <ProductCard product={featured} />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <ProductCard product={hero} />
      </section>

      <section id="packs" className="mx-auto max-w-6xl px-5 pt-6 pb-20 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-cream">
              The rest of the shelf
            </h2>
            <p className="mt-2 text-sm text-muted">
              Live packs unlock a zip after checkout. Coming-soon cards stay
              disabled until the file is ready.
            </p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {catalog.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
