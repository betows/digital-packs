import { handleInvoiceBatchAccessRequest, type StripeAccessClient } from "@/lib/invoicebatch-access";
import { nextFromAccessResult } from "@/lib/invoicebatch-access-response";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return nextFromAccessResult(
    await handleInvoiceBatchAccessRequest(getStripe() as StripeAccessClient, request),
  );
}
