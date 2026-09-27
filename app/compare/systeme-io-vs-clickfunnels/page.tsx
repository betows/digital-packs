import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "systeme.io vs ClickFunnels: which all-in-one for funnels + email?",
  description:
    "Honest comparison of systeme.io and ClickFunnels for landing pages, email, and selling a digital product. Affiliate disclosure on this site.",
};

const COMPARISON = [
  {
    need: "Landing / funnels",
    systeme: "Built-in funnels & pages",
    clickfunnels: "Funnel-first builder + templates",
  },
  {
    need: "Email marketing",
    systeme: "Included in the all-in-one pitch",
    clickfunnels: "Email available in their stack; confirm plan",
  },
  {
    need: "Digital products / courses",
    systeme: "Positioned for courses & digital products",
    clickfunnels:
      "Strong sales-funnel focus; confirm course tools on current plan",
  },
  {
    need: "Getting started cost",
    systeme: "Free plan commonly offered — verify on site",
    clickfunnels: "Paid plans — verify on site",
  },
  {
    need: "Learning curve",
    systeme: "Often described as simpler for solo ops",
    clickfunnels: "Powerful; more “funnel marketer” culture",
  },
  {
    need: "Best when",
    systeme: "You want one login for page + email + product",
    clickfunnels:
      "You want CF-style funnel pages and their community/templates",
  },
] as const;

const FUNNEL_EMAIL_WANTS = [
  "A page or funnel builder",
  "Email / automation",
  "A way to sell a course or digital download",
  "Fewer monthly seats and integrations to babysit",
] as const;

const STACK_STEPS = [
  {
    title: "Offer page",
    body: "what you sell and for whom",
  },
  {
    title: "Email",
    body: "welcome + delivery + follow-up",
  },
  {
    title: "Checkout",
    body: "their native checkout or a connected payment tool",
  },
  {
    title: "Delivery",
    body: "course area or download after payment",
  },
] as const;

const SYSTEME_FITS = [
  "You’re a solo founder selling a digital product or simple course.",
  "You want funnels + email without stacking a separate ESP on day one.",
  "You want to test on a free plan before committing (confirm current limits on their site).",
] as const;

const CLICKFUNNELS_FITS = [
  "You already think in ClickFunnels templates and sales pages.",
  "Your team is trained on CF workflows.",
  "You’re optimizing a specific funnel style and don’t need a “one app does everything” story.",
] as const;

function AffiliateCta({
  children = "Start with systeme.io →",
}: {
  children?: ReactNode;
}) {
  return (
    <a
      href="/affiliate"
      rel="sponsored"
      className="inline-flex h-12 items-center justify-center rounded-md bg-brass px-5 text-sm font-semibold text-ink transition hover:bg-brass-bright"
    >
      {children}
    </a>
  );
}

function AffiliateTextLink({ children }: { children: ReactNode }) {
  return (
    <Link
      href="/affiliate"
      rel="sponsored"
      className="text-brass underline-offset-4 hover:text-brass-bright hover:underline"
    >
      {children}
    </Link>
  );
}

