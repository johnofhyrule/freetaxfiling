import { Income1099MISC } from '../types';

export interface Parsed1099MISCData {
  payerName?: string;
  payerEIN?: string;
  nonemployeeCompensation?: number; // Box 1 (1099-NEC)
  rents?: number; // Box 1 (old 1099-MISC)
  royalties?: number; // Box 2
  otherIncome?: number; // Box 3
  federalTaxWithheld?: number; // Box 4
}

/**
 * Parse 1099-MISC/1099-NEC form data from OCR text
 * Note: 1099-NEC (Nonemployee Compensation) was separated from 1099-MISC in 2020
 */
export function parse1099MISCText(text: string): Parsed1099MISCData {
  const parsed: Parsed1099MISCData = {};

  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Payer EIN (format: XX-XXXXXXX)
  const einMatch = cleanText.match(/\b(\d{2}[-\s]?\d{7})\b/);
  if (einMatch) {
    parsed.payerEIN = einMatch[1].replace(/[-\s]/g, '');
  }

  // Detect if this is 1099-NEC or 1099-MISC
  const isNEC = /1099[-\s]?NEC/i.test(text);

  if (isNEC) {
    // Box 1: Nonemployee compensation (1099-NEC)
    const box1NECPatterns = [
      /(?:Box\s*1|1\s*Nonemployee)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      /Nonemployee\s*compensation[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    ];
    const nec = extractAmount(cleanText, box1NECPatterns);
    if (nec) parsed.nonemployeeCompensation = nec;
  } else {
    // Box 1: Rents (old 1099-MISC)
    const box1RentPatterns = [
      /(?:Box\s*1|1\s*Rents?)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      /Rents?[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    ];
    const rents = extractAmount(cleanText, box1RentPatterns);
    if (rents) parsed.rents = rents;
  }

  // Box 2: Royalties
  const box2Patterns = [
    /(?:Box\s*2|2\s*Royalties)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Royalties[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const royalties = extractAmount(cleanText, box2Patterns);
  if (royalties) parsed.royalties = royalties;

  // Box 3: Other income
  const box3Patterns = [
    /(?:Box\s*3|3\s*Other\s*income)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Other\s*income[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const otherIncome = extractAmount(cleanText, box3Patterns);
  if (otherIncome) parsed.otherIncome = otherIncome;

  // Box 4: Federal income tax withheld
  const box4Patterns = [
    /(?:Box\s*4|4\s*Federal)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Federal\s*income\s*tax\s*withheld[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const federalTax = extractAmount(cleanText, box4Patterns);
  if (federalTax) parsed.federalTaxWithheld = federalTax;

  // Payer name - typically at the beginning
  const payerMatch = text.match(/^([A-Z][A-Za-z\s&.,'-]+?)(?:\s*\d{2}-?\d{7}|\n|$)/m);
  if (payerMatch) {
    parsed.payerName = payerMatch[1].trim();
  }

  return parsed;
}

/**
 * Helper function to extract and parse monetary amounts
 */
function extractAmount(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return undefined;
}

/**
 * Validate parsed 1099-MISC data
 */
export function validateParsed1099MISC(data: Parsed1099MISCData): string[] {
  const missing: string[] = [];

  if (!data.payerName) missing.push('Payer name');

  // At least one income field should be present
  const hasIncome = data.nonemployeeCompensation || data.rents ||
                   data.royalties || data.otherIncome;
  if (!hasIncome) missing.push('At least one income field');

  return missing;
}

/**
 * Convert parsed data to Income1099MISC format
 */
export function convertTo1099MISC(data: Parsed1099MISCData, id: string): Partial<Income1099MISC> {
  return {
    id,
    payerName: data.payerName || '',
    payerEIN: data.payerEIN,
    nonemployeeCompensation: data.nonemployeeCompensation,
    rents: data.rents,
    royalties: data.royalties,
    otherIncome: data.otherIncome,
    federalTaxWithheld: data.federalTaxWithheld,
  };
}
