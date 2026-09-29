import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseInvoiceCsv } from "./invoicebatch/csv.ts";
import { SAMPLE_CSV } from "./invoicebatch/sample.ts";

describe("invoicebatch CSV", () => {
  it("parses the CLI sample into three grouped invoices", () => {
    const result = parseInvoiceCsv(SAMPLE_CSV);
    assert.equal(result.ok, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.invoices.length, 3);
    assert.deepEqual(
      result.invoices.map((invoice) => invoice.invoiceNumber),
      ["INV-1001", "INV-1002", "INV-1003"],
    );
    assert.equal(result.invoices[0].items.length, 3);
    assert.equal(result.invoices[0].clientName, "Acme Dental");
    assert.match(result.invoices[0].clientAddress, /Austin, TX 78704/);
    assert.equal(result.previews[0].grandTotal.toFixed(4), "1746.3425");
    assert.equal(result.previews[1].grandTotal, 549);
    assert.equal(result.previews[2].grandTotal, 2500);
  });

  it("rejects missing required columns", () => {
    const result = parseInvoiceCsv("foo,bar\n1,2\n");
    assert.equal(result.ok, false);
    assert.match(result.errors[0]?.message ?? "", /missing required columns/i);
  });

  it("reports bad rows without inventing invoices for them", () => {
    const csv = `invoice_number,client_name,date,description,qty,unit_price
INV-1,Acme,2026-09-01,Design,1,100
,Acme,2026-09-01,Missing number,1,50
INV-2,Acme,2026-09-01,Bad qty,nope,50
`;
    const result = parseInvoiceCsv(csv);
    assert.equal(result.invoices.length, 1);
    assert.equal(result.invoices[0].invoiceNumber, "INV-1");
    assert.equal(result.ok, false);
    assert.equal(result.errors.length, 2);
    assert.match(result.errors[0].message, /invoice_number is empty/);
    assert.match(result.errors[1].message, /qty must be a number/);
  });

  it("keeps quoted commas and newlines on one field", () => {
    const csv = `invoice_number,client_name,date,description,qty,unit_price,client_address
INV-1,"Acme, Inc",2026-09-01,"Design, v2",1,100,"2210 Oak Ave
Austin, TX 78704"
`;
    const result = parseInvoiceCsv(csv);
    assert.equal(result.ok, true);
    assert.equal(result.invoices[0].clientName, "Acme, Inc");
    assert.equal(result.invoices[0].items[0].description, "Design, v2");
    assert.match(result.invoices[0].clientAddress, /Austin, TX 78704/);
  });

  it("reports an unclosed quote instead of inventing rows", () => {
    const result = parseInvoiceCsv(
      `invoice_number,client_name,date,description,qty,unit_price\nINV-1,"Acme,2026-09-01,Design,1,100\n`,
    );
    assert.equal(result.ok, false);
    assert.match(result.errors[0]?.message ?? "", /unclosed quote/i);
  });
});
