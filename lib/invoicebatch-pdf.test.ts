import assert from "node:assert/strict";
import { describe, it } from "node:test";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { parseInvoiceCsv } from "./invoicebatch/csv.ts";
import { SAMPLE_COMPANY, SAMPLE_CSV } from "./invoicebatch/sample.ts";
import { zipInvoicePdfs } from "./invoicebatch/zip.ts";

describe("invoicebatch PDFs", () => {
  it("zips one PDF per invoice_number from the sample CSV", async () => {
    const parsed = parseInvoiceCsv(SAMPLE_CSV);
    assert.equal(parsed.ok, true);
    const zipBytes = await zipInvoicePdfs(parsed.invoices, SAMPLE_COMPANY);
    const zip = await JSZip.loadAsync(zipBytes);
    const names = Object.keys(zip.files).sort();
    assert.deepEqual(names, [
      "invoice-INV-1001.pdf",
      "invoice-INV-1002.pdf",
      "invoice-INV-1003.pdf",
    ]);
    const first = await zip.file("invoice-INV-1001.pdf")?.async("uint8array");
    assert.ok(first && first.length > 0);
    assert.equal(Buffer.from(first.subarray(0, 4)).toString("latin1"), "%PDF");
    const doc = await PDFDocument.load(first);
    assert.equal(doc.getTitle(), "Invoice INV-1001");
    assert.equal(doc.getSubject(), "Acme Dental");
    assert.equal(doc.getAuthor(), "Northstar Studio LLC");
    assert.ok(doc.getPageCount() >= 1);
  });
});
