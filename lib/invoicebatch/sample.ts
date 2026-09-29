import type { Company } from "./types.ts";

export const DEFAULT_COMPANY: Company = {
  company_name: "Your Company LLC",
  address: "123 Main St, Suite 100\nAustin, TX 78701",
  email: "billing@yourcompany.com",
  phone: "",
  tax_id: "",
  payment_terms: "Net 30 — Thank you for your business.",
  currency_symbol: "$",
  accent_color: "#1a56db",
  footer: "Questions? Reply to this invoice email.",
};

export const SAMPLE_COMPANY: Company = {
  company_name: "Northstar Studio LLC",
  address: "4800 Burnet Rd, Suite 12\nAustin, TX 78756",
  email: "billing@northstarstudio.example",
  phone: "+1 (512) 555-0142",
  tax_id: "EIN 12-3456789",
  payment_terms:
    "Net 15. Pay via ACH or card link in email. Late fee 1.5%/mo after due date.",
  currency_symbol: "$",
  accent_color: "#0f766e",
  footer: "Northstar Studio LLC · Questions? billing@northstarstudio.example",
};

export const SAMPLE_CSV = `invoice_number,client_name,client_email,client_address,date,due_date,description,qty,unit_price,tax_rate,notes,currency
INV-1001,Acme Dental,office@acmedental.example,"2210 Oak Ave
Austin, TX 78704",2026-09-01,2026-09-16,Landing page design,1,1200,0,Rush optional — reply to approve.,$
INV-1001,Acme Dental,office@acmedental.example,"2210 Oak Ave
Austin, TX 78704",2026-09-01,2026-09-16,Copywriting (homepage + services),1,450,0,,$
INV-1001,Acme Dental,office@acmedental.example,"2210 Oak Ave
Austin, TX 78704",2026-09-01,2026-09-16,Stock photo license pack,1,89,8.25,,$
INV-1002,Bright HVAC,ops@brighthvac.example,"88 Industrial Blvd
Round Rock, TX 78664",2026-09-05,2026-09-20,Google Business Profile setup,1,350,0,Includes 4 weekly post templates.,$
INV-1002,Bright HVAC,ops@brighthvac.example,"88 Industrial Blvd
Round Rock, TX 78664",2026-09-05,2026-09-20,Missed-call SMS scripts (customize),1,199,0,,$
INV-1003,Solo Freelancer Jane,jane@example.com,Remote,2026-09-10,2026-09-24,Monthly retainer — design support,1,2500,0,September 2026 retainer.,$
`;

export const SAMPLE_CSV_FILENAME = "invoicebatch-sample.csv";
