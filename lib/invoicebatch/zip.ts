import JSZip from "jszip";
import { invoiceFileName } from "./money.ts";
import { renderInvoicePdf } from "./pdf.ts";
import type { Company, Invoice } from "./types.ts";

export async function zipInvoicePdfs(
  invoices: Invoice[],
  company?: Partial<Company> | null,
  prefix = "invoice-",
): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const invoice of invoices) {
    const pdf = await renderInvoicePdf(invoice, company);
    zip.file(invoiceFileName(invoice.invoiceNumber, prefix), pdf);
  }
  return zip.generateAsync({ type: "uint8array" });
}
