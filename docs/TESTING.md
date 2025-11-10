# Testing Guide

This document describes the testing setup and best practices for the FreeTaxFiling project.

## Test Stack

- **Unit/Integration Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Coverage:** Jest coverage reports

## Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all unit tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

## Test Structure

```
/freetaxfiling
├── lib/
│   ├── __tests__/
│   │   └── matching.test.ts          # Partner matching algorithm tests
│   └── tax-prep/
│       ├── __tests__/
│       │   └── tax-calculator.test.ts # Tax calculation tests (104+ assertions)
│       └── parsers/
│           └── __tests__/
│               └── w2-parser.test.ts  # W-2 OCR parser tests
├── e2e/
│   ├── free-file-navigator.spec.ts   # E2E tests for Free File Navigator
│   └── tax-prep-assistant.spec.ts    # E2E tests for Tax Prep Assistant
├── jest.config.ts                     # Jest configuration
├── jest.setup.ts                      # Jest setup (mocks, test utilities)
└── playwright.config.ts               # Playwright configuration
```

## Test Coverage

### Unit Tests (104 tests)

#### Tax Calculator Tests (~50 tests)
- **Income Tax Calculations:**
  - All filing statuses (single, married joint/separate, HOH, qualifying widow)
  - All tax years (2022-2025)
  - Progressive tax brackets
  - Edge cases (zero/negative income)

- **Self-Employment Tax:**
  - Standard SE tax calculation
  - Social Security wage base cap
  - Additional Medicare tax for high earners
  - Employer-equivalent deduction

- **Credits:**
  - Earned Income Credit (EIC) with phase-in/phase-out
  - Child Tax Credit with AGI phase-out
  - Additional Child Tax Credit (refundable portion)
  - Child and Dependent Care Credit
  - American Opportunity Tax Credit (AOTC)
  - Lifetime Learning Credit
  - Alternative Minimum Tax (AMT)

#### Partner Matching Tests (~40 tests)
- **AGI Requirements:**
  - Below limit matching
  - Exceeds limit disqualification
  - Close to limit warnings

- **Age Requirements:**
  - Within range matching
  - Below minimum disqualification
  - Above maximum disqualification

- **Geographic Restrictions:**
  - State include/exclude lists
  - Military-only restrictions

- **Feature Matching:**
  - State tax return support
  - Tax schedule support
  - Prior year returns
  - Spanish language
  - Live support
  - Mobile app

- **Scoring Algorithm:**
  - Deduction calculations
  - Multi-criteria scoring
  - Sorting and ranking
  - Helper functions (top N, eligible/ineligible filters)

#### W-2 Parser Tests (~14 tests)
- **OCR Text Parsing:**
  - Complete W-2 form parsing
  - Minimal W-2 with critical fields only
  - Various box label formats
  - Amounts with/without dollar signs and commas

- **OCR Error Handling:**
  - Common OCR errors (O vs 0, I vs 1, Z vs 2)
  - EIN format variations (with/without hyphen)

- **Validation:**
  - Missing field detection
  - Data conversion to W2Income format

### E2E Tests (Playwright)

#### Free File Navigator Flow
- Landing page display
- Navigation to eligibility form
- Form completion and validation
- Partner matching based on criteria
- Results page display
- Partner details and external links
- FAQ functionality
- Form validation errors
- Back navigation

#### Tax Prep Assistant Flow
- Landing page and start flow
- Basic info page completion
- Interview progress tracking
- W-2 income entry
- 1099 income entry (multiple types)
- Standard vs itemized deduction selection
- Dependent entry and child tax credit calculation
- Tax summary review
- PDF generation and download
- localStorage persistence
- Form validation
- Multi-page navigation

## Writing New Tests

### Unit Test Example

```typescript
import { calculateIncomeTax } from '../tax-calculator';

describe('Tax Calculator', () => {
  it('should calculate tax for single filer', () => {
    const tax = calculateIncomeTax(50000, 'single', 2024);
    expect(tax).toBe(6053);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete eligibility form', async ({ page }) => {
  await page.goto('/eligibility');
  await page.getByLabel(/AGI/i).fill('50000');
  await page.getByRole('button', { name: /Find Matches/i }).click();
  await expect(page).toHaveURL(/\/results/);
});
```

## Best Practices

### Unit Tests
1. **Test in isolation:** Mock external dependencies
2. **Use descriptive names:** Test name should describe what's being tested
3. **Follow AAA pattern:** Arrange, Act, Assert
4. **Test edge cases:** Zero, negative, boundary values
5. **Keep tests fast:** Unit tests should run in milliseconds

### E2E Tests
1. **Test user flows:** Focus on complete user journeys
2. **Use accessibility selectors:** getByRole, getByLabel (more robust)
3. **Avoid brittle selectors:** Don't rely on CSS classes/IDs
4. **Handle async properly:** Use await for all async operations
5. **Make tests resilient:** Use conditional checks for optional elements

## Code Coverage Goals

- **Critical Tax Logic:** 100% (tax calculations, credits)
- **Business Logic:** 90%+ (matching algorithm, parsers)
- **UI Components:** 70%+ (forms, pages)
- **Overall Target:** 80%+

## Continuous Integration

Tests should run automatically on:
- Every commit (unit tests)
- Pull requests (unit + E2E tests)
- Before deployment (full test suite + coverage)

## Troubleshooting

### Jest Issues

**Problem:** Tests fail with "Cannot find module"
```bash
# Solution: Clear Jest cache
npx jest --clearCache
```

**Problem:** Tests timeout
```bash
# Solution: Increase timeout in test
test('slow test', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

### Playwright Issues

**Problem:** Browser not found
```bash
# Solution: Reinstall Playwright browsers
npx playwright install
```

**Problem:** Tests fail in CI but pass locally
```bash
# Solution: Use CI-specific settings in playwright.config.ts
retries: process.env.CI ? 2 : 0
```

## Test Data

- **Fixtures:** Located in `__tests__/fixtures/` (create as needed)
- **Mock Data:** Defined inline in tests or in `jest.setup.ts`
- **Test PDFs/Images:** Store in `__tests__/test-data/` (for OCR tests)

## Next Steps

### Recommended Additional Tests

1. **Schema Validation Tests:**
   - Zod schema tests for all forms
   - Edge case validation (invalid formats, boundary values)

2. **Component Tests:**
   - React component rendering tests
   - Form interaction tests
   - Error state handling

3. **Storage Tests:**
   - localStorage persistence
   - Data migration tests
   - Clear/reset functionality

4. **PDF Generation Tests:**
   - PDF structure validation
   - Signature field placement
   - Multi-page overflow handling

5. **Performance Tests:**
   - Tax calculation performance benchmarks
   - Large dataset handling
   - Memory leak detection

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated:** 2025-11-10
**Test Count:** 104 unit tests + E2E test suites
**Coverage:** Target 80%+
