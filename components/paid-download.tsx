import Link from "next/link";
import { formatUsd, type Product } from "@/lib/products";

export function CheckoutMessage({
  title,
  body,
  backHref = "/",
  backLabel = "Back to packs",
}: {
  title: string;
  body: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-serif text-4xl tracking-tight text-cream">{title}</h1>
      <p className="mt-4 text-sm leading-6 text-muted">{body}</p>
      <Link
        href={backHref}
        className="mt-8 inline-flex h-11 w-fit items-center justify-center rounded-md border border-line px-4 text-sm text-cream/85"
      >
        {backLabel}
      </Link>
    </main>
  );
}

export function PaidDownload({
  product,
  sessionId,
  backHref = "/",
  backLabel = "Back to packs",
}: {
  product: Product;
  sessionId: string;
  backHref?: string;
  backLabel?: string;
}) {
  const downloadHref = `/api/download?sku=${encodeURIComponent(product.sku)}&session_id=${encodeURIComponent(sessionId)}`;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
        Payment received
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-cream">
        Your zip is ready.
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        {product.name} · {formatUsd(product.priceUsd)}. Instant download —
        this link re-checks that the Checkout session is paid and matches
        this SKU before the file streams.
      </p>
      <a
        href={downloadHref}
        className="mt-8 inline-flex h-12 w-fit items-center justify-center rounded-md bg-brass px-5 text-sm font-semibold text-ink transition hover:bg-brass-bright"
      >
        Download {product.packFile}
      </a>
      <Link
        href={backHref}
        className="mt-4 text-sm text-muted underline-offset-4 hover:text-cream hover:underline"
      >
        {backLabel}
      </Link>
    </main>
  );
}
