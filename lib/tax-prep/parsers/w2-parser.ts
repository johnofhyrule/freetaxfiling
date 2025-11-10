import { W2Income } from '../types';

export interface ParsedW2Data {
  employerName?: string;
  employerEIN?: string;
  wages?: number; // Box 1
  federalTaxWithheld?: number; // Box 2
  socialSecurityWages?: number; // Box 3
  socialSecurityTaxWithheld?: number; // Box 4
  medicareWages?: number; // Box 5
  medicareTaxWithheld?: number; // Box 6
  stateTaxWithheld?: number;
  stateWages?: number;
  state?: string;
}

/**
 * Parse W-2 form data from OCR text
 * Uses pattern matching to extract fields from common W-2 layouts
 */
export function parseW2Text(text: string): ParsedW2Data {
  const parsed: ParsedW2Data = {};

  // Clean up text: normalize whitespace and remove extra line breaks
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Employer EIN (format: XX-XXXXXXX)
  // Improved to handle common OCR errors (O vs 0, I vs 1)
  const einMatch = cleanText.match(/\b([O0]?\d{1,2}[-\s]?\d{7})\b/);
  if (einMatch) {
    let ein = einMatch[1].replace(/[-\s]/g, '');
    // Fix common OCR errors
    ein = ein.replace(/O/g, '0').replace(/I/g, '1').replace(/l/g, '1');
    if (ein.length === 9) {
      parsed.employerEIN = ein.slice(0, 2) + '-' + ein.slice(2);
    }
  }

  // Box 1: Wages, tips, other compensation
  // Enhanced patterns to catch more variations
  const box1Patterns = [
    /(?:Box\s*[1I]|[1I]\s*Wages?)[:\s.-]*\$?\s*([\d,]+\.?\d*)/i,
    /Wages?,?\s*tips?,?\s*(?:and\s*)?other\s*comp(?:ensation)?[:\s.-]*\$?\s*([\d,]+\.?\d*)/i,
    /\b[1I]\s*[:\s.-]+\s*\$?\s*([\d,]+\.?\d*)/,  // Generic box 1 pattern
  ];
  const wages = extractAmount(cleanText, box1Patterns);
  if (wages) parsed.wages = wages;

  // Box 2: Federal income tax withheld
  const box2Patterns = [
    /(?:Box\s*[2Z]|[2Z]\s*Federal)[:\s.-]*\$?\s*([\d,]+\.?\d*)/i,
    /Federal\s*income\s*tax\s*(?:with)?held[:\s.-]*\$?\s*([\d,]+\.?\d*)/i,
    /\b[2Z]\s*[:\s.-]+\s*\$?\s*([\d,]+\.?\d*)/,  // Generic box 2 pattern
  ];
  const federalTax = extractAmount(cleanText, box2Patterns);
  if (federalTax) parsed.federalTaxWithheld = federalTax;

  // Box 3: Social security wages
  const box3Patterns = [
    /(?:Box\s*3|3\s*Social\s*security\s*wages)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Social\s*security\s*wages[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const ssWages = extractAmount(cleanText, box3Patterns);
  if (ssWages) parsed.socialSecurityWages = ssWages;

  // Box 4: Social security tax withheld
  const box4Patterns = [
    /(?:Box\s*4|4\s*Social\s*security\s*tax)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Social\s*security\s*tax\s*withheld[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const ssTax = extractAmount(cleanText, box4Patterns);
  if (ssTax) parsed.socialSecurityTaxWithheld = ssTax;

  // Box 5: Medicare wages and tips
  const box5Patterns = [
    /(?:Box\s*5|5\s*Medicare\s*wages)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Medicare\s*wages\s*and\s*tips[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const medicareWages = extractAmount(cleanText, box5Patterns);
  if (medicareWages) parsed.medicareWages = medicareWages;

  // Box 6: Medicare tax withheld
  const box6Patterns = [
    /(?:Box\s*6|6\s*Medicare\s*tax)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /Medicare\s*tax\s*withheld[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const medicareTax = extractAmount(cleanText, box6Patterns);
  if (medicareTax) parsed.medicareTaxWithheld = medicareTax;

  // State tax withheld
  const stateWithheldPatterns = [
    /(?:Box\s*17|17\s*State\s*income\s*tax)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /State\s*income\s*tax[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const stateTax = extractAmount(cleanText, stateWithheldPatterns);
  if (stateTax) parsed.stateTaxWithheld = stateTax;

  // State wages
  const stateWagesPatterns = [
    /(?:Box\s*16|16\s*State\s*wages)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /State\s*wages,?\s*tips[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  const stateWages = extractAmount(cleanText, stateWagesPatterns);
  if (stateWages) parsed.stateWages = stateWages;

  // State abbreviation
  const stateMatch = cleanText.match(/\b([A-Z]{2})\b/);
  if (stateMatch) {
    parsed.state = stateMatch[1];
  }

  // Employer name - try to find it at the beginning
  // This is tricky as layout varies, but typically appears early in the form
  const employerMatch = text.match(/^([A-Z][A-Za-z\s&.,'-]+?)(?:\s*\d{2}-?\d{7}|\n|$)/m);
  if (employerMatch) {
    parsed.employerName = employerMatch[1].trim();
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
      // Remove commas and parse as float
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }
  return undefined;
}

/**
 * Validate parsed W-2 data
 * Returns array of missing critical fields
 */
export function validateParsedW2(data: ParsedW2Data): string[] {
  const missing: string[] = [];

  // Critical fields that should be present
  if (!data.employerName) missing.push('Employer name');
  if (!data.employerEIN) missing.push('Employer EIN');
  if (data.wages === undefined) missing.push('Wages (Box 1)');
  if (data.federalTaxWithheld === undefined) missing.push('Federal tax withheld (Box 2)');

  return missing;
}

/**
 * Convert parsed data to W2Income format with a generated ID
 */
export function convertToW2Income(data: ParsedW2Data, id: string): Partial<W2Income> {
  return {
    id,
    employerName: data.employerName || '',
    employerEIN: data.employerEIN || '',
    wages: data.wages || 0,
    federalTaxWithheld: data.federalTaxWithheld || 0,
    socialSecurityWages: data.socialSecurityWages || 0,
    socialSecurityTaxWithheld: data.socialSecurityTaxWithheld || 0,
    medicareWages: data.medicareWages || 0,
    medicareTaxWithheld: data.medicareTaxWithheld || 0,
    stateTaxWithheld: data.stateTaxWithheld,
    stateWages: data.stateWages,
    state: data.state,
  };
}
