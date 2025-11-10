import { Income1099INT } from '../types';

export interface Parsed1099INTData {
  payerName?: string;
  payerEIN?: string;
  interestIncome?: number; // Box 1
  earlyWithdrawalPenalty?: number; // Box 2
  federalTaxWithheld?: number; // Box 4
}

/**
 * Parse 1099-INT form data from OCR text
 */
export function parse1099INTText(text: string): Parsed1099INTData {
  const parsed: Parsed1099INTData = {};

  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Payer EIN (format: XX-XXXXXXX)
  const einMatch = cleanText.match(/\b(\d{2}[-\s]?\d{7})\b/);
  if (einMatch) {
    parsed.payerEIN = einMatch[1].replace(/[-\s]/g, '');
  }

  // Box 1: Interest income
  const box1Patterns = [
    /(?:Box\s*1|1\s*Interest\s*income)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Interest\s*income[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const interestIncome = extractAmount(cleanText, box1Patterns);
  if (interestIncome) parsed.interestIncome = interestIncome;

  // Box 2: Early withdrawal penalty
  const box2Patterns = [
    /(?:Box\s*2|2\s*Early\s*withdrawal)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Early\s*withdrawal\s*penalty[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const penalty = extractAmount(cleanText, box2Patterns);
  if (penalty) parsed.earlyWithdrawalPenalty = penalty;

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
 * Validate parsed 1099-INT data
 */
export function validateParsed1099INT(data: Parsed1099INTData): string[] {
  const missing: string[] = [];

  if (!data.payerName) missing.push('Payer name');
  if (data.interestIncome === undefined) missing.push('Interest income (Box 1)');

  return missing;
}

/**
 * Convert parsed data to Income1099INT format
 */
export function convertTo1099INT(data: Parsed1099INTData, id: string): Partial<Income1099INT> {
  return {
    id,
    payerName: data.payerName || '',
    payerEIN: data.payerEIN,
    interestIncome: data.interestIncome || 0,
    earlyWithdrawalPenalty: data.earlyWithdrawalPenalty,
    federalTaxWithheld: data.federalTaxWithheld,
  };
}
