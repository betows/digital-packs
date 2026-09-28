import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="font-serif text-lg tracking-tight text-cream">
          Digital Packs
        </Link>
        <nav className="flex items-center gap-4 text-sm text-cream/80 sm:gap-5">
          <Link href="/invoicebatch" className="transition hover:text-cream">
            InvoiceBatch
          </Link>
          <Link href="/free" className="transition hover:text-cream">
            Free sample
          </Link>
          <Link href="/partners" className="transition hover:text-cream">
            Partners
          </Link>
          <Link href="/affiliate" className="hidden transition hover:text-cream sm:inline">
            Affiliate
          </Link>
          <p className="hidden text-[11px] font-semibold tracking-[0.16em] text-muted uppercase md:block">
            Instant zip download
          </p>
        </nav>
      </div>
    </header>
  );
}
