import { handleInvoiceBatchRestoreRequest, type StripeAccessClient } from "@/lib/invoicebatch-access";
import { nextFromAccessResult } from "@/lib/invoicebatch-access-response";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return nextFromAccessResult(
    await handleInvoiceBatchRestoreRequest(getStripe() as StripeAccessClient, request),
  );
}
