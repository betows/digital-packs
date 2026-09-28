export type CheckoutSessionLike = {
  payment_status?: string | null;
  payment_link?: string | { id?: string | null } | null;
  metadata?: { sku?: string | null } | null;
  line_items?: {
    data?: Array<{
      price?:
        | string
        | {
            id?: string | null;
            metadata?: { sku?: string | null } | null;
          }
        | null;
    }>;
  } | null;
};

export type EntitlementResult =
  | { ok: true }
  | { ok: false; status: 400 | 403; error: string };

export type EntitlementMatch = {
  priceId?: string;
  paymentLinkId?: string;
};

function paymentLinkIdOf(session: CheckoutSessionLike): string {
  const paymentLink = session.payment_link;
  if (typeof paymentLink === "string") return paymentLink.trim();
  return paymentLink?.id?.trim() ?? "";
}

function lineItemPriceIds(session: CheckoutSessionLike): string[] {
  const ids: string[] = [];
  for (const item of session.line_items?.data ?? []) {
    const price = item.price;
    if (typeof price === "string") {
      if (price) ids.push(price);
      continue;
    }
    const id = price?.id?.trim();
    if (id) ids.push(id);
  }
  return ids;
}

function lineItemSkus(session: CheckoutSessionLike): string[] {
  const skus: string[] = [];
  for (const item of session.line_items?.data ?? []) {
    const price = item.price;
    if (!price || typeof price === "string") continue;
    const sku = price.metadata?.sku?.trim();
    if (sku) skus.push(sku);
  }
  return skus;
}

export function assertPaidSessionForSku(
  session: CheckoutSessionLike | null | undefined,
  sku: string,
  match?: EntitlementMatch,
): EntitlementResult {
  if (!sku) {
    return { ok: false, status: 400, error: "Missing sku" };
  }
  if (!session) {
    return { ok: false, status: 403, error: "Checkout session not found" };
  }
  if (session.payment_status !== "paid") {
    return { ok: false, status: 403, error: "Payment not completed" };
  }
  if (session.metadata?.sku === sku) {
    return { ok: true };
  }
  if (lineItemSkus(session).includes(sku)) {
    return { ok: true };
  }
  if (match?.paymentLinkId && paymentLinkIdOf(session) === match.paymentLinkId) {
    return { ok: true };
  }
  if (match?.priceId && lineItemPriceIds(session).includes(match.priceId)) {
    return { ok: true };
  }
  return { ok: false, status: 403, error: "SKU does not match this purchase" };
}
