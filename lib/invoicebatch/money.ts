export function lineSubtotal(qty: number, unitPrice: number): number {
  return qty * unitPrice;
}

export function lineTax(qty: number, unitPrice: number, taxRate: number): number {
  return lineSubtotal(qty, unitPrice) * (taxRate / 100);
}

export function lineTotal(qty: number, unitPrice: number, taxRate: number): number {
  return lineSubtotal(qty, unitPrice) + lineTax(qty, unitPrice, taxRate);
}

export function formatG(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return String(value);
}

export function formatMoney(symbol: string, amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${symbol}${formatted}`;
}

export function invoiceTotals(items: Array<{ qty: number; unitPrice: number; taxRate: number }>) {
  let subtotal = 0;
  let taxTotal = 0;
  let grandTotal = 0;
  for (const item of items) {
    subtotal += lineSubtotal(item.qty, item.unitPrice);
    taxTotal += lineTax(item.qty, item.unitPrice, item.taxRate);
    grandTotal += lineTotal(item.qty, item.unitPrice, item.taxRate);
  }
  return { subtotal, taxTotal, grandTotal };
}

export function invoiceFileName(invoiceNumber: string, prefix = "invoice-"): string {
  const safe = invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  return `${prefix}${safe}.pdf`;
}

export function normalizeNewlines(value: string): string {
  return (value || "").replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
