type PackFile = {
  name: string;
  kind: "file" | "folder";
  indent?: number;
};

const PACK_FILES: PackFile[] = [
  { name: "README.txt", kind: "file" },
  { name: "missed-call-recovery/", kind: "folder" },
  { name: "MISSED-CALL-RECOVERY-PACK.md", kind: "file", indent: 1 },
  { name: "tracker-template.csv", kind: "file", indent: 1 },
  { name: "review-referral-rocket/", kind: "folder" },
  { name: "REVIEW-REFERRAL-ROCKET.md", kind: "file", indent: 1 },
  { name: "sms-day0-day3.md", kind: "file", indent: 1 },
  { name: "email-review-ask.md", kind: "file", indent: 1 },
  { name: "gbp-post-pack/", kind: "folder" },
  { name: "posts-dental.md", kind: "file", indent: 1 },
  { name: "posts-salon.md", kind: "file", indent: 1 },
  { name: "calendar-30-day.md", kind: "file", indent: 1 },
];

export function PackPreview() {
  return (
    <figure
      className="overflow-hidden rounded-xl border border-line bg-paper shadow-[0_0_0_1px_rgba(212,160,23,0.08)]"
      aria-label="Unzipped Front Desk Bundle file listing"
    >
      <div className="flex items-center gap-2 border-b border-line bg-paper-muted px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <figcaption className="ml-2 font-mono text-[11px] tracking-wide text-muted">
          front-desk-bundle.zip
        </figcaption>
      </div>
      <ul className="divide-y divide-line/70 px-1 py-1 font-mono text-[12px] leading-6 text-cream/80">
        {PACK_FILES.map((entry) => (
          <li
            key={`${entry.indent ?? 0}-${entry.name}`}
            className="flex items-center gap-2 px-3 py-1"
            style={{ paddingLeft: `${12 + (entry.indent ?? 0) * 16}px` }}
          >
            <span className={entry.kind === "folder" ? "text-brass" : "text-muted"}>
              {entry.kind === "folder" ? "▸" : "·"}
            </span>
            <span>{entry.name}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-4 py-2 text-[11px] text-muted">
        Actual file listing from the zip — not a sales screenshot.
      </p>
    </figure>
  );
}
