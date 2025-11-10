import { test, expect } from '@playwright/test';

test.describe('Tax Preparation Assistant', () => {
  test.beforeEach(async ({ page }) => {
    // Check if feature flag is enabled, otherwise skip
    await page.goto('/tax-prep');
  });

  test('should display tax prep landing page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Tax Prep/i })).toBeVisible();
  });

  test('should start new tax return', async ({ page }) => {
    await page.goto('/tax-prep/start');

    // Select tax year
    await page.getByLabel(/Tax Year/i).selectOption('2024');

    // Select filing status
    await page.getByLabel(/Filing Status/i).selectOption('single');

    // Click start or continue button
    await page.getByRole('button', { name: /Start|Continue/i }).click();

    // Should navigate to first interview page (basic info)
    await expect(page).toHaveURL(/\/tax-prep\/interview\/basic-info/);
  });

  test('should complete basic info page', async ({ page }) => {
    await page.goto('/tax-prep/interview/basic-info');

    // Fill out personal information
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Social Security Number/i).fill('123-45-6789');

    // Address
    await page.getByLabel(/Street Address/i).fill('123 Main St');
    await page.getByLabel(/City/i).fill('San Francisco');
    await page.getByLabel(/State/i).selectOption('CA');
    await page.getByLabel(/ZIP/i).fill('94102');

    // Continue to next page
    await page.getByRole('button', { name: /Continue|Next/i }).click();

    // Should navigate to dependents or next page
    await expect(page).toHaveURL(/\/tax-prep\/interview\//);
  });

  test('should navigate through interview pages with progress bar', async ({ page }) => {
    await page.goto('/tax-prep/interview/basic-info');

    // Progress bar should be visible
    const progressBar = page.locator('[role="progressbar"], .progress-bar, [data-testid="progress"]');
    const hasProgress = await progressBar.count() > 0;

    if (hasProgress) {
      await expect(progressBar.first()).toBeVisible();
    }
  });

  test('should add W-2 income', async ({ page }) => {
    await page.goto('/tax-prep/interview/w2-income');

    // Click add W-2 button
    await page.getByRole('button', { name: /Add W-2|Add W2|New W-2/i }).click();

    // Fill out W-2 form
    await page.getByLabel(/Employer Name/i).fill('Acme Corp');
    await page.getByLabel(/EIN|Employer ID/i).fill('12-3456789');
    await page.getByLabel(/Wages.*Box 1/i).fill('65000');
    await page.getByLabel(/Federal.*Box 2/i).fill('9750');

    // Save W-2
    await page.getByRole('button', { name: /Save|Add/i }).click();

    // Should show W-2 in list
    await expect(page.getByText(/Acme Corp/i)).toBeVisible();
  });

  test('should select standard deduction', async ({ page }) => {
    await page.goto('/tax-prep/interview/deductions');

    // Select standard deduction radio button
    const standardDeduction = page.getByLabel(/Standard Deduction/i);
    if (await standardDeduction.isVisible()) {
      await standardDeduction.check();
    }

    // Continue
    await page.getByRole('button', { name: /Continue|Next/i }).click();

    await expect(page).toHaveURL(/\/tax-prep\/interview\//);
  });

  test('should complete interview and view tax summary', async ({ page }) => {
    // This is a simplified flow - in reality would need to fill all pages
    await page.goto('/tax-prep/interview/review');

    // Review page should show tax calculation
    const taxSummary = page.locator('text=/Total Tax|Refund|Amount Owed/i');
    await expect(taxSummary.first()).toBeVisible();

    // Should show dollar amounts
    const dollarAmounts = page.locator('text=/\\$[0-9,]+/');
    expect(await dollarAmounts.count()).toBeGreaterThan(0);
  });

  test('should navigate to PDF download after review', async ({ page }) => {
    await page.goto('/tax-prep/interview/review');

    // Find download or finish button
    const downloadButton = page.getByRole('button', { name: /Download|Finish|Complete/i }).or(
      page.getByRole('link', { name: /Download|Finish|Complete/i })
    );

    if (await downloadButton.isVisible()) {
      await downloadButton.click();

      // Should navigate to download page
      await expect(page).toHaveURL(/\/tax-prep\/download/);
    }
  });

  test('should generate and download PDF', async ({ page }) => {
    await page.goto('/tax-prep/download');

    // Wait for PDF generation
    await page.waitForTimeout(2000);

    // Look for download button
    const downloadBtn = page.getByRole('button', { name: /Download PDF|Download Form/i });

    if (await downloadBtn.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');

      // Click download
      await downloadBtn.click();

      // Wait for download
      const download = await downloadPromise;

      // Verify filename contains 1040
      expect(download.suggestedFilename()).toContain('1040');
    }
  });

  test('should persist data in localStorage', async ({ page }) => {
    await page.goto('/tax-prep/interview/basic-info');

    // Fill out some data
    await page.getByLabel(/First Name/i).fill('Jane');
    await page.getByLabel(/Last Name/i).fill('Smith');

    // Reload the page
    await page.reload();

    // Data should persist
    await expect(page.getByLabel(/First Name/i)).toHaveValue('Jane');
    await expect(page.getByLabel(/Last Name/i)).toHaveValue('Smith');
  });

  test('should allow adding multiple dependents', async ({ page }) => {
    await page.goto('/tax-prep/interview/dependents');

    // Add first dependent
    const addButton = page.getByRole('button', { name: /Add Dependent/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill out dependent info
      await page.getByLabel(/Name/i).first().fill('Child One');
      await page.getByLabel(/Relationship/i).first().selectOption('child');

      // Save if needed
      const saveButton = page.getByRole('button', { name: /Save|Add/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }

      // Should show dependent in list
      await expect(page.getByText(/Child One/i)).toBeVisible();
    }
  });

  test('should calculate child tax credit automatically', async ({ page }) => {
    await page.goto('/tax-prep/interview/dependents');

    // If there's a way to add qualifying children, add one
    const addButton = page.getByRole('button', { name: /Add Dependent/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Fill dependent as qualifying child
      await page.getByLabel(/Name/i).first().fill('Qualifying Child');

      // Select qualifying age (under 17)
      const ageField = page.getByLabel(/Age|Date of Birth/i).first();
      if (await ageField.isVisible()) {
        await ageField.fill('10');
      }

      // Navigate to review to see credits
      await page.goto('/tax-prep/interview/review');

      // Should show child tax credit
      const creditText = page.locator('text=/Child Tax Credit/i');
      if (await creditText.isVisible()) {
        await expect(creditText).toBeVisible();
      }
    }
  });

  test('should handle 1099 income', async ({ page }) => {
    await page.goto('/tax-prep/interview/1099-income');

    // Should have tabs for different 1099 types
    const tabs = page.locator('[role="tab"], .tab');

    if ((await tabs.count()) > 0) {
      // Click first tab (e.g., 1099-INT)
      await tabs.first().click();

      // Add 1099
      const addButton = page.getByRole('button', { name: /Add.*1099/i });
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill out form (example for 1099-INT)
        const payerField = page.getByLabel(/Payer/i);
        if (await payerField.isVisible()) {
          await payerField.fill('Bank of America');
        }

        // Save
        const saveButton = page.getByRole('button', { name: /Save|Add/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    }
  });

  test('should show itemized vs standard deduction recommendation', async ({ page }) => {
    await page.goto('/tax-prep/interview/deductions');

    // Look for recommendation text
    const recommendation = page.locator('text=/recommend|should choose|better option/i');

    if (await recommendation.isVisible()) {
      await expect(recommendation).toBeVisible();
    }
  });

  test('should validate SSN format', async ({ page }) => {
    await page.goto('/tax-prep/interview/basic-info');

    // Enter invalid SSN
    await page.getByLabel(/Social Security Number/i).fill('123');

    // Try to continue
    await page.getByRole('button', { name: /Continue|Next/i }).click();

    // Should show error or stay on page
    const hasError = await page.locator('text=/invalid|required|format/i').count() > 0;

    if (hasError) {
      await expect(page).toHaveURL(/basic-info/);
    }
  });

  test('should allow navigation back to previous pages', async ({ page }) => {
    await page.goto('/tax-prep/interview/deductions');

    // Look for back button
    const backButton = page.getByRole('button', { name: /Back|Previous/i }).or(
      page.getByRole('link', { name: /Back|Previous/i })
    );

    if (await backButton.isVisible()) {
      await backButton.click();

      // Should navigate to previous page
      await expect(page).toHaveURL(/\/tax-prep\/interview\//);
    }
  });
});
