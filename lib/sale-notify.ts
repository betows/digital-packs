import Stripe from "stripe";

export type SaleNotifyPayload = {
  event: "checkout.session.completed";
  sku: string;
  amount_total: number;
  currency: string;
  session_id: string;
  customer_email?: string;
};

export type CheckoutSessionNotifySource = {
  id?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: { sku?: string | null } | null;
  line_items?: {
    data?: Array<{
      price?: {
        metadata?: { sku?: string | null } | null;
        product?: unknown;
      } | null;
    }>;
  } | null;
};

export type StripeWebhookResult = {
  status: number;
  body: {
    received?: boolean;
    ignored?: string;
    error?: string;
  };
};

function skuFromExpandedProduct(product: unknown): string {
  if (!product || typeof product !== "object") return "";
  const metadata = (product as { metadata?: { sku?: string | null } | null }).metadata;
  return metadata?.sku?.trim() ?? "";
}

export function getSaleNotifyWebhookUrl(): string | null {
  const url = process.env.SALE_NOTIFY_WEBHOOK_URL?.trim();
  return url ? url : null;
}

export function getSaleNotifyAuthorization(): string | null {
  const value = process.env.SALE_NOTIFY_AUTHORIZATION?.trim();
  return value ? value : null;
}

export function extractSkuFromSession(session: CheckoutSessionNotifySource): string {
  const fromMeta = session.metadata?.sku?.trim();
  if (fromMeta) return fromMeta;

  const firstItem = session.line_items?.data?.[0];
  const fromPrice = firstItem?.price?.metadata?.sku?.trim();
  if (fromPrice) return fromPrice;

  const fromProduct = skuFromExpandedProduct(firstItem?.price?.product);
  if (fromProduct) return fromProduct;

  return "";
}

export function buildSaleNotifyPayload(
  session: CheckoutSessionNotifySource,
): SaleNotifyPayload {
  const email =
    session.customer_details?.email?.trim() ||
    session.customer_email?.trim() ||
    "";

  const payload: SaleNotifyPayload = {
    event: "checkout.session.completed",
    sku: extractSkuFromSession(session),
    amount_total: session.amount_total ?? 0,
    currency: (session.currency ?? "usd").toLowerCase(),
    session_id: session.id ?? "",
  };

  if (email) {
    payload.customer_email = email;
  }

  return payload;
}

export async function notifySaleScoreboard(
  payload: SaleNotifyPayload,
): Promise<"sent" | "skipped" | "failed"> {
  const url = getSaleNotifyWebhookUrl();
  if (!url) {
    console.info("SALE_NOTIFY_WEBHOOK_URL is unset; skipping sale notify");
    return "skipped";
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authorization = getSaleNotifyAuthorization();
    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      console.error(
        "Sale notify webhook failed",
        response.status,
        payload.session_id,
        payload.sku,
      );
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("Sale notify webhook error", payload.session_id, payload.sku, error);
    return "failed";
  }
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return secret;
}

export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
): Promise<StripeWebhookResult> {
  let secret: string;
  try {
    secret = getStripeWebhookSecret();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "STRIPE_WEBHOOK_SECRET is not set";
    return { status: 500, body: { error: message } };
  }

  if (!signature) {
    return { status: 400, body: { error: "Missing stripe-signature header" } };
  }

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return {
      status: 400,
      body: { error: `Webhook signature verification failed: ${message}` },
    };
  }

  if (event.type !== "checkout.session.completed") {
    return { status: 200, body: { received: true, ignored: event.type } };
  }

  try {
    await notifySaleScoreboard(buildSaleNotifyPayload(event.data.object));
  } catch (error) {
    console.error(
      "Sale notify failed after verified checkout.session.completed",
      error,
    );
  }

  return { status: 200, body: { received: true } };
}
