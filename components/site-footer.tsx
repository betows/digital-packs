import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export function SiteFooter() {
  const live = PRODUCTS.filter((product) => product.status === "live");

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="font-serif text-xl text-cream">Downloads only.</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Pay once on Stripe. Instant download after Checkout. 30-day email
          refund. There is no booking calendar, no operator on the other end,
          and no public pack URL — the file streams only after payment is
          verified.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/80">
          {live.map((product) => (
            <li key={product.sku}>
              <Link
                href={product.pagePath ?? `/#${product.sku}`}
                className="hover:text-cream"
              >
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <li>
            <Link href="/free" className="hover:text-cream">
              Free Day 0 sample
            </Link>
          </li>
          <li>
            <Link href="/partners" className="hover:text-cream">
              Partners
            </Link>
          </li>
          <li>
            <Link href="/affiliate" className="hover:text-cream">
              Affiliate
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
