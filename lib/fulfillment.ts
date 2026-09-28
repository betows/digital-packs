import { readFile } from "node:fs/promises";
import type Stripe from "stripe";
import { assertPaidSessionForSku } from "./entitlement";
import { getPackPath } from "./packs";
import { buildCheckoutSessionParams } from "./checkout-session";
import { getLiveProduct, getStripePriceId } from "./products";
import type { UtmParams } from "./utm";

export type CheckoutStart =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; status: number; error: string };

export type PackFulfillment =
  | { ok: true; filename: string; data: Buffer }
  | { ok: false; status: number; error: string };

type StripeCheckout = {
  checkout: {
    sessions: {
      create: Stripe["checkout"]["sessions"]["create"];
      retrieve: Stripe["checkout"]["sessions"]["retrieve"];
    };
  };
};

export async function startCheckout(
  stripe: StripeCheckout,
  sku: string,
  origin: string,
  options?: { utm?: UtmParams; cancelPath?: string },
): Promise<CheckoutStart> {
  const product = getLiveProduct(sku);
  if (!product) {
    return { ok: false, status: 400, error: "Unknown or unavailable SKU" };
  }

  const session = await stripe.checkout.sessions.create(
    buildCheckoutSessionParams(product, origin, options),
  );

  if (!session.url) {
    return {
      ok: false,
      status: 502,
      error: "Stripe did not return a checkout URL",
    };
  }

  return { ok: true, url: session.url, sessionId: session.id };
}

export async function fulfillPaidPack(
  stripe: StripeCheckout,
  sku: string,
  sessionId: string,
): Promise<PackFulfillment> {
  const product = getLiveProduct(sku);
  if (!product?.packFile) {
    return { ok: false, status: 400, error: "Unknown or unavailable SKU" };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price"],
  });
  const entitlement = assertPaidSessionForSku(session, sku, {
    priceId: getStripePriceId(product),
    paymentLinkId: product.stripePaymentLinkId,
  });
  if (!entitlement.ok) {
    return entitlement;
  }

  const data = await readFile(getPackPath(product.packFile));
  return { ok: true, filename: product.packFile, data };
}
