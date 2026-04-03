export interface ParsedReceipt {
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  vat_amount: number | null;
  excl_vat_amount: number | null;
  vat_number: string | null;
  line_items: LineItem[];
}

export interface LineItem {
  description: string;
  amount: number;
}

export function parseReceipt(rawText: string): ParsedReceipt {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  return {
    merchant_name: extractMerchant(lines),
    date: extractDate(rawText),
    total_amount: extractTotal(rawText),
    vat_amount: extractVat(rawText),
    excl_vat_amount: calculateExclVat(extractTotal(rawText), extractVat(rawText)),
    vat_number: extractVatNumber(rawText),
    line_items: extractLineItems(lines),
  };
}

function extractMerchant(lines: string[]): string | null {
  // Merchant name is typically the first non-empty, non-numeric line
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/[^a-zA-Z\s&'-]/g, '').trim();
    if (cleaned.length >= 3) {
      return cleaned;
    }
  }
  return null;
}

function extractDate(text: string): string | null {
  // Match common SA date formats: DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD, YYYY-MM-DD
  const patterns = [
    /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/, // YYYY-MM-DD
    /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const [, a, b, c] = match;
      if (a.length === 4) {
        return `${a}-${b}-${c}`;
      }
      // Assume DD/MM/YYYY for SA receipts
      return `${c}-${b}-${a}`;
    }
  }
  return null;
}

function extractTotal(text: string): number | null {
  // Look for TOTAL or TOTAAL followed by an amount
  const patterns = [
    /(?:TOTAL|TOTAAL|GRAND\s*TOTAL|AMOUNT\s*DUE|BALANCE\s*DUE)\s*[:\s]*R?\s*([\d,]+\.\d{2})/i,
    /R?\s*([\d,]+\.\d{2})\s*(?:TOTAL|TOTAAL)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseAmount(match[1]);
    }
  }

  // Fallback: find the largest amount on the receipt
  const amounts = [...text.matchAll(/R?\s*([\d,]+\.\d{2})/g)]
    .map((m) => parseAmount(m[1]))
    .filter((a): a is number => a !== null)
    .sort((a, b) => b - a);

  return amounts.length > 0 ? amounts[0] : null;
}

function extractVat(text: string): number | null {
  // Look for VAT or BTW followed by an amount (15% in SA)
  const patterns = [
    /(?:VAT|BTW|TAX)\s*(?:@?\s*15%?)?\s*[:\s]*R?\s*([\d,]+\.\d{2})/i,
    /R?\s*([\d,]+\.\d{2})\s*(?:VAT|BTW)/i,
    /(?:INCL|INCLUDES?)\s*(?:VAT|BTW)\s*[:\s]*R?\s*([\d,]+\.\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseAmount(match[1]);
    }
  }

  // If total found but no VAT line, calculate 15% VAT from VAT-inclusive total
  const total = extractTotal(text);
  if (total) {
    return Math.round((total * 15) / 115 * 100) / 100;
  }

  return null;
}

function extractVatNumber(text: string): string | null {
  // SA VAT numbers: 10 digits starting with 4
  const match = text.match(/\b(4\d{9})\b/);
  return match ? match[1] : null;
}

function calculateExclVat(total: number | null, vat: number | null): number | null {
  if (total !== null && vat !== null) {
    return Math.round((total - vat) * 100) / 100;
  }
  return null;
}

function extractLineItems(lines: string[]): LineItem[] {
  const items: LineItem[] = [];
  const itemPattern = /^(.+?)\s+R?\s*([\d,]+\.\d{2})\s*$/;

  for (const line of lines) {
    // Skip header/footer lines
    if (/TOTAL|TOTAAL|VAT|BTW|CHANGE|CASH|CARD|VISA|MASTER/i.test(line)) continue;

    const match = line.match(itemPattern);
    if (match) {
      const description = match[1].trim();
      const amount = parseAmount(match[2]);
      if (description.length >= 2 && amount !== null && amount > 0) {
        items.push({ description, amount });
      }
    }
  }

  return items;
}

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
