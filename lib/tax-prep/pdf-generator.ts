/**
 * PDF Generation for Tax Forms
 *
 * Creates IRS-style PDF documents from tax return data.
 * Note: In production, you'd use official IRS PDF forms and fill them in.
 * This is a simplified version for demonstration.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TaxReturn, STANDARD_DEDUCTIONS_2024, STANDARD_DEDUCTIONS_2023 } from './types';

interface TaxCalculation {
  totalIncome: number;
  adjustedGrossIncome: number;
  deduction: number;
  taxableIncome: number;
  taxBeforeCredits: number;
  totalCredits: number;
  totalTax: number;
  totalPayments: number;
  refundOrOwed: number;
  isRefund: boolean;
}

export async function generateForm1040PDF(taxReturn: TaxReturn): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Calculate tax
  const calc = calculateTax(taxReturn);

  // Page 1 - Form 1040
  const page1 = pdfDoc.addPage([612, 792]); // US Letter size
  const { width, height } = page1.getSize();

  let yPosition = height - 50;

  // Header
  page1.drawText('U.S. Individual Income Tax Return', {
    x: 50,
    y: yPosition,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;
  page1.drawText(`Form 1040 - ${taxReturn.form1040.taxYear}`, {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Personal Information
  page1.drawText('PERSONAL INFORMATION', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
  });

  yPosition -= 25;
  page1.drawText(`Name: ${taxReturn.form1040.taxpayer.firstName} ${taxReturn.form1040.taxpayer.lastName}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 20;
  page1.drawText(`SSN: ${taxReturn.form1040.taxpayer.ssn}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 20;
  page1.drawText(`Address: ${taxReturn.form1040.taxpayer.address}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 20;
  const cityStateZip = `${taxReturn.form1040.taxpayer.city}, ${taxReturn.form1040.taxpayer.state} ${taxReturn.form1040.taxpayer.zipCode}`;
  page1.drawText(cityStateZip, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 20;
  const filingStatus = taxReturn.form1040.filingStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  page1.drawText(`Filing Status: ${filingStatus}`, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 40;

  // Dependents
  if (taxReturn.form1040.dependents.length > 0) {
    page1.drawText('DEPENDENTS', {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBold,
    });

    yPosition -= 25;
    taxReturn.form1040.dependents.forEach((dep, idx) => {
      const depText = `${idx + 1}. ${dep.firstName} ${dep.lastName} - ${dep.relationship} - SSN: ${dep.ssn}`;
      page1.drawText(depText, {
        x: 50,
        y: yPosition,
        size: 9,
        font: helveticaFont,
      });
      yPosition -= 18;
    });

    yPosition -= 20;
  }

  // Income Section
  page1.drawText('INCOME', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
  });

  yPosition -= 25;

  // W-2 Income
  taxReturn.form1040.w2Income.forEach((w2, idx) => {
    page1.drawText(`W-2 ${idx + 1}: ${w2.employerName}`, {
      x: 50,
      y: yPosition,
      size: 9,
      font: helveticaFont,
    });

    page1.drawText(`$${w2.wages.toLocaleString()}`, {
      x: 450,
      y: yPosition,
      size: 9,
      font: helveticaFont,
    });

    yPosition -= 18;
  });

  yPosition -= 10;
  page1.drawText('Total Income', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  page1.drawText(`$${calc.totalIncome.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  yPosition -= 30;

  // AGI
  page1.drawText('Adjusted Gross Income (AGI)', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  page1.drawText(`$${calc.adjustedGrossIncome.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  yPosition -= 40;

  // Deductions
  page1.drawText('DEDUCTIONS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
  });

  yPosition -= 25;

  const deductionType = taxReturn.form1040.useStandardDeduction ? 'Standard Deduction' : 'Itemized Deductions';
  page1.drawText(deductionType, {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  page1.drawText(`$${calc.deduction.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 30;

  // Taxable Income
  page1.drawText('Taxable Income', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  page1.drawText(`$${calc.taxableIncome.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  yPosition -= 40;

  // Tax Calculation
  page1.drawText('TAX CALCULATION', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
  });

  yPosition -= 25;
  page1.drawText('Tax Before Credits', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  page1.drawText(`$${calc.taxBeforeCredits.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 20;
  page1.drawText('Total Credits', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  page1.drawText(`($${calc.totalCredits.toLocaleString()})`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  yPosition -= 20;
  page1.drawText('Total Tax', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  page1.drawText(`$${calc.totalTax.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  yPosition -= 40;

  // Payments
  page1.drawText('PAYMENTS', {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBold,
  });

  yPosition -= 25;
  page1.drawText('Federal Tax Withheld', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  page1.drawText(`$${taxReturn.form1040.payments.federalWithholding.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaFont,
  });

  if (taxReturn.form1040.payments.estimatedPayments > 0) {
    yPosition -= 20;
    page1.drawText('Estimated Tax Payments', {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
    });

    page1.drawText(`$${taxReturn.form1040.payments.estimatedPayments.toLocaleString()}`, {
      x: 450,
      y: yPosition,
      size: 10,
      font: helveticaFont,
    });
  }

  yPosition -= 20;
  page1.drawText('Total Payments', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  page1.drawText(`$${calc.totalPayments.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 10,
    font: helveticaBold,
  });

  yPosition -= 40;

  // Refund or Amount Owed
  const resultColor = calc.isRefund ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0);
  const resultLabel = calc.isRefund ? 'REFUND' : 'AMOUNT OWED';

  page1.drawText(resultLabel, {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: resultColor,
  });

  page1.drawText(`$${calc.refundOrOwed.toLocaleString()}`, {
    x: 450,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: resultColor,
  });

  // Footer
  page1.drawText('This is a simplified tax return generated by Free Tax Filing Platform.', {
    x: 50,
    y: 50,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  page1.drawText('For official IRS forms, visit www.irs.gov', {
    x: 50,
    y: 38,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

function calculateTax(taxReturn: TaxReturn): TaxCalculation {
  // Calculate total income
  const w2Wages = taxReturn.form1040.w2Income.reduce((sum, w2) => sum + w2.wages, 0);
  const interestIncome = taxReturn.form1040.interest1099INT.reduce(
    (sum, int) => sum + int.interestIncome,
    0
  );
  const dividendIncome = taxReturn.form1040.dividends1099DIV.reduce(
    (sum, div) => sum + div.ordinaryDividends,
    0
  );

  const totalIncome = w2Wages + interestIncome + dividendIncome;

  // AGI (simplified)
  const adjustedGrossIncome = totalIncome;

  // Deduction
  let deduction = 0;
  if (taxReturn.form1040.useStandardDeduction) {
    if (taxReturn.form1040.taxYear === 2024) {
      deduction = STANDARD_DEDUCTIONS_2024[taxReturn.form1040.filingStatus];
    } else if (taxReturn.form1040.taxYear === 2023) {
      deduction = STANDARD_DEDUCTIONS_2023[taxReturn.form1040.filingStatus];
    }
  } else if (taxReturn.form1040.itemizedDeductions) {
    const itemized = taxReturn.form1040.itemizedDeductions;
    const saltCap = Math.min(
      10000,
      itemized.stateIncomeTax + itemized.realEstateTax + itemized.personalPropertyTax
    );
    deduction =
      itemized.medicalExpenses +
      saltCap +
      itemized.mortgageInterest +
      itemized.mortgagePoints +
      itemized.mortgageInsurance +
      itemized.cashContributions +
      itemized.nonCashContributions +
      itemized.casualtyLosses;
  }

  // Taxable Income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction);

  // Tax calculation (2024 single filer rates)
  const taxBeforeCredits = calculateTaxAmount(taxableIncome, taxReturn.form1040.filingStatus);

  // Credits
  const totalCredits =
    taxReturn.form1040.credits.childTaxCredit +
    taxReturn.form1040.credits.otherDependentCredit +
    taxReturn.form1040.credits.childCareCredit +
    taxReturn.form1040.credits.educationCredits +
    taxReturn.form1040.credits.retirementSavingsCredit;

  // Total Tax
  const totalTax = Math.max(0, taxBeforeCredits - totalCredits);

  // Payments
  const totalPayments =
    taxReturn.form1040.payments.federalWithholding +
    taxReturn.form1040.payments.estimatedPayments +
    taxReturn.form1040.payments.refundAppliedFromPriorYear;

  // Refund or Amount Owed
  const difference = totalPayments - totalTax;
  const refundOrOwed = Math.abs(difference);
  const isRefund = difference >= 0;

  return {
    totalIncome,
    adjustedGrossIncome,
    deduction,
    taxableIncome,
    taxBeforeCredits,
    totalCredits,
    totalTax,
    totalPayments,
    refundOrOwed,
    isRefund,
  };
}

function calculateTaxAmount(taxableIncome: number, filingStatus: string): number {
  // 2024 tax brackets for single filers
  if (filingStatus === 'single') {
    if (taxableIncome <= 11600) return taxableIncome * 0.10;
    if (taxableIncome <= 47150) return 1160 + (taxableIncome - 11600) * 0.12;
    if (taxableIncome <= 100525) return 5426 + (taxableIncome - 47150) * 0.22;
    if (taxableIncome <= 191950) return 17168.50 + (taxableIncome - 100525) * 0.24;
    if (taxableIncome <= 243725) return 39110.50 + (taxableIncome - 191950) * 0.32;
    if (taxableIncome <= 609350) return 55678.50 + (taxableIncome - 243725) * 0.35;
    return 183647.25 + (taxableIncome - 609350) * 0.37;
  }

  // Simplified for other filing statuses
  return taxableIncome * 0.22;
}
