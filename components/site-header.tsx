import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-serif text-lg tracking-tight text-cream">
          Digital Packs
        </Link>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Instant zip download
        </p>
      </div>
    </header>
  );
}
