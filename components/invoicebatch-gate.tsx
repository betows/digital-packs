"use client";

import { BuyButton } from "@/components/buy-button";
import { RESTORE_PATH } from "@/lib/invoicebatch-access-constants";
import { formatUsd } from "@/lib/products";

export function InvoiceBatchGate({ priceLabel }: { priceLabel: string }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
        Paid access
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-cream">
        Buy or restore InvoiceBatch
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        The browser app is gated on the server against a paid Stripe Checkout
        session. CSV parsing and PDF generation stay in your browser after that
        — customer rows never go to our server.
      </p>
      <div className="mt-8">
        <BuyButton sku="invoicebatch" priceLabel={priceLabel} available featured />
      </div>
      <p className="mt-3 text-sm text-muted">
        {formatUsd(47)} one-time. Works in your browser, no install. Python CLI
        zip included as a bonus.
      </p>

      <section className="mt-12 rounded-xl border border-line bg-paper-muted/60 p-5">
        <h2 className="font-semibold text-cream">Already bought?</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Paste the Checkout session id from the success URL or receipt
          (<span className="font-mono text-cream/80">cs_</span>…) or the email
          you used at Stripe.
        </p>
        <form action={RESTORE_PATH} method="post" className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="text-muted">Checkout session id</span>
            <input
              name="session_id"
              type="text"
              autoComplete="off"
              placeholder="cs_live_..."
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-sm text-cream outline-none focus:border-brass"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-brass"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-cream/85 transition hover:border-cream/30"
          >
            Restore access
          </button>
        </form>
      </section>
    </main>
  );
}
