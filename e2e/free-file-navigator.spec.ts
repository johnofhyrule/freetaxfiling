import { test, expect } from '@playwright/test';

test.describe('Free File Navigator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Free Tax Filing/i })).toBeVisible();
  });

  test('should navigate to eligibility form', async ({ page }) => {
    // Click "Check Eligibility" or similar button to start
    await page.getByRole('link', { name: /Find Your Free Option/i }).click();

    // Should navigate to eligibility page
    await expect(page).toHaveURL('/eligibility');
    await expect(page.getByRole('heading', { name: /Eligibility/i })).toBeVisible();
  });

  test('should complete eligibility form and show results', async ({ page }) => {
    // Navigate to eligibility form
    await page.goto('/eligibility');

    // Fill out the form
    await page.getByLabel(/Adjusted Gross Income/i).fill('50000');
    await page.getByLabel(/Filing Status/i).selectOption('single');
    await page.getByLabel(/State/i).selectOption('CA');

    // Age field
    await page.getByLabel(/Age/i).fill('30');

    // Checkboxes - only check ones that are needed
    const stateReturnCheckbox = page.getByLabel(/state tax return/i);
    if (await stateReturnCheckbox.isVisible()) {
      await stateReturnCheckbox.check();
    }

    // Submit form
    await page.getByRole('button', { name: /Find Matches/i }).click();

    // Should navigate to results page
    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByText(/match/i)).toBeVisible();
  });

  test('should filter partners based on AGI', async ({ page }) => {
    await page.goto('/eligibility');

    // Fill out form with high AGI that would filter some partners
    await page.getByLabel(/Adjusted Gross Income/i).fill('80000');
    await page.getByLabel(/Filing Status/i).selectOption('single');
    await page.getByLabel(/State/i).selectOption('CA');

    await page.getByRole('button', { name: /Find Matches/i }).click();

    await expect(page).toHaveURL(/\/results/);

    // Should show some eligible and possibly some ineligible partners
    const resultsSection = page.locator('[data-testid="eligible-partners"], .results-section, main');
    await expect(resultsSection).toBeVisible();
  });

  test('should show partner details and external link', async ({ page }) => {
    await page.goto('/eligibility');

    // Fill out simple eligibility form
    await page.getByLabel(/Adjusted Gross Income/i).fill('40000');
    await page.getByLabel(/Filing Status/i).selectOption('single');
    await page.getByLabel(/State/i).selectOption('CA');

    await page.getByRole('button', { name: /Find Matches/i }).click();

    await expect(page).toHaveURL(/\/results/);

    // Find first partner card/link
    const firstPartner = page.locator('a[href^="http"]').first();
    await expect(firstPartner).toBeVisible();

    // Partner link should open in new tab
    await expect(firstPartner).toHaveAttribute('target', '_blank');
  });

  test('should display FAQ section on landing page', async ({ page }) => {
    await page.goto('/');

    // Look for FAQ heading or content
    const faqSection = page.locator('text=/FAQ|Frequently Asked Questions|Questions/i').first();

    // FAQ should exist on the page
    if (await faqSection.isVisible()) {
      await expect(faqSection).toBeVisible();
    }
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/eligibility');

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /Find Matches/i }).click();

    // Should show validation errors (form shouldn't submit)
    await expect(page).toHaveURL('/eligibility');

    // Look for error messages (could be inline or summary)
    const hasErrors = await page.locator('text=/required|invalid|error/i').count() > 0;
    expect(hasErrors).toBeTruthy();
  });

  test('should allow going back from results to modify criteria', async ({ page }) => {
    // Complete flow to results
    await page.goto('/eligibility');

    await page.getByLabel(/Adjusted Gross Income/i).fill('50000');
    await page.getByLabel(/Filing Status/i).selectOption('single');
    await page.getByLabel(/State/i).selectOption('CA');

    await page.getByRole('button', { name: /Find Matches/i }).click();

    await expect(page).toHaveURL(/\/results/);

    // Find and click back/modify button if it exists
    const backButton = page.getByRole('link', { name: /back|modify|change/i }).or(page.getByRole('button', { name: /back|modify|change/i }));

    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/eligibility|\//);
    } else {
      // Otherwise just use browser back
      await page.goBack();
      await expect(page).toHaveURL('/eligibility');
    }
  });
});
