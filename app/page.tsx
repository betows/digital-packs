import { BuyButton } from "@/components/buy-button";
import { ProductCard } from "@/components/product-card";
import { formatUsd, PRODUCTS } from "@/lib/products";

const featured = PRODUCTS.find((product) => product.sku === "outbound-ops-kit");
const catalog = PRODUCTS.filter((product) => product.sku !== "outbound-ops-kit");

export default function Home() {
  if (!featured) {
    throw new Error("Outbound Ops Kit is missing from the catalog");
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
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BuyButton
            sku={featured.sku}
            priceLabel={formatUsd(featured.priceUsd)}
            available
            featured
          />
          <a
            href="#packs"
            className="inline-flex h-12 items-center justify-center rounded-md border border-line px-5 text-sm text-cream/85 transition hover:border-cream/30"
          >
            See the packs
          </a>
        </div>
        <dl className="mt-10 grid max-w-2xl grid-cols-1 gap-4 text-sm text-muted sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-cream">Instant zip</dt>
            <dd className="mt-1">Download after Stripe confirms payment.</dd>
          </div>
          <div>
            <dt className="font-semibold text-cream">One-time</dt>
            <dd className="mt-1">No subscription. Keep the files.</dd>
          </div>
          <div>
            <dt className="font-semibold text-cream">No calls</dt>
            <dd className="mt-1">Downloads only. Nobody is waiting on a calendar.</dd>
          </div>
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <ProductCard product={featured} />
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
