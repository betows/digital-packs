export type CheckoutSessionLike = {
  payment_status?: string | null;
  metadata?: { sku?: string | null } | null;
};

export type EntitlementResult =
  | { ok: true }
  | { ok: false; status: 400 | 403; error: string };

export function assertPaidSessionForSku(
  session: CheckoutSessionLike | null | undefined,
  sku: string,
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
  if (session.metadata?.sku !== sku) {
    return { ok: false, status: 403, error: "SKU does not match this purchase" };
  }
  return { ok: true };
}
