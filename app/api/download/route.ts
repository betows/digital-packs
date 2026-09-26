import { NextResponse } from "next/server";
import { fulfillPaidPack } from "@/lib/fulfillment";
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

  if (!getLiveProduct(sku)) {
    return NextResponse.json(
      { error: "Unknown or unavailable SKU" },
      { status: 400 },
    );
  }

  try {
    const result = await fulfillPaidPack(getStripe(), sku, sessionId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return new NextResponse(Uint8Array.from(result.data), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
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
