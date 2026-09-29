import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutMessage } from "@/components/paid-download";
import { ACCESS_ERROR_COPY, ACCESS_PATH } from "@/lib/invoicebatch-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "InvoiceBatch download — Digital Packs",
  description:
    "Thank you for buying InvoiceBatch. Access is verified against a paid Stripe Checkout session.",
  robots: { index: false, follow: false },
};

export default async function InvoiceBatchSuccessPage({
  searchParams,
}: PageProps<"/invoicebatch/success">) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : "";
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const copy =
    errorCode && errorCode in ACCESS_ERROR_COPY
      ? ACCESS_ERROR_COPY[errorCode as keyof typeof ACCESS_ERROR_COPY]
      : null;

  if (copy) {
    return (
      <CheckoutMessage
        title={copy.title}
        body={copy.body}
        backHref="/invoicebatch/app"
        backLabel="Buy / restore access"
      />
    );
  }

  if (!sessionId) {
    return (
      <CheckoutMessage
        title="Missing checkout session"
        body="This page only unlocks InvoiceBatch after a paid Stripe Payment Link (or Checkout) session. Add session_id from the Stripe redirect — there is no ungated zip."
        backHref="/invoicebatch"
        backLabel="Back to InvoiceBatch"
      />
    );
  }

  redirect(`${ACCESS_PATH}?session_id=${encodeURIComponent(sessionId)}`);
}
