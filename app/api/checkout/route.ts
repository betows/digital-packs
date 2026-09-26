import { NextResponse } from "next/server";
import { getLiveProduct, getStripePriceId } from "@/lib/products";
import { getRequestOrigin, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let sku: unknown;
  try {
    const body = (await request.json()) as { sku?: unknown };
    sku = body?.sku;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof sku !== "string" || sku.length === 0) {
    return NextResponse.json({ error: "Missing sku" }, { status: 400 });
  }

  const product = getLiveProduct(sku);
  if (!product) {
    return NextResponse.json(
      { error: "Unknown or unavailable SKU" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const origin = getRequestOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: getStripePriceId(product), quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: { sku: product.sku },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    const status = message.includes("STRIPE_SECRET_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
