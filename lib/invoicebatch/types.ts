export type LineItem = {
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
};

export type Invoice = {
  invoiceNumber: string;
  clientName: string;
  date: string;
  clientEmail: string;
  clientAddress: string;
  dueDate: string;
  notes: string;
  currency: string;
  items: LineItem[];
};

export type Company = {
  company_name: string;
  address: string;
  email: string;
  phone: string;
  tax_id: string;
  payment_terms: string;
  currency_symbol: string;
  accent_color: string;
  footer: string;
};

export type RowError = {
  row: number;
  message: string;
};

export type InvoicePreview = {
  invoice: Invoice;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
};

export type ParseResult =
  | {
      ok: true;
      invoices: Invoice[];
      previews: InvoicePreview[];
      errors: RowError[];
      warnings: RowError[];
    }
  | {
      ok: false;
      invoices: Invoice[];
      previews: InvoicePreview[];
      errors: RowError[];
      warnings: RowError[];
    };
