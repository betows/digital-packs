import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { assertPaidSessionForSku } from "@/lib/entitlement";
import { getPackPath } from "@/lib/packs";
import { getLiveProduct } from "@/lib/products";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sku = searchParams.get("sku");
  const sessionId = searchParams.get("session_id");

  if (!sku || !sessionId) {
    return NextResponse.json(
      { error: "Missing sku or session_id" },
      { status: 400 },
    );
  }

  const product = getLiveProduct(sku);
  if (!product?.packFile) {
    return NextResponse.json(
      { error: "Unknown or unavailable SKU" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const entitlement = assertPaidSessionForSku(session, sku);
    if (!entitlement.ok) {
      return NextResponse.json(
        { error: entitlement.error },
        { status: entitlement.status },
      );
    }

    const filePath = getPackPath(product.packFile);
    const data = await readFile(filePath);

    return new NextResponse(Uint8Array.from(data), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${product.packFile}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Download failed";
    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    if (message.includes("No such file") || message.includes("ENOENT")) {
      return NextResponse.json(
        { error: "Pack file is missing on the server" },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
