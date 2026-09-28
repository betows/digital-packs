import type { Metadata } from "next";
import { MetaPixel } from "@/components/meta-pixel";
import { CheckoutMessage, PaidDownload } from "@/components/paid-download";
import { assertPaidSessionForSku } from "@/lib/entitlement";
import {
  getLiveProduct,
  getStripePriceId,
  type Product,
} from "@/lib/products";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const SKU = "invoicebatch";

export const metadata: Metadata = {
  title: "InvoiceBatch download — Digital Packs",
  description:
    "Thank you for buying InvoiceBatch. Download the zip after Stripe confirms payment.",
  robots: { index: false, follow: false },
};

async function loadPaidInvoiceBatch(sessionId: string): Promise<Product | null> {
  const product = getLiveProduct(SKU);
  if (!product) return null;
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });
  const entitlement = assertPaidSessionForSku(session, SKU, {
    priceId: getStripePriceId(product),
    paymentLinkId: product.stripePaymentLinkId,
  });
  if (!entitlement.ok) return null;
  return product;
}

export default async function InvoiceBatchSuccessPage({
  searchParams,
}: PageProps<"/invoicebatch/success">) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const product = getLiveProduct(SKU);

  if (!sessionId) {
    return (
      <CheckoutMessage
        title="Missing checkout session"
        body="This page only unlocks InvoiceBatch after a paid Stripe Payment Link (or Checkout) session. Add session_id from the Stripe redirect — there is no ungated zip."
        backHref="/invoicebatch"
        backLabel="Back to InvoiceBatch"
      />
    );
  }

  let paid: Product | null = null;
  let verifyFailed = false;
  try {
    paid = await loadPaidInvoiceBatch(sessionId);
  } catch {
    verifyFailed = true;
  }

  if (verifyFailed) {
    return (
      <CheckoutMessage
        title="Could not verify checkout"
        body="The session could not be retrieved from Stripe. InvoiceBatch stays gated until payment is confirmed."
        backHref="/invoicebatch"
        backLabel="Back to InvoiceBatch"
      />
    );
  }

  if (!paid) {
    return (
      <CheckoutMessage
        title="Payment not confirmed"
        body="Stripe has not marked this session as paid for InvoiceBatch. The zip is not served until the Checkout session is paid and matches this SKU or price."
        backHref="/invoicebatch"
        backLabel="Back to InvoiceBatch"
      />
    );
  }

  return (
    <>
      <MetaPixel
        purchase={{
          value: product?.priceUsd ?? 47,
          currency: "USD",
        }}
      />
      <PaidDownload
        product={paid}
        sessionId={sessionId}
        backHref="/invoicebatch"
        backLabel="Back to InvoiceBatch"
      />
    </>
  );
}
