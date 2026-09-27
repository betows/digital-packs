import type { Metadata } from "next";
import { BuyButton } from "@/components/buy-button";
import { formatUsd, getProduct } from "@/lib/products";

const outbound = getProduct("outbound-ops-kit");
const missedCall = getProduct("missed-call-recovery");

if (!outbound || !missedCall) {
  throw new Error("Lead-magnet SKUs are missing from the catalog");
}

export const metadata: Metadata = {
  title: "Free Day 0 sample — Outbound Ops Kit",
  description:
    "Ungated Day 0 email from Sequence A (Service SMB). Buy the full Outbound Ops Kit or the Missed-Call Recovery Pack on Stripe.",
};

const SUBJECTS = [
  "{{first}} — empty chair this week?",
  "Booked ≠ filled",
  "Same-day cancel → what happens by 9am?",
] as const;

export default function FreeSamplePage() {
  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
          Free sample · ungated
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-cream sm:text-5xl">
          Day 0 from the Outbound Ops Kit
        </h1>
        <p className="mt-6 text-base leading-7 text-muted sm:text-lg">
          One Day 0 email from Sequence A (Service SMB). The full Outbound Ops
          Kit ({formatUsd(outbound.priceUsd)}) adds Day 3 / Day 7, two more
          sequences, 20 subject lines, reply snippets, tracker columns, and a
          one-page SOP.
        </p>
        <p className="mt-4 text-sm leading-6 text-muted">
          Readable on this page. Optional download of the same sample:{" "}
          <a
            href="/samples/outbound-ops-kit-day0.md"
            className="text-cream underline-offset-4 hover:underline"
            download
          >
            outbound-ops-kit-day0.md
          </a>
          .
        </p>

        <section className="mt-10 rounded-xl border border-brass/40 bg-paper p-5 shadow-[0_0_0_1px_rgba(212,160,23,0.12)] sm:p-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brass uppercase">
            Sequence A — Service SMB — Day 0 only
          </p>
          <h2 className="mt-4 font-serif text-2xl tracking-tight text-cream">
            Subject ideas (pick one)
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-cream/85">
            {SUBJECTS.map((subject) => (
              <li key={subject} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                <span>{subject}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 font-serif text-2xl tracking-tight text-cream">
            Body
          </h2>
          <div className="mt-4 space-y-4 font-mono text-sm leading-7 text-cream/85">
            <p>Hi {"{{first}}"},</p>
            <p>
              Saw {"{{company}}"} books online — curious how you handle same-day
              cancels and no-shows when the calendar looks full but the
              chair/truck is empty.
            </p>
            <p>
              I put together a small outbound ops kit (sequences + tracker) for
              operators who still chase follow-ups by hand. Not a pitch for
              software — just the cadence docs.
            </p>
            <p>If useful: {"{{sales_page_url}}"}</p>
            <p>— {"{{your_name}}"}</p>
          </div>
          <p className="mt-6 text-xs leading-5 text-muted">
            Replace {"{{sales_page_url}}"} with your live sales URL before
            sending. Use your own mailbox. Honor opt-outs same day.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Want the rest?
          </h2>
          <div className="mt-6 grid gap-5">
            <div className="rounded-xl border border-brass/40 bg-paper p-5 sm:p-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-brass uppercase">
                Instant download after Stripe
              </p>
              <h3 className="mt-2 font-serif text-2xl text-cream">
                {outbound.name} — {formatUsd(outbound.priceUsd)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Full Day 0/3/7 × 3 sequences + subjects + snippets + tracker +
                SOP.
              </p>
              <div className="mt-5">
                <BuyButton
                  sku={outbound.sku}
                  priceLabel={formatUsd(outbound.priceUsd)}
                  available
                  featured
                />
              </div>
            </div>
            <div className="rounded-xl border border-line bg-paper-muted/60 p-5 sm:p-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                Also live
              </p>
              <h3 className="mt-2 font-serif text-2xl text-cream">
                {missedCall.name} — {formatUsd(missedCall.priceUsd)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                SMS + email for the lead who called and nobody answered.
              </p>
              <div className="mt-5">
                <BuyButton
                  sku={missedCall.sku}
                  priceLabel={formatUsd(missedCall.priceUsd)}
                  available
                />
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-muted">
            Pay once on Stripe. Instant zip download after Checkout. 30-day
            email refund.
          </p>
        </section>

        <aside className="mt-12 rounded-xl border border-line bg-paper-muted/40 p-5 text-sm leading-6 text-muted">
          <p className="font-semibold text-cream">UTM on cold links</p>
          <p className="mt-2">
            Buy buttons on this page forward existing{" "}
            <code className="text-cream/80">utm_*</code> query params into the
            Stripe Checkout session. Cold traffic should land here (or on a
            product page) with{" "}
            <code className="break-all text-cream/80">
              ?utm_source=cold|gumroad|etsy|dir|reddit&utm_campaign=sprint1003
            </code>
            .
          </p>
        </aside>
      </article>
    </main>
  );
}
