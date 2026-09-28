import type { Metadata } from "next";
import { MetaPixel } from "@/components/meta-pixel";
import {
  formatUsd,
  getProduct,
  INVOICEBATCH_PAYMENT_LINK_URL,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "InvoiceBatch — CSV to branded invoice PDFs",
  description:
    "Turn a simple CSV into branded invoice PDFs. One command, unlimited invoices, no monthly fee. US$47 one-time. Instant ZIP. 30-day email refund.",
};

const PROOF = [
  {
    title: "One dependency.",
    body: "Python + reportlab. No cloud login.",
  },
  {
    title: "Batch-native.",
    body: "Same invoice number = multiple line items on one PDF.",
  },
  {
    title: "Your brand.",
    body: "Company name, colors, tax ID, payment terms in a 10-line JSON.",
  },
  {
    title: "Tax-aware.",
    body: "Per-line tax %; subtotal / tax / TOTAL calculated for you.",
  },
  {
    title: "Dry-run mode.",
    body: "Preview the plan before writing a single file.",
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
  "Edit company.json with your name, address, accent color.",
  "Fill the CSV (or export from Sheets).",
  "Run the command below. Email the PDFs. Done.",
] as const;

const FAQS = [
  {
    question: "Do I need to know Python?",
    answer:
      "No. If you can open Terminal (or PowerShell) and paste one command, you're fine. The README walks you through it.",
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

function BuyLink({ label }: { label: string }) {
  return (
    <a
      href={INVOICEBATCH_PAYMENT_LINK_URL}
      className="inline-flex h-12 items-center justify-center rounded-md bg-brass px-5 text-sm font-semibold text-ink transition hover:bg-brass-bright"
    >
      {label}
    </a>
  );
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
          US$47 · Instant ZIP · 30-day email refund
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-cream sm:text-5xl">
          Stop rebuilding the same invoice in Google Docs.
        </h1>
        <p className="mt-6 text-base leading-7 text-muted sm:text-lg">
          <strong className="font-semibold text-cream">InvoiceBatch</strong>{" "}
          turns a simple CSV into branded invoice PDFs — one command, unlimited
          invoices, no monthly fee.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <BuyLink label={`Buy InvoiceBatch — ${priceLabel} →`} />
        </div>
        <p className="mt-3 text-sm text-muted">
          Unzip → run → send. Works offline. macOS / Windows / Linux.
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
            Freelancers, studios, and small ops teams who already live in
            spreadsheets — and refuse another $30/mo invoicing SaaS for
            something a script should finish in seconds.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl tracking-tight text-cream">
            What&apos;s in the ZIP
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
          <pre className="mt-6 overflow-x-auto rounded-xl border border-line bg-paper-muted/60 p-4 font-mono text-[13px] leading-6 text-cream/90">
            <code>
              {`./run.sh --csv your-invoices.csv --config company.json --out ./invoices`}
            </code>
          </pre>
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
            Instant download. Offline forever. 30-day email refund.
          </p>
          <div className="mt-6">
            <BuyLink label="Get the ZIP →" />
          </div>
        </section>
      </article>
    </main>
  );
}
