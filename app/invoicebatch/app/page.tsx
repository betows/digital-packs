import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { InvoiceBatchApp } from "@/components/invoicebatch-app";
import { InvoiceBatchGate } from "@/components/invoicebatch-gate";
import { MetaPixel } from "@/components/meta-pixel";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_PATH,
  bookmarkAccessUrl,
  verifyAccessToken,
} from "@/lib/invoicebatch-access";
import { formatUsd, getLiveProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "InvoiceBatch app — Digital Packs",
  description: "Upload a CSV and download branded invoice PDFs in your browser.",
  robots: { index: false, follow: false },
};

async function requestOriginFromHeaders(): Promise<string> {
  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export default async function InvoiceBatchAppPage({
  searchParams,
}: PageProps<"/invoicebatch/app">) {
  const params = await searchParams;
  const tokenParam = typeof params.token === "string" ? params.token : "";
  if (tokenParam) {
    redirect(`${ACCESS_PATH}?token=${encodeURIComponent(tokenParam)}`);
  }

  const cookieStore = await cookies();
  let access = null;
  try {
    access = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
  } catch {
    access = null;
  }

  const product = getLiveProduct("invoicebatch");
  const priceLabel = formatUsd(product?.priceUsd ?? 47);
  const welcome = params.welcome === "1" || params.welcome === "true";

  if (!access) {
    return <InvoiceBatchGate priceLabel={priceLabel} />;
  }

  const origin = await requestOriginFromHeaders();
  const bookmarkUrl = bookmarkAccessUrl(origin, cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? "");

  return (
    <>
      {welcome ? (
        <MetaPixel
          purchase={{
            value: product?.priceUsd ?? 47,
            currency: "USD",
          }}
        />
      ) : (
        <MetaPixel />
      )}
      <InvoiceBatchApp bookmarkUrl={bookmarkUrl} />
    </>
  );
}
