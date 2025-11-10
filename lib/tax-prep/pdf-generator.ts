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

  // Check if we need a second page for signatures
  let signaturePage = page1;
  let signatureY = yPosition - 50;

  // If less than 200px from bottom, create new page
  if (signatureY < 200) {
    signaturePage = pdfDoc.addPage([612, 792]);
    signatureY = height - 50;

    // Add page header
    signaturePage.drawText('Form 1040 - 2024 (continued)', {
      x: 50,
      y: signatureY,
      size: 14,
      font: helveticaBold,
    });

    signaturePage.drawText(`${taxReturn.form1040.taxpayer.firstName} ${taxReturn.form1040.taxpayer.lastName}`, {
      x: 50,
      y: signatureY - 20,
      size: 10,
      font: helveticaFont,
    });

    signaturePage.drawText(`SSN: ${taxReturn.form1040.taxpayer.ssn}`, {
      x: 400,
      y: signatureY - 20,
      size: 10,
      font: helveticaFont,
    });

    signatureY -= 60;
  }

  // Signature Section
  signaturePage.drawText('SIGN HERE', {
    x: 50,
    y: signatureY,
    size: 12,
    font: helveticaBold,
  });

  signatureY -= 25;
  signaturePage.drawText('Under penalties of perjury, I declare that I have examined this return and to the best of my', {
    x: 50,
    y: signatureY,
    size: 8,
    font: helveticaFont,
  });

  signatureY -= 12;
  signaturePage.drawText('knowledge and belief, it is true, correct, and complete.', {
    x: 50,
    y: signatureY,
    size: 8,
    font: helveticaFont,
  });

  signatureY -= 30;

  // Taxpayer signature line
  signaturePage.drawLine({
    start: { x: 50, y: signatureY },
    end: { x: 300, y: signatureY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  signaturePage.drawText('Your signature', {
    x: 50,
    y: signatureY - 15,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Date line for taxpayer
  signaturePage.drawLine({
    start: { x: 320, y: signatureY },
    end: { x: 450, y: signatureY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  signaturePage.drawText('Date', {
    x: 320,
    y: signatureY - 15,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Spouse signature (if married filing jointly)
  if (taxReturn.form1040.filingStatus === 'married-joint') {
    signatureY -= 45;

    signaturePage.drawLine({
      start: { x: 50, y: signatureY },
      end: { x: 300, y: signatureY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    signaturePage.drawText("Spouse's signature (if filing jointly)", {
      x: 50,
      y: signatureY - 15,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Date line for spouse
    signaturePage.drawLine({
      start: { x: 320, y: signatureY },
      end: { x: 450, y: signatureY },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    signaturePage.drawText('Date', {
      x: 320,
      y: signatureY - 15,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Footer (add to signature page)
  signaturePage.drawText('This is a simplified tax return generated by Free Tax Filing Platform.', {
    x: 50,
    y: 50,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  signaturePage.drawText('For official IRS forms, visit www.irs.gov', {
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
  const capitalGains = taxReturn.form1040.capitalGains1099B.reduce(
    (sum, cg) => sum + cg.gainOrLoss,
    0
  );
  const miscIncome = taxReturn.form1040.misc1099.reduce((sum, misc) => {
    return sum +
      (misc.nonemployeeCompensation || 0) +
      (misc.rents || 0) +
      (misc.royalties || 0) +
      (misc.otherIncome || 0);
  }, 0);

  // Self-employment income (net profit)
  const selfEmploymentIncome = (taxReturn.form1040.selfEmploymentIncome || []).reduce((sum, business) => {
    const income = business.grossReceipts - business.returns + business.otherIncome;
    const expenses =
      business.advertising +
      business.carAndTruck +
      business.commissions +
      business.insurance +
      business.interest +
      business.legal +
      business.officeExpense +
      business.rent +
      business.repairs +
      business.supplies +
      business.taxes +
      business.travel +
      business.meals +
      business.utilities +
      business.wages +
      business.otherExpenses.reduce((s, e) => s + e.amount, 0);
    return sum + (income - expenses);
  }, 0);

  // Rental income (net income)
  const rentalIncome = (taxReturn.form1040.rentalIncome || []).reduce((sum, property) => {
    const expenses =
      property.advertising +
      property.auto +
      property.cleaning +
      property.commissions +
      property.insurance +
      property.legal +
      property.management +
      property.mortgage +
      property.otherInterest +
      property.repairs +
      property.supplies +
      property.taxes +
      property.utilities +
      property.depreciation +
      property.otherExpenses.reduce((s, e) => s + e.amount, 0);
    return sum + (property.rents - expenses);
  }, 0);

  const totalIncome = w2Wages + interestIncome + dividendIncome + capitalGains + miscIncome + selfEmploymentIncome + rentalIncome;

  // Adjustments to income
  const adjustments = taxReturn.form1040.adjustments;
  const totalAdjustments =
    adjustments.educatorExpenses +
    adjustments.businessExpenses +
    adjustments.hsaDeduction +
    adjustments.movingExpenses +
    adjustments.selfEmploymentTax +
    adjustments.selfEmployedRetirement +
    adjustments.selfEmployedHealthInsurance +
    adjustments.penalty +
    adjustments.iraDeduction +
    adjustments.studentLoanInterest +
    adjustments.tuitionAndFees;

  // AGI = Total Income - Adjustments
  const adjustedGrossIncome = totalIncome - totalAdjustments;

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
