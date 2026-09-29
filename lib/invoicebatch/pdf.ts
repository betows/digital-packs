import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { formatG, formatMoney, invoiceTotals, normalizeNewlines } from "./money.ts";
import { DEFAULT_COMPANY } from "./sample.ts";
import type { Company, Invoice } from "./types.ts";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 0.7 * 72;
const MARGIN_TOP = 0.6 * 72;
const MARGIN_BOTTOM = 0.6 * 72;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const COLS = {
  description: 3.2 * 72,
  qty: 0.7 * 72,
  unit: 1.1 * 72,
  tax: 0.7 * 72,
  amount: 1.1 * 72,
};

function hexRgb(color: string): RGB {
  const c = color.trim().replace("#", "");
  if (c.length !== 6 || /[^0-9a-fA-F]/.test(c)) {
    return rgb(0x1a / 255, 0x56 / 255, 0xdb / 255);
  }
  return rgb(
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  );
}

function printable(text: string): string {
  return Array.from(text ?? "", (ch) => {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 9 || code === 10 || code === 13) return ch;
    if (code < 32) return "";
    if (code > 255) return code === 0x20ac ? "EUR" : "?";
    return ch;
  }).join("");
}

function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const normalized = printable(normalizeNewlines(text));
  const paragraphs = normalized.split("\n");
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
        current = trial;
      } else {
        if (current) lines.push(current);
        if (font.widthOfTextAtSize(word, size) <= maxWidth) {
          current = word;
        } else {
          let chunk = "";
          for (const ch of word) {
            const next = chunk + ch;
            if (font.widthOfTextAtSize(next, size) <= maxWidth) {
              chunk = next;
            } else {
              if (chunk) lines.push(chunk);
              chunk = ch;
            }
          }
          current = chunk;
        }
      }
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

function drawTextSafe(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: RGB },
) {
  page.drawText(printable(text), opts);
}

function mergeCompany(company: Partial<Company> | null | undefined): Company {
  return {
    ...DEFAULT_COMPANY,
    ...Object.fromEntries(
      Object.entries(company ?? {}).filter(([, value]) => value != null && value !== ""),
    ),
  } as Company;
}

