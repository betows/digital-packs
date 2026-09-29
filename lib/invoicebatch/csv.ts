import Papa from "papaparse";
import { invoiceTotals } from "./money.ts";
import type { Invoice, LineItem, ParseResult, RowError } from "./types.ts";

export const REQUIRED_COLUMNS = [
  "invoice_number",
  "client_name",
  "date",
  "description",
  "qty",
  "unit_price",
] as const;

export const OPTIONAL_COLUMNS = [
  "client_email",
  "client_address",
  "due_date",
  "tax_rate",
  "notes",
  "currency",
] as const;

function parseNumber(raw: string, field: string, row: number): { ok: true; value: number } | { ok: false; error: RowError } {
  const s = raw.trim().replace(/[$,]/g, "");
  if (s === "") return { ok: true, value: 0 };
  const value = Number(s);
  if (!Number.isFinite(value)) {
    return {
      ok: false,
      error: { row, message: `Row ${row}: ${field} must be a number (got "${raw.trim()}")` },
    };
  }
  return { ok: true, value };
}

function cell(
  row: Record<string, string | undefined>,
  key: string,
): string {
  const value = row[key];
  if (typeof value !== "string") return "";
  return value.trim();
}

export function parseInvoiceCsv(csvText: string): ParseResult {
  const errors: RowError[] = [];
  const warnings: RowError[] = [];

  if (!csvText.trim()) {
    return {
      ok: false,
      invoices: [],
      previews: [],
      errors: [{ row: 1, message: "CSV is empty" }],
      warnings,
    };
  }

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim().toLowerCase(),
  });

  for (const issue of parsed.errors) {
    if (issue.type === "Delimiter" || issue.code === "UndetectableDelimiter") {
      continue;
    }
    const row = (issue.row ?? 0) + 1;
    errors.push({
      row,
      message: `Row ${row}: ${issue.message}`,
    });
  }

  const fields = (parsed.meta.fields ?? []).map((field) => field.trim().toLowerCase());
  const fieldSet = new Set(fields.filter(Boolean));
  const missing = REQUIRED_COLUMNS.filter((column) => !fieldSet.has(column));
  if (missing.length > 0) {
    return {
      ok: false,
      invoices: [],
      previews: [],
      errors: [
        {
          row: 1,
          message: `CSV missing required columns: ${missing.join(", ")}. Found: ${
            fields.filter(Boolean).join(", ") || "(none)"
          }`,
        },
      ],
      warnings,
    };
  }

  const grouped = new Map<string, Invoice>();
  const order: string[] = [];

  parsed.data.forEach((rawRow, index) => {
    const rowNumber = index + 2;
    const invoiceNumber = cell(rawRow, "invoice_number");
    const description = cell(rawRow, "description");
    const clientName = cell(rawRow, "client_name");
    const date = cell(rawRow, "date");

    const emptyRow = REQUIRED_COLUMNS.every((column) => cell(rawRow, column) === "");
    if (emptyRow) return;

    if (!invoiceNumber) {
      errors.push({ row: rowNumber, message: `Row ${rowNumber}: invoice_number is empty` });
      return;
    }
    if (!description) {
      errors.push({ row: rowNumber, message: `Row ${rowNumber}: description is empty` });
      return;
    }
    if (!clientName) {
      errors.push({ row: rowNumber, message: `Row ${rowNumber}: client_name is empty` });
      return;
    }
    if (!date) {
      errors.push({ row: rowNumber, message: `Row ${rowNumber}: date is empty` });
      return;
    }

    const qty = parseNumber(cell(rawRow, "qty"), "qty", rowNumber);
    const unitPrice = parseNumber(cell(rawRow, "unit_price"), "unit_price", rowNumber);
    const taxRate = parseNumber(cell(rawRow, "tax_rate"), "tax_rate", rowNumber);
    if (!qty.ok) {
      errors.push(qty.error);
      return;
    }
    if (!unitPrice.ok) {
      errors.push(unitPrice.error);
      return;
    }
    if (!taxRate.ok) {
      errors.push(taxRate.error);
      return;
    }

    const item: LineItem = {
      description,
      qty: qty.value,
      unitPrice: unitPrice.value,
      taxRate: taxRate.value,
    };

    const existing = grouped.get(invoiceNumber);
    if (!existing) {
      grouped.set(invoiceNumber, {
        invoiceNumber,
        clientName,
        date,
        clientEmail: cell(rawRow, "client_email"),
        clientAddress: cell(rawRow, "client_address"),
        dueDate: cell(rawRow, "due_date"),
        notes: cell(rawRow, "notes"),
        currency: cell(rawRow, "currency"),
        items: [item],
      });
      order.push(invoiceNumber);
      return;
    }

    existing.items.push(item);
    if (!existing.notes && cell(rawRow, "notes")) {
      existing.notes = cell(rawRow, "notes");
    }
    if (!existing.dueDate && cell(rawRow, "due_date")) {
      existing.dueDate = cell(rawRow, "due_date");
    }
    if (!existing.clientEmail && cell(rawRow, "client_email")) {
      existing.clientEmail = cell(rawRow, "client_email");
    }
    if (!existing.clientAddress && cell(rawRow, "client_address")) {
      existing.clientAddress = cell(rawRow, "client_address");
    }
  });

  const invoices = order.map((id) => grouped.get(id)!);
  const previews = invoices.map((invoice) => {
    const totals = invoiceTotals(invoice.items);
    return { invoice, ...totals };
  });

  if (invoices.length === 0 && errors.length === 0) {
    errors.push({ row: 1, message: "No invoices found in CSV." });
  }

  return {
    ok: invoices.length > 0 && errors.length === 0,
    invoices,
    previews,
    errors,
    warnings,
  };
}
