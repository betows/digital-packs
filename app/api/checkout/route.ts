import { NextResponse } from "next/server";
import { startCheckout } from "@/lib/fulfillment";
import { getLiveProduct } from "@/lib/products";
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

  if (!getLiveProduct(sku)) {
    return NextResponse.json(
      { error: "Unknown or unavailable SKU" },
      { status: 400 },
    );
  }

  try {
    const result = await startCheckout(getStripe(), sku, getRequestOrigin(request));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ url: result.url, sessionId: result.sessionId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout failed";
    const status = message.includes("STRIPE_SECRET_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
