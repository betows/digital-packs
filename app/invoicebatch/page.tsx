import type { Metadata } from "next";
import { BuyButton } from "@/components/buy-button";
import { MetaPixel } from "@/components/meta-pixel";
import { formatUsd, getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "InvoiceBatch — CSV to Invoice PDFs in Your Browser",
  description:
    "Turn a simple CSV into branded invoice PDFs in your browser. No install, unlimited invoices, no monthly fee. US$47 one-time. CLI zip included as a bonus. 30-day email refund.",
};

const PROOF = [
  {
    title: "No install.",
    body: "Runs in your browser. CSV never leaves this device. CLI zip included as a bonus.",
  },
  {
    title: "Batch-native.",
    body: "Same invoice number = multiple line items on one PDF.",
  },
  {
    title: "Your brand.",
    body: "Add your company details and pick an accent color in the app.",
  },
  {
    title: "Tax-aware.",
    body: "Per-line tax %; subtotal / tax / TOTAL calculated for you.",
  },
  {
    title: "Preview before download.",
    body: "Every row is checked before you get the ZIP.",
  },
  {
    title: "Real files today.",
    body: "Sample CSV + sample company config included — open the example PDFs in 60 seconds.",
  },
] as const;

const ZIP_CONTENTS = [
  { item: "invoicebatch/ CLI", why: "The tool" },
  { item: "examples/sample-invoices.csv", why: "Copy-paste your clients" },
  { item: "examples/company.json", why: "Your letterhead in JSON" },
  { item: "run.sh", why: "One command on Mac/Linux" },
  { item: "README.md", why: "Setup in under 2 minutes" },
  { item: "LICENSE.txt", why: "Personal + commercial use for your invoices" },
] as const;

const STEPS = [
  "Set your company name, address, and accent color.",
  "Fill the CSV (or export from Sheets) and upload it.",
  "Download the ZIP of PDFs. Email them. Done.",
] as const;

const FAQS = [
  {
    question: "Do I need to know Python?",
    answer:
      "No. The browser app is the default — upload a CSV, download a ZIP. The Python CLI is a bonus for technical buyers.",
  },
  {
    question: "Does it work on Windows?",
    answer:
      "Yes. Use python -m invoicebatch ... after pip install -r requirements.txt.",
  },
  {
    question: "Is this a subscription?",
    answer: "No. Pay once. Own the kit. Generate unlimited invoices.",
  },
  {
    question: "Can I use it for client work?",
    answer:
      "Yes — generate invoices for your business and your clients. You may not resell the kit itself.",
  },
  {
    question: "What if it doesn't fit my workflow?",
    answer:
      "30-day email refund. Reply to your purchase receipt. No forms, no guilt.",
  },
  {
    question: "QuickBooks / Wave / Stripe Invoicing?",
    answer:
      "Use those if you need payment collection + accounting sync. InvoiceBatch is for people who want fast branded PDFs from a spreadsheet without the bloat.",
  },
  {
    question: "Will you update it?",
    answer:
      "v1 is complete and tested. Minor fixes may ship by email to buyers — no forced upgrades.",
  },
] as const;

function BuyCta({ label }: { label: string }) {
  return <BuyButton sku="invoicebatch" priceLabel={label} available featured />;
}

export default function InvoiceBatchPage() {
  const product = getProduct("invoicebatch");
  if (!product) {
    throw new Error("InvoiceBatch SKU is missing from the catalog");
  }
  const priceLabel = formatUsd(product.priceUsd);

  return (
    <main className="flex-1">
      <MetaPixel />
      <article className="mx-auto max-w-3xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
          US$47 · Browser app · 30-day email refund
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-cream sm:text-5xl">
          Stop rebuilding the same invoice in Google Docs.
        </h1>
        <p className="mt-6 text-base leading-7 text-muted sm:text-lg">
          <strong className="font-semibold text-cream">InvoiceBatch</strong>{" "}
          turns a simple CSV into branded invoice PDFs in your browser — no
          install, unlimited invoices, no monthly fee. The Python CLI stays in
          the zip as a bonus.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BuyCta label={priceLabel} />
        </div>
        <p className="mt-3 text-sm text-muted">
          Works in your browser, no install. CLI zip included as a bonus download.{" "}
          <a href="/invoicebatch/app" className="text-cream/85 underline-offset-4 hover:underline">
            Already bought? Open the app
          </a>
        </p>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Proof points
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {PROOF.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-line bg-paper-muted/60 p-5"
              >
                <p className="font-semibold text-cream">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Who it&apos;s for
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Freelancers, bookkeepers, VAs and small agencies who bill from a
            spreadsheet — and refuse another monthly invoicing subscription for
            something that should take seconds.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            How it works (3 steps)
          </h2>
          <ol className="mt-6 space-y-3 text-sm leading-6 text-cream/85">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 font-mono text-[11px] font-semibold text-brass">
                  {index + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">
            Bonus CLI (same CSV columns) if you prefer the terminal:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper-muted/60 p-4 font-mono text-[13px] leading-6 text-cream/90">
            <code>
              {`./run.sh --csv your-invoices.csv --config company.json --out ./invoices`}
            </code>
          </pre>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Bonus: Python CLI
          </h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="bg-paper-muted text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Why you care</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-cream/85">
                {ZIP_CONTENTS.map((row) => (
                  <tr key={row.item}>
                    <td className="px-4 py-3 font-mono text-[13px]">{row.item}</td>
                    <td className="px-4 py-3 text-muted">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">FAQ</h2>
          <dl className="mt-6 space-y-8">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold text-cream">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 rounded-xl border border-brass/40 bg-paper p-6 shadow-[0_0_0_1px_rgba(212,160,23,0.12)] sm:p-8">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            Get InvoiceBatch — {priceLabel}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Works in your browser, no install. CLI zip as a bonus. 30-day email
            refund.
          </p>
          <div className="mt-6">
            <BuyCta label={priceLabel} />
          </div>
        </section>
      </article>
    </main>
  );
}
