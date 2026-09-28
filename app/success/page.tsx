import { CheckoutMessage, PaidDownload } from "@/components/paid-download";
import { assertPaidSessionForSku } from "@/lib/entitlement";
import {
  getLiveProduct,
  getStripePriceId,
  type Product,
} from "@/lib/products";
import { extractSkuFromSession } from "@/lib/sale-notify";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

async function loadPaidProduct(sessionId: string): Promise<Product | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });
  const sku = extractSkuFromSession(session);
  const product = getLiveProduct(sku);
  if (!product) return null;
  const entitlement = assertPaidSessionForSku(session, sku, {
    priceId: getStripePriceId(product),
    paymentLinkId: product.stripePaymentLinkId,
  });
  if (!entitlement.ok) return null;
  return product;
}

export default async function SuccessPage({
  searchParams,
}: PageProps<"/success">) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";

  if (!sessionId) {
    return (
      <CheckoutMessage
        title="Missing checkout session"
        body="This page only works after Stripe Checkout. There is no ungated download."
      />
    );
  }

  let product: Product | null = null;
  let verifyFailed = false;
  try {
    product = await loadPaidProduct(sessionId);
  } catch {
    verifyFailed = true;
  }

  if (verifyFailed) {
    return (
      <CheckoutMessage
        title="Could not verify checkout"
        body="The session could not be retrieved from Stripe. No file is served until payment is confirmed."
      />
    );
  }

  if (!product) {
    return (
      <CheckoutMessage
        title="Payment not confirmed"
        body="Stripe has not marked this session as paid for a live pack. The zip stays gated."
      />
    );
  }

  return <PaidDownload product={product} sessionId={sessionId} />;
}
