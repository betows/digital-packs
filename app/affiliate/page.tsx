import type { Metadata } from "next";

const AFFILIATE_LINK = "{{AFFILIATE_LINK}}";

const FEATURES = [
  "Funnels / landing pages",
  "Email marketing",
  "Online courses / digital products",
  "Automations and basic CRM-lite features",
] as const;

const FAQS = [
  {
    question: "Is this free?",
    answer:
      "They have a free plan; paid plans unlock more. Check current pricing on their site.",
  },
  {
    question: "Do you work for systeme.io?",
    answer: "No. I’m an affiliate.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Per their terms on checkout — always verify on their site.",
  },
] as const;

export const metadata: Metadata = {
  title: "Grow your online business with systeme.io — Digital Packs",
  description:
    "Affiliate recommendation for solo founders who want a landing page, email sequence, and basic funnel in one stack. If you buy through links on this page, I may earn a commission at no extra cost to you.",
};

function AffiliateCta() {
  return (
    <a
      href={AFFILIATE_LINK}
      rel="sponsored"
      className="inline-flex h-12 items-center justify-center rounded-md bg-brass px-5 text-sm font-semibold text-ink transition hover:bg-brass-bright"
    >
      Start with systeme.io →
    </a>
  );
}

export default function AffiliatePage() {
  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
          Affiliate recommendation
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-cream sm:text-5xl">
          Grow your online business with systeme.io
        </h1>
        <p className="mt-6 text-base leading-7 text-muted sm:text-lg">
          One place to put up a page, send email, and sell a digital product —
          without stacking five SaaS tools.
        </p>

        <aside
          className="mt-8 rounded-xl border border-brass/40 bg-paper p-5 shadow-[0_0_0_1px_rgba(212,160,23,0.12)] sm:p-6"
          aria-label="Affiliate disclosure"
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brass uppercase">
            FTC affiliate disclosure
          </p>
          <p className="mt-3 text-sm leading-6 text-cream/85">
            If you buy through links on this page, I may earn a commission at no
            extra cost to you. I only recommend tools I’d use myself for simple
            funnels and email. This page is advertising.
          </p>
        </aside>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Who this is for
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Solo founders and small operators who need a landing page + email
            sequence + basic funnel without stacking five SaaS tools.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            What you get with systeme.io
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 rounded-xl border border-line bg-paper-muted/60 p-4 text-sm text-cream/85"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Why people start here
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            One stack for “page → email → sell a digital product” instead of
            duct-taping builders.
          </p>
          <div className="mt-8">
            <AffiliateCta />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">FAQ</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {FAQS.map((item) => (
              <div key={item.question} className="py-5">
                <dt className="font-semibold text-cream">{item.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="mt-16 border-t border-line pt-8 text-xs leading-5 text-muted">
          <p>
            Affiliate disclosure as above · Not affiliated as an employee ·
            Links may change · Last updated: Sep 27, 2026
          </p>
        </footer>
      </article>
    </main>
  );
}
