import Link from "next/link";
import { assertPaidSessionForSku } from "@/lib/entitlement";
import { formatUsd, getLiveProduct } from "@/lib/products";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function Message({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-serif text-4xl tracking-tight text-cream">{title}</h1>
      <p className="mt-4 text-sm leading-6 text-muted">{body}</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 w-fit items-center justify-center rounded-md border border-line px-4 text-sm text-cream/85"
      >
        Back to packs
      </Link>
    </main>
  );
}

export default async function SuccessPage({
  searchParams,
}: PageProps<"/success">) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";

  if (!sessionId) {
    return (
      <Message
        title="Missing checkout session"
        body="This page only works after Stripe Checkout. There is no ungated download."
      />
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sku = session.metadata?.sku ?? "";
    const product = getLiveProduct(sku);
    const entitlement = assertPaidSessionForSku(session, sku);

    if (!product || !entitlement.ok) {
      return (
        <Message
          title="Payment not confirmed"
          body="Stripe has not marked this session as paid for a live pack. The zip stays gated."
        />
      );
    }

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
          href="/"
          className="mt-4 text-sm text-muted underline-offset-4 hover:text-cream hover:underline"
        >
          Back to packs
        </Link>
      </main>
    );
  } catch {
    return (
      <Message
        title="Could not verify checkout"
        body="The session could not be retrieved from Stripe. No file is served until payment is confirmed."
      />
    );
  }
}