export async function renderInvoicePdf(
  invoice: Invoice,
  companyInput?: Partial<Company> | null,
): Promise<Uint8Array> {
  const company = mergeCompany(companyInput);
  const symbol = invoice.currency || company.currency_symbol || "$";
  const accent = hexRgb(company.accent_color);
  const slate = rgb(0x64 / 255, 0x73 / 255, 0x8b / 255);
  const ink = rgb(0.07, 0.09, 0.12);
  const grid = rgb(0xe2 / 255, 0xe8 / 255, 0xf0 / 255);
  const altRow = rgb(0xf8 / 255, 0xfa / 255, 0xfc / 255);
  const white = rgb(1, 1, 1);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Invoice ${invoice.invoiceNumber}`);
  pdf.setSubject(invoice.clientName);
  pdf.setAuthor(company.company_name);
  pdf.setCreator("InvoiceBatch");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const totals = invoiceTotals(invoice.items);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN_TOP;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN_TOP;
    }
  };

  const companyLines = [
    company.company_name,
    ...normalizeNewlines(company.address).split("\n").filter(Boolean),
    company.email,
    company.phone,
    company.tax_id ? `Tax ID: ${company.tax_id}` : "",
  ].filter(Boolean);

  const metaX = MARGIN_X + 4.2 * 72;
  const metaWidth = 2.6 * 72;

  drawTextSafe(page, "INVOICE", {
    x: metaX + metaWidth - bold.widthOfTextAtSize("INVOICE", 22),
    y: y - 18,
    size: 22,
    font: bold,
    color: accent,
  });
  const numberLabel = `#${invoice.invoiceNumber}`;
  drawTextSafe(page, numberLabel, {
    x: metaX + metaWidth - bold.widthOfTextAtSize(numberLabel, 10),
    y: y - 36,
    size: 10,
    font: bold,
    color: ink,
  });

  let companyY = y;
  companyLines.forEach((line, index) => {
    drawTextSafe(page, line, {
      x: MARGIN_X,
      y: companyY - 12,
      size: 10,
      font: index === 0 ? bold : font,
      color: ink,
    });
    companyY -= 14;
  });

  let metaY = y - 50;
  const metaBlock = [
    ["Date", invoice.date],
    ...(invoice.dueDate ? [["Due", invoice.dueDate] as const] : []),
  ];
  for (const [label, value] of metaBlock) {
    drawTextSafe(page, label, {
      x: metaX + metaWidth - font.widthOfTextAtSize(label, 9),
      y: metaY,
      size: 9,
      font,
      color: slate,
    });
    metaY -= 14;
    drawTextSafe(page, value, {
      x: metaX + metaWidth - font.widthOfTextAtSize(printable(value), 10),
      y: metaY,
      size: 10,
      font,
      color: ink,
    });
    metaY -= 16;
  }

  y = Math.min(companyY, metaY) - 18;

  drawTextSafe(page, "BILL TO", {
    x: MARGIN_X,
    y,
    size: 9,
    font,
    color: slate,
  });
  y -= 16;
  drawTextSafe(page, invoice.clientName, {
    x: MARGIN_X,
    y,
    size: 10,
    font: bold,
    color: ink,
  });
  y -= 14;
  if (invoice.clientAddress) {
    for (const line of wrapLines(invoice.clientAddress, font, 10, 4.2 * 72)) {
      drawTextSafe(page, line, { x: MARGIN_X, y, size: 10, font, color: ink });
      y -= 14;
    }
  }
  if (invoice.clientEmail) {
    drawTextSafe(page, invoice.clientEmail, {
      x: MARGIN_X,
      y,
      size: 10,
      font,
      color: ink,
    });
    y -= 14;
  }
  y -= 10;

  const headers = ["Description", "Qty", "Unit price", "Tax %", "Amount"] as const;
  const colX = [
    MARGIN_X,
    MARGIN_X + COLS.description,
    MARGIN_X + COLS.description + COLS.qty,
    MARGIN_X + COLS.description + COLS.qty + COLS.unit,
    MARGIN_X + COLS.description + COLS.qty + COLS.unit + COLS.tax,
  ];
  const headerHeight = 22;

  const drawHeader = () => {
    ensureSpace(headerHeight + 8);
    page.drawRectangle({
      x: MARGIN_X,
      y: y - headerHeight,
      width: CONTENT_WIDTH,
      height: headerHeight,
      color: accent,
    });
    const headerY = y - 15;
    drawTextSafe(page, headers[0], { x: colX[0] + 6, y: headerY, size: 9, font: bold, color: white });
    const rightHeaders: Array<[number, string]> = [
      [1, headers[1]],
      [2, headers[2]],
      [3, headers[3]],
      [4, headers[4]],
    ];
    for (const [index, label] of rightHeaders) {
      const width = [COLS.qty, COLS.unit, COLS.tax, COLS.amount][index - 1];
      drawTextSafe(page, label, {
        x: colX[index] + width - bold.widthOfTextAtSize(label, 9) - 6,
        y: headerY,
        size: 9,
        font: bold,
        color: white,
      });
    }
    y -= headerHeight;
  };

  drawHeader();

  invoice.items.forEach((item, itemIndex) => {
    const descLines = wrapLines(item.description, font, 9, COLS.description - 12);
    const rowHeight = Math.max(22, descLines.length * 12 + 10);
    if (y - rowHeight < MARGIN_BOTTOM + 80) {
      y = MARGIN_BOTTOM;
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN_TOP;
      drawHeader();
    }
    if (itemIndex % 2 === 1) {
      page.drawRectangle({
        x: MARGIN_X,
        y: y - rowHeight,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: altRow,
      });
    }
    page.drawRectangle({
      x: MARGIN_X,
      y: y - rowHeight,
      width: CONTENT_WIDTH,
      height: rowHeight,
      borderColor: grid,
      borderWidth: 0.4,
    });
    let textY = y - 14;
    for (const line of descLines) {
      drawTextSafe(page, line, {
        x: colX[0] + 6,
        y: textY,
        size: 9,
        font,
        color: ink,
      });
      textY -= 12;
    }
    const cells: Array<[number, number, string]> = [
      [1, COLS.qty, formatG(item.qty)],
      [2, COLS.unit, formatMoney(symbol, item.unitPrice)],
      [3, COLS.tax, formatG(item.taxRate)],
      [4, COLS.amount, formatMoney(symbol, item.qty * item.unitPrice + item.qty * item.unitPrice * (item.taxRate / 100))],
    ];
    const valueY = y - 14;
    for (const [index, width, label] of cells) {
      drawTextSafe(page, label, {
        x: colX[index] + width - font.widthOfTextAtSize(printable(label), 9) - 6,
        y: valueY,
        size: 9,
        font,
        color: ink,
      });
    }
    y -= rowHeight;
  });

  y -= 16;
  ensureSpace(70);
  const totalsRows: Array<{ label: string; value: string; total?: boolean }> = [
    { label: "Subtotal", value: formatMoney(symbol, totals.subtotal) },
    { label: "Tax", value: formatMoney(symbol, totals.taxTotal) },
    { label: "TOTAL", value: formatMoney(symbol, totals.grandTotal), total: true },
  ];
  for (const row of totalsRows) {
    const size = row.total ? 12 : 10;
    const rowFont = row.total ? bold : font;
    const color = row.total ? accent : ink;
    if (row.total) {
      page.drawLine({
        start: { x: MARGIN_X + CONTENT_WIDTH - 1.4 * 72, y: y + 10 },
        end: { x: MARGIN_X + CONTENT_WIDTH, y: y + 10 },
        thickness: 1,
        color: accent,
      });
    }
    drawTextSafe(page, row.label, {
      x: MARGIN_X + CONTENT_WIDTH - 1.4 * 72 - rowFont.widthOfTextAtSize(row.label, size) - 12,
      y,
      size,
      font: rowFont,
      color,
    });
    drawTextSafe(page, row.value, {
      x: MARGIN_X + CONTENT_WIDTH - rowFont.widthOfTextAtSize(printable(row.value), size),
      y,
      size,
      font: rowFont,
      color,
    });
    y -= 16;
  }

  if (invoice.notes || company.payment_terms) {
    y -= 12;
    ensureSpace(48);
    drawTextSafe(page, "NOTES / PAYMENT", {
      x: MARGIN_X,
      y,
      size: 9,
      font,
      color: slate,
    });
    y -= 16;
    if (company.payment_terms) {
      for (const line of wrapLines(company.payment_terms, font, 10, CONTENT_WIDTH)) {
        ensureSpace(16);
        drawTextSafe(page, line, { x: MARGIN_X, y, size: 10, font, color: ink });
        y -= 14;
      }
    }
    if (invoice.notes) {
      for (const line of wrapLines(invoice.notes, font, 10, CONTENT_WIDTH)) {
        ensureSpace(16);
        drawTextSafe(page, line, { x: MARGIN_X, y, size: 10, font, color: ink });
        y -= 14;
      }
    }
  }

  if (company.footer) {
    y -= 20;
    ensureSpace(20);
    drawTextSafe(page, company.footer, {
      x: MARGIN_X,
      y,
      size: 8,
      font,
      color: slate,
    });
  }

  return pdf.save({ useObjectStreams: false });
}
