"use client";

import { useState } from "react";

type BuyButtonProps = {
  sku: string;
  priceLabel: string;
  available: boolean;
  featured?: boolean;
};

export function BuyButton({
  sku,
  priceLabel,
  available,
  featured = false,
}: BuyButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseClass = featured
    ? "inline-flex h-12 items-center justify-center rounded-md bg-brass px-5 text-sm font-semibold text-ink transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-50"
    : "inline-flex h-11 w-full items-center justify-center rounded-md bg-brass px-4 text-sm font-semibold text-ink transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:bg-paper-muted disabled:text-muted disabled:hover:bg-paper-muted";

  if (!available) {
    return (
      <button type="button" className={baseClass} disabled>
        Coming soon
      </button>
    );
  }

  async function startCheckout() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={baseClass}
        onClick={startCheckout}
        disabled={pending}
      >
        {pending ? "Redirecting to checkout…" : `Buy — ${priceLabel}`}
      </button>
      {error ? (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
