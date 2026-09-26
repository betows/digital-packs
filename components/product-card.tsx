import { BuyButton } from "@/components/buy-button";
import { formatUsd, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const live = product.status === "live";
  const priceLabel = formatUsd(product.priceUsd);

  return (
    <article
      id={product.sku}
      className={`flex h-full flex-col rounded-xl border p-6 ${
        product.featured
          ? "border-brass/40 bg-paper shadow-[0_0_0_1px_rgba(212,160,23,0.12)]"
          : "border-line bg-paper-muted/60"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
        <span className={live ? "text-brass" : "text-muted"}>
          {live ? "Instant download" : "Coming soon"}
        </span>
        <span className="text-muted">{priceLabel}</span>
      </div>
      <h3 className="font-serif text-2xl tracking-tight text-cream">
        {product.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">{product.tagline}</p>
      <p className="mt-3 text-sm leading-6 text-cream/80">{product.description}</p>
      <ul className="mt-5 space-y-2 text-sm text-cream/85">
        {product.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {product.notIncluded.length > 0 ? (
        <p className="mt-4 text-xs leading-5 text-muted">
          Not included: {product.notIncluded.join(" · ")}
        </p>
      ) : null}
      <div className="mt-auto pt-6">
        <BuyButton
          sku={product.sku}
          priceLabel={priceLabel}
          available={live}
        />
      </div>
    </article>
  );
}
