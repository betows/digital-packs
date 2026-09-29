"use client";

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import { parseInvoiceCsv } from "@/lib/invoicebatch/csv";
import { formatMoney } from "@/lib/invoicebatch/money";
import { SAMPLE_COMPANY, SAMPLE_CSV, SAMPLE_CSV_FILENAME } from "@/lib/invoicebatch/sample";
import type { Company, ParseResult } from "@/lib/invoicebatch/types";
import { CLI_DOWNLOAD_PATH } from "@/lib/invoicebatch-access-constants";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadBytes(filename: string, bytes: Uint8Array, mime: string) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  downloadBlob(filename, new Blob([copy], { type: mime }));
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const fieldClass =
    "mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-brass";
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      {multiline ? (
        <textarea
          className={`${fieldClass} min-h-20`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={fieldClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function InvoiceBatchApp({ bookmarkUrl }: { bookmarkUrl: string }) {
  const [company, setCompany] = useState<Company>(SAMPLE_COMPANY);
  const [fileName, setFileName] = useState<string>("");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = parsed?.invoices.length ?? 0;
  const errorCount = parsed?.errors.length ?? 0;
  const canZip = validCount > 0;

  const previewRows = useMemo(() => parsed?.previews ?? [], [parsed]);

  async function ingestCsv(text: string, name: string) {
    setFileName(name);
    setZipError(null);
    try {
      setParsed(parseInvoiceCsv(text));
    } catch (error) {
      setParsed(null);
      setZipError(error instanceof Error ? error.message : "Could not parse CSV");
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    await ingestCsv(text, file.name);
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    void onFile(file);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onDropZoneKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    void onFile(file);
  }

  function downloadSample() {
    downloadBlob(
      SAMPLE_CSV_FILENAME,
      new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" }),
    );
  }

  async function downloadZip() {
    if (!parsed || parsed.invoices.length === 0) return;
    setBusy(true);
    setZipError(null);
    try {
      const { zipInvoicePdfs } = await import("@/lib/invoicebatch/zip");
      const bytes = await zipInvoicePdfs(parsed.invoices, company);
      downloadBytes("invoicebatch-invoices.zip", bytes, "application/zip");
    } catch (error) {
      setZipError(error instanceof Error ? error.message : "Could not build the ZIP");
    } finally {
      setBusy(false);
    }
  }

  async function downloadOne(invoiceNumber: string) {
    const invoice = parsed?.invoices.find((row) => row.invoiceNumber === invoiceNumber);
    if (!invoice) return;
    setBusy(true);
    setZipError(null);
    try {
      const { renderInvoicePdf } = await import("@/lib/invoicebatch/pdf");
      const pdf = await renderInvoicePdf(invoice, company);
      downloadBytes(
        `invoice-${invoice.invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`,
        pdf,
        "application/pdf",
      );
    } catch (error) {
      setZipError(error instanceof Error ? error.message : "Could not build the PDF");
    } finally {
      setBusy(false);
    }
  }

  function patchCompany<K extends keyof Company>(key: K, value: Company[K]) {
    setCompany((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-12 pb-20 sm:px-8">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-brass uppercase">
        Browser app · CSV stays on this device
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-cream">
        InvoiceBatch
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        Upload a CSV, preview the invoices, download a ZIP of PDFs. Parsing and
        rendering run in your browser — we never receive the spreadsheet.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={CLI_DOWNLOAD_PATH}
          className="inline-flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-cream/85 transition hover:border-cream/30"
        >
          Download CLI zip (bonus)
        </a>
        <button
          type="button"
          onClick={downloadSample}
          className="inline-flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-cream/85 transition hover:border-cream/30"
        >
          Download sample CSV
        </button>
        <button
          type="button"
          data-testid="preview-sample-csv"
          onClick={() => void ingestCsv(SAMPLE_CSV, SAMPLE_CSV_FILENAME)}
          className="inline-flex h-11 items-center justify-center rounded-md border border-line px-4 text-sm text-cream/85 transition hover:border-cream/30"
        >
          Preview sample CSV
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Bookmark restore link:{" "}
        <a href={bookmarkUrl} className="break-all text-brass hover:underline">
          {bookmarkUrl}
        </a>
      </p>

      <section className="mt-10 rounded-xl border border-line bg-paper-muted/60 p-5">
        <h2 className="font-semibold text-cream">Company letterhead</h2>
        <p className="mt-1 text-sm text-muted">
          Same fields as the CLI <span className="font-mono">company.json</span>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            label="Company name"
            value={company.company_name}
            onChange={(value) => patchCompany("company_name", value)}
          />
          <Field
            label="Email"
            value={company.email}
            onChange={(value) => patchCompany("email", value)}
          />
          <Field
            label="Phone"
            value={company.phone}
            onChange={(value) => patchCompany("phone", value)}
          />
          <Field
            label="Tax ID"
            value={company.tax_id}
            onChange={(value) => patchCompany("tax_id", value)}
          />
          <Field
            label="Currency symbol"
            value={company.currency_symbol}
            onChange={(value) => patchCompany("currency_symbol", value)}
          />
          <label className="block text-sm">
            <span className="text-muted">Accent color</span>
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(company.accent_color) ? company.accent_color : "#0f766e"}
              onChange={(event) => patchCompany("accent_color", event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-line bg-ink"
            />
          </label>
          <div className="sm:col-span-2">
            <Field
              label="Address"
              value={company.address}
              onChange={(value) => patchCompany("address", value)}
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Payment terms"
              value={company.payment_terms}
              onChange={(value) => patchCompany("payment_terms", value)}
              multiline
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Footer"
              value={company.footer}
              onChange={(value) => patchCompany("footer", value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-cream">CSV</h2>
        <p className="mt-1 text-sm text-muted">
          Required columns: invoice_number, client_name, date, description, qty,
          unit_price. Optional: client_email, client_address, due_date, tax_rate,
          notes, currency. Same invoice_number groups line items onto one PDF.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          data-testid="csv-file-input"
          onChange={onInput}
        />
        <div
          role="button"
          tabIndex={0}
          data-testid="csv-dropzone"
          onClick={openFilePicker}
          onKeyDown={onDropZoneKey}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition ${
            dragOver ? "border-brass bg-brass/10" : "border-line bg-paper-muted/40"
          }`}
        >
          <span className="text-sm text-cream">Drop a CSV here or click to choose</span>
          <span className="mt-1 text-xs text-muted">
            {fileName || "No file selected"}
          </span>
        </div>
      </section>

      {zipError && !parsed ? (
        <p className="mt-4 text-sm text-rose-300" role="alert">
          {zipError}
        </p>
      ) : null}

      {parsed ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-semibold text-cream">Preview</h2>
              <p className="mt-1 text-sm text-muted">
                {validCount} invoice{validCount === 1 ? "" : "s"}
                {errorCount > 0 ? ` · ${errorCount} row error${errorCount === 1 ? "" : "s"}` : ""}
              </p>
            </div>
            <button
              type="button"
              data-testid="download-zip"
              onClick={() => void downloadZip()}
              disabled={!canZip || busy}
              className="inline-flex h-11 items-center justify-center rounded-md bg-brass px-4 text-sm font-semibold text-ink transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Building ZIP…" : "Download all PDFs as ZIP"}
            </button>
          </div>
          {zipError ? (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {zipError}
            </p>
          ) : null}
          {parsed.errors.length > 0 ? (
            <ul className="mt-4 space-y-1 rounded-xl border border-rose-400/30 bg-rose-950/20 p-4 text-sm text-rose-200" role="alert">
              {parsed.errors.map((error) => (
                <li key={`${error.row}-${error.message}`}>{error.message}</li>
              ))}
            </ul>
          ) : null}
          {previewRows.length > 0 ? (
            <div className="mt-4 overflow-x-auto rounded-xl border border-line">
              <table data-testid="invoice-preview" className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-paper-muted text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Lines</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-cream/85">
                  {previewRows.map((row) => {
                    const symbol = row.invoice.currency || company.currency_symbol || "$";
                    return (
                      <tr key={row.invoice.invoiceNumber}>
                        <td className="px-4 py-3 font-mono text-[13px]">
                          {row.invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-3">{row.invoice.clientName}</td>
                        <td className="px-4 py-3">{row.invoice.date}</td>
                        <td className="px-4 py-3">{row.invoice.items.length}</td>
                        <td className="px-4 py-3">{formatMoney(symbol, row.grandTotal)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-brass hover:underline"
                            onClick={() => void downloadOne(row.invoice.invoiceNumber)}
                            disabled={busy}
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