export default function SystemeIoVsClickFunnelsPage() {
  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
          Comparison
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-cream sm:text-5xl">
          systeme.io vs ClickFunnels
        </h1>
        <p className="mt-6 text-base leading-7 text-muted sm:text-lg">
          <span className="font-semibold text-cream">Who this page is for:</span>{" "}
          Solo founders and small operators choosing one stack for a landing
          page, email sequences, and selling a digital product — without
          duct-taping five tools.
        </p>

        <aside
          className="mt-8 rounded-xl border border-brass/40 bg-paper p-5 shadow-[0_0_0_1px_rgba(212,160,23,0.12)] sm:p-6"
          aria-label="Affiliate disclosure"
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brass uppercase">
            FTC affiliate disclosure
          </p>
          <p className="mt-3 text-sm leading-6 text-cream/85">
            If you buy through links on this page or our{" "}
            <AffiliateTextLink>systeme.io bridge</AffiliateTextLink>, I may earn
            a commission at no extra cost to you. This page is advertising. I am
            not an employee of either company. Always verify current pricing and
            features on each vendor’s site.
          </p>
        </aside>

        <div className="mt-8">
          <AffiliateCta />
        </div>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            The short answer
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            Both tools can run a{" "}
            <span className="font-semibold text-cream">
              digital product funnel stack
            </span>{" "}
            (page → email → checkout).
          </p>
          <ul className="mt-6 space-y-3">
            <li className="flex gap-3 rounded-xl border border-line bg-paper-muted/60 p-4 text-sm leading-6 text-cream/85">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
              <span>
                Choose <span className="font-semibold text-cream">systeme.io</span>{" "}
                if you want a simpler all-in-one (funnels + email +
                courses/digital products) and you care about a free plan to
                start.
              </span>
            </li>
            <li className="flex gap-3 rounded-xl border border-line bg-paper-muted/60 p-4 text-sm leading-6 text-cream/85">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
              <span>
                Choose{" "}
                <span className="font-semibold text-cream">ClickFunnels</span> if
                you already live in their funnel templates and sales-page
                workflow and are fine paying for that ecosystem.
              </span>
            </li>
          </ul>
          <p className="mt-6 text-sm leading-6 text-muted sm:text-base">
            There is no universal winner. Match the tool to how you sell.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            What “all in one funnel email” actually means
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            People searching{" "}
            <span className="font-semibold text-cream">
              systeme.io alternative
            </span>{" "}
            or{" "}
            <span className="font-semibold text-cream">
              all in one funnel email
            </span>{" "}
            usually want:
          </p>
          <ol className="mt-6 space-y-3">
            {FUNNEL_EMAIL_WANTS.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-line bg-paper-muted/60 p-4 text-sm leading-6 text-cream/85"
              >
                <span className="font-semibold text-brass">{index + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-6 text-muted sm:text-base">
            Both products advertise pieces of that stack. Feature sets change —
            check their live pricing pages before you buy.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Side-by-side (high level)
          </h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Directional comparison of typical systeme.io and ClickFunnels
                fit. Not a feature audit.
              </caption>
              <thead className="bg-paper-muted/60">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold text-cream">
                    Need
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-cream">
                    systeme.io (typical fit)
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-cream">
                    ClickFunnels (typical fit)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {COMPARISON.map((row) => (
                  <tr key={row.need}>
                    <th
                      scope="row"
                      className="px-4 py-3 align-top font-semibold text-cream/90"
                    >
                      {row.need}
                    </th>
                    <td className="px-4 py-3 align-top leading-6 text-muted">
                      {row.systeme}
                    </td>
                    <td className="px-4 py-3 align-top leading-6 text-muted">
                      {row.clickfunnels}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            This table is directional, not a feature audit. Do not treat it as a
            guarantee of any plan inclusion.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Digital product funnel stack — a simple path
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
            A practical stack looks like:
          </p>
          <ol className="mt-6 space-y-3">
            {STACK_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-xl border border-line bg-paper-muted/60 p-4 text-sm leading-6 text-cream/85"
              >
                <span className="font-semibold text-brass">{index + 1}.</span>
                <span>
                  <span className="font-semibold text-cream">{step.title}</span>
                  {" — "}
                  {step.body}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-6 text-muted sm:text-base">
            systeme.io markets itself as covering that path in one product.
            ClickFunnels markets itself as covering high-converting funnel pages
            (and related tools in its ecosystem). If your pain is “too many
            tools,” start by listing which of the four steps you already have
            elsewhere — then pick the product that fills the gaps.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            When systeme.io is the better first try
          </h2>
          <ul className="mt-6 space-y-3">
            {SYSTEME_FITS.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-line bg-paper-muted/60 p-4 text-sm leading-6 text-cream/85"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-6 text-muted sm:text-base">
            <span className="font-semibold text-cream">Next step:</span> read
            the short honest overview (disclosure included), then decide:
          </p>
          <div className="mt-8">
            <AffiliateCta />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            When ClickFunnels may fit better
          </h2>
          <ul className="mt-6 space-y-3">
            {CLICKFUNNELS_FITS.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-line bg-paper-muted/60 p-4 text-sm leading-6 text-cream/85"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-6 text-muted sm:text-base">
            We don’t affiliate-promote ClickFunnels on this page. Research it on
            their official site if that’s your lane.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">FAQ</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            <div className="py-5">
              <dt className="font-semibold text-cream">
                Is systeme.io a ClickFunnels alternative?
              </dt>
              <dd className="mt-2 text-sm leading-6 text-muted">
                Many people search{" "}
                <span className="font-semibold text-cream/85">
                  systeme.io alternative
                </span>{" "}
                the other way around — comparing both as all-in-one funnel/email
                options. systeme.io is one option in that category; ClickFunnels
                is another. Fit depends on budget, templates, and how you sell.
              </dd>
            </div>
            <div className="py-5">
              <dt className="font-semibold text-cream">
                Can I sell a digital product with only one tool?
              </dt>
              <dd className="mt-2 text-sm leading-6 text-muted">
                Often yes in principle — page, email, and product delivery in
                one vendor. Confirm the exact features on the plan you pick.
              </dd>
            </div>
            <div className="py-5">
              <dt className="font-semibold text-cream">
                Do you work for systeme.io?
              </dt>
              <dd className="mt-2 text-sm leading-6 text-muted">
                No. I’m an affiliate. Links through our{" "}
                <AffiliateTextLink>bridge page</AffiliateTextLink> may earn a
                commission at no extra cost to you.
              </dd>
            </div>
            <div className="py-5">
              <dt className="font-semibold text-cream">
                Where should I click if I want systeme.io?
              </dt>
              <dd className="mt-2 text-sm leading-6 text-muted">
                Only through{" "}
                <AffiliateTextLink>
                  digital-packs.vercel.app/affiliate
                </AffiliateTextLink>{" "}
                so disclosure stays visible. Don’t chase random “?sa=” links
                from email.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-14">
          <AffiliateCta>Compare notes on systeme.io (affiliate bridge) →</AffiliateCta>
          <p className="mt-4 text-sm leading-6 text-muted">
            Or browse the{" "}
            <Link
              href="/#packs"
              className="text-cream/85 underline-offset-4 hover:text-cream hover:underline"
            >
              digital packs shelf
            </Link>{" "}
            if you want instant-download kits instead.
          </p>
        </section>

        <footer className="mt-16 border-t border-line pt-8 text-xs leading-5 text-muted">
          <p>
            Affiliate disclosure as above · Features and prices change · Last
            updated: Sep 27, 2026
          </p>
        </footer>
      </article>
    </main>
  );
}
