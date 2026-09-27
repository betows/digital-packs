import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners — wholesale stub",
  description:
    "Approved-partner wholesale: $40 for the Front Desk Bundle, $15 per pack. Reply PARTNER to request access.",
};

const PARTNER_MAIL =
  "mailto:hello@digital-packs.app?subject=PARTNER&body=Reply%20PARTNER%20%E2%80%94%20requesting%20wholesale%20approval.";

export default function PartnersPage() {
  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
          Wholesale · stub
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-cream sm:text-5xl">
          Partners
        </h1>
        <p className="mt-6 text-base leading-7 text-muted sm:text-lg">
          For approved partners only. This page is a short request stub — not a
          self-serve wholesale checkout.
        </p>

        <section className="mt-10 rounded-xl border border-brass/40 bg-paper p-5 shadow-[0_0_0_1px_rgba(212,160,23,0.12)] sm:p-6">
          <h2 className="font-serif text-2xl tracking-tight text-cream">
            Intended wholesale rates
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-cream/85">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
              <span>Front Desk Bundle — $40</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
              <span>Any single pack — $15</span>
            </li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-muted">
            Public site prices stay at list until you are approved. No volume
            claims, no public coupon that already works.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Reply PARTNER
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Email with the subject line <strong className="text-cream">PARTNER</strong>.
            The address below is a placeholder inbox until a dedicated partner
            mailbox is confirmed.
          </p>
          <a
            href={PARTNER_MAIL}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-brass px-5 text-sm font-semibold text-ink transition hover:bg-brass-bright"
          >
            Email PARTNER
          </a>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Promo codes at checkout
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Stripe Checkout already shows a promo-code field (
            <code className="text-cream/80">allow_promotion_codes</code>
            ). After approval we can issue a partner code in the Stripe
            Dashboard. We are not publishing a working code on this page.
          </p>
        </section>
      </article>
    </main>
  );
}
