import { Income1099DIV } from '../types';

export interface Parsed1099DIVData {
  payerName?: string;
  payerEIN?: string;
  ordinaryDividends?: number; // Box 1a
  qualifiedDividends?: number; // Box 1b
  totalCapitalGainDistributions?: number; // Box 2a
  federalTaxWithheld?: number; // Box 4
}

/**
 * Parse 1099-DIV form data from OCR text
 */
export function parse1099DIVText(text: string): Parsed1099DIVData {
  const parsed: Parsed1099DIVData = {};

  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Payer EIN (format: XX-XXXXXXX)
  const einMatch = cleanText.match(/\b(\d{2}[-\s]?\d{7})\b/);
  if (einMatch) {
    parsed.payerEIN = einMatch[1].replace(/[-\s]/g, '');
  }

  // Box 1a: Total ordinary dividends
  const box1aPatterns = [
    /(?:Box\s*1a|1a\s*Total\s*ordinary)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total\s*ordinary\s*dividends[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const ordinaryDividends = extractAmount(cleanText, box1aPatterns);
  if (ordinaryDividends) parsed.ordinaryDividends = ordinaryDividends;

  // Box 1b: Qualified dividends
  const box1bPatterns = [
    /(?:Box\s*1b|1b\s*Qualified)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Qualified\s*dividends[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const qualifiedDividends = extractAmount(cleanText, box1bPatterns);
  if (qualifiedDividends) parsed.qualifiedDividends = qualifiedDividends;

  // Box 2a: Total capital gain distributions
  const box2aPatterns = [
    /(?:Box\s*2a|2a\s*Total\s*capital)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Total\s*capital\s*gain\s*(?:distributions|distr\.?)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const capitalGains = extractAmount(cleanText, box2aPatterns);
  if (capitalGains) parsed.totalCapitalGainDistributions = capitalGains;

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
 * Validate parsed 1099-DIV data
 */
export function validateParsed1099DIV(data: Parsed1099DIVData): string[] {
  const missing: string[] = [];

  if (!data.payerName) missing.push('Payer name');
  if (data.ordinaryDividends === undefined) missing.push('Ordinary dividends (Box 1a)');

  return missing;
}

/**
 * Convert parsed data to Income1099DIV format
 */
export function convertTo1099DIV(data: Parsed1099DIVData, id: string): Partial<Income1099DIV> {
  return {
    id,
    payerName: data.payerName || '',
    payerEIN: data.payerEIN,
    ordinaryDividends: data.ordinaryDividends || 0,
    qualifiedDividends: data.qualifiedDividends || 0,
    totalCapitalGainDistributions: data.totalCapitalGainDistributions,
    federalTaxWithheld: data.federalTaxWithheld,
  };
}
