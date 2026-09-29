import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  INVOICEBATCH_SKU,
  verifyAccessToken,
} from "@/lib/invoicebatch-access";
import { fulfillPaidPack } from "@/lib/fulfillment";
import { getLiveProduct } from "@/lib/products";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  let access;
  try {
    access = verifyAccessToken(token);
  } catch {
    access = null;
  }
  if (!access) {
    return NextResponse.json(
      { error: "InvoiceBatch access cookie is missing or invalid" },
      { status: 403 },
    );
  }

  if (!getLiveProduct(INVOICEBATCH_SKU)) {
    return NextResponse.json(
      { error: "Unknown or unavailable SKU" },
      { status: 400 },
    );
  }

  try {
    const result = await fulfillPaidPack(getStripe(), INVOICEBATCH_SKU, access.sid);
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
    const message = error instanceof Error ? error.message : "Download failed";
    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
