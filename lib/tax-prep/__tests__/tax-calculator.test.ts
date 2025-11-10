import {
  calculateIncomeTax,
  calculateSelfEmploymentTax,
  calculateEarnedIncomeCredit,
  calculateChildTaxCredit,
  calculateAdditionalChildTaxCredit,
  calculateChildCareCredit,
  calculateAmericanOpportunityCredit,
  calculateLifetimeLearningCredit,
  calculateAMT,
  TAX_BRACKETS_2024,
  TAX_BRACKETS_2023,
} from '../tax-calculator';

describe('Tax Calculator', () => {
  describe('calculateIncomeTax', () => {
    describe('2024 tax year - single filers', () => {
      it('should calculate tax for income in 10% bracket', () => {
        const tax = calculateIncomeTax(10000, 'single', 2024);
        expect(tax).toBe(1000); // 10% of $10,000
      });

      it('should calculate tax for income in 12% bracket', () => {
        const tax = calculateIncomeTax(50000, 'single', 2024);
        // First bracket: $11,600 @ 10% = $1,160
        // Second bracket: ($47,150 - $11,600) = $35,550 @ 12% = $4,266
        // Third bracket: ($50,000 - $47,150) = $2,850 @ 22% = $627
        // Total: $6,053
        expect(tax).toBe(6053);
      });

      it('should calculate tax for income in 22% bracket', () => {
        const tax = calculateIncomeTax(100000, 'single', 2024);
        // 10%: $11,600 @ 10% = $1,160
        // 12%: ($47,150 - $11,600) = $35,550 @ 12% = $4,266
        // 22%: ($100,000 - $47,150) = $52,850 @ 22% = $11,627
        // Total: $17,053
        expect(tax).toBe(17053);
      });

      it('should calculate tax for high income in 37% bracket', () => {
        const tax = calculateIncomeTax(700000, 'single', 2024);
        expect(tax).toBeGreaterThan(200000);
      });

      it('should return 0 for zero income', () => {
        const tax = calculateIncomeTax(0, 'single', 2024);
        expect(tax).toBe(0);
      });

      it('should return 0 for negative income', () => {
        const tax = calculateIncomeTax(-5000, 'single', 2024);
        expect(tax).toBe(0);
      });
    });

    describe('2024 tax year - married filing jointly', () => {
      it('should calculate tax for income in 10% bracket', () => {
        const tax = calculateIncomeTax(20000, 'married-joint', 2024);
        expect(tax).toBe(2000); // 10% of $20,000
      });

      it('should calculate tax for income in 12% bracket', () => {
        const tax = calculateIncomeTax(100000, 'married-joint', 2024);
        // 10%: $23,200 @ 10% = $2,320
        // 12%: ($94,300 - $23,200) = $71,100 @ 12% = $8,532
        // 22%: ($100,000 - $94,300) = $5,700 @ 22% = $1,254
        // Total: $12,106
        expect(tax).toBe(12106);
      });
    });

    describe('2024 tax year - head of household', () => {
      it('should calculate tax correctly', () => {
        const tax = calculateIncomeTax(75000, 'head-of-household', 2024);
        // 10%: $16,550 @ 10% = $1,655
        // 12%: ($63,100 - $16,550) = $46,550 @ 12% = $5,586
        // 22%: ($75,000 - $63,100) = $11,900 @ 22% = $2,618
        // Total: $9,859
        expect(tax).toBe(9859);
      });
    });

    describe('prior tax years', () => {
      it('should calculate 2023 tax correctly', () => {
        const tax = calculateIncomeTax(50000, 'single', 2023);
        // 2023 brackets: 10% up to $11,000, 12% up to $44,725, 22% above
        // 10%: $11,000 @ 10% = $1,100
        // 12%: ($44,725 - $11,000) = $33,725 @ 12% = $4,047
        // 22%: ($50,000 - $44,725) = $5,275 @ 22% = $1,160.50
        // Total: $6,307.50
        expect(tax).toBe(6307.5);
      });

      it('should calculate 2022 tax correctly', () => {
        const tax = calculateIncomeTax(50000, 'single', 2022);
        expect(tax).toBeGreaterThan(5000);
        expect(tax).toBeLessThan(10000);
      });
    });
  });

  describe('calculateSelfEmploymentTax', () => {
    it('should calculate SE tax for moderate income', () => {
      const result = calculateSelfEmploymentTax(50000, 'single', 2024);

      // 92.35% of $50,000 = $46,175
      // Social Security: $46,175 @ 12.4% = $5,725.70
      // Medicare: $46,175 @ 2.9% = $1,339.08
      // Total: $7,064.78
      // Deductible: $3,532.39 (50%)

      expect(result.seTax).toBeCloseTo(7064.78, 0);
      expect(result.deductibleAmount).toBeCloseTo(3532.39, 0);
    });

    it('should calculate SE tax with additional Medicare tax for high earners', () => {
      const result = calculateSelfEmploymentTax(250000, 'single', 2024);

      // 92.35% of $250,000 = $230,875
      // SS: min($230,875, $168,600) * 12.4% = $20,906.40
      // Medicare: $230,875 * 2.9% = $6,695.38
      // Additional Medicare: ($230,875 - $200,000) * 0.9% = $277.88
      // Total: ~$27,879.65
      expect(result.seTax).toBeCloseTo(27879.65, 0);
      expect(result.deductibleAmount).toBeCloseTo(result.seTax * 0.5, 0);
    });

    it('should cap Social Security tax at wage base', () => {
      const result = calculateSelfEmploymentTax(300000, 'single', 2024);

      // SS tax should be capped at $168,600 wage base
      // $168,600 * 12.4% = $20,906.40
      // But Medicare tax applies to all income

      const seIncome = 300000 * 0.9235;
      const expectedMedicare = seIncome * 0.029;
      const expectedAdditionalMedicare = (seIncome - 200000) * 0.009;

      expect(result.seTax).toBeGreaterThan(20906); // More than just SS
    });

    it('should return 0 for zero income', () => {
      const result = calculateSelfEmploymentTax(0, 'single', 2024);
      expect(result.seTax).toBe(0);
      expect(result.deductibleAmount).toBe(0);
    });

    it('should return 0 for negative income', () => {
      const result = calculateSelfEmploymentTax(-5000, 'single', 2024);
      expect(result.seTax).toBe(0);
      expect(result.deductibleAmount).toBe(0);
    });
  });

  describe('calculateEarnedIncomeCredit', () => {
    it('should calculate EIC for single filer with no children', () => {
      const credit = calculateEarnedIncomeCredit(12000, 12000, 0, 'single', 2024);

      // Phase-in rate for 0 children: 7.65%
      // Max credit: $632
      // $12,000 * 7.65% = $918, but max is $632
      // Phase-out starts at $9,800 for single with 0 children
      // ($12,000 - $9,800) * 7.65% = $168.30 reduction
      // $632 - $168.30 = $463.70
      expect(credit).toBeCloseTo(463.7, 0);
    });

    it('should calculate EIC for single filer with 1 child', () => {
      const credit = calculateEarnedIncomeCredit(25000, 25000, 1, 'single', 2024);

      // Phase-in rate for 1 child: 34%
      // Max credit: $4,213
      // $25,000 * 34% = $8,500, but limited to max
      // Then phase-out applies above $24,210
      expect(credit).toBeGreaterThan(0);
      expect(credit).toBeLessThanOrEqual(4213);
    });

    it('should calculate EIC for married couple with 2 children', () => {
      const credit = calculateEarnedIncomeCredit(35000, 35000, 2, 'married-joint', 2024);

      // Max credit for 2 children: $6,960
      expect(credit).toBeGreaterThan(0);
      expect(credit).toBeLessThanOrEqual(6960);
    });

    it('should phase out EIC at high income', () => {
      const credit = calculateEarnedIncomeCredit(60000, 60000, 2, 'single', 2024);

      // Income exceeds limit for 2 children ($54,884 for single)
      expect(credit).toBe(0);
    });

    it('should return 0 for high earners', () => {
      const credit = calculateEarnedIncomeCredit(100000, 100000, 3, 'single', 2024);
      expect(credit).toBe(0);
    });
  });

  describe('calculateChildTaxCredit', () => {
    it('should calculate full credit for one child', () => {
      const credit = calculateChildTaxCredit(1, 100000, 'single', 2024);
      expect(credit).toBe(2000);
    });

    it('should calculate full credit for multiple children', () => {
      const credit = calculateChildTaxCredit(3, 150000, 'single', 2024);
      expect(credit).toBe(6000); // $2,000 * 3
    });

    it('should phase out credit for high earners (single)', () => {
      const credit = calculateChildTaxCredit(1, 250000, 'single', 2024);

      // Phase out starts at $200,000
      // $250,000 - $200,000 = $50,000 over
      // $50 per $1,000 = 50 * $50 = $2,500 reduction
      // $2,000 - $2,500 = $0 (can't go negative)
      expect(credit).toBe(0);
    });

    it('should phase out credit for high earners (married)', () => {
      const credit = calculateChildTaxCredit(2, 450000, 'married-joint', 2024);

      // Phase out starts at $400,000 for married
      // $450,000 - $400,000 = $50,000 over
      // 50 * $50 = $2,500 reduction
      // $4,000 - $2,500 = $1,500
      expect(credit).toBe(1500);
    });

    it('should return 0 for no children', () => {
      const credit = calculateChildTaxCredit(0, 50000, 'single', 2024);
      expect(credit).toBe(0);
    });
  });

  describe('calculateAdditionalChildTaxCredit', () => {
    it('should calculate additional CTC based on earned income', () => {
      const credit = calculateAdditionalChildTaxCredit(2, 20000, 2000, 2024);

      // ($20,000 - $2,500) * 15% = $2,625
      // Limited to unused CTC of $2,000
      expect(credit).toBe(2000);
    });

    it('should limit to max refundable per child', () => {
      const credit = calculateAdditionalChildTaxCredit(3, 100000, 5000, 2024);

      // Max: 3 * $1,800 = $5,400 or ($100,000 - $2,500) * 15% = $14,625
      // Lesser is $5,400, but limited to unused CTC of $5,000
      expect(credit).toBe(5000);
    });

    it('should return 0 for low earned income', () => {
      const credit = calculateAdditionalChildTaxCredit(1, 2000, 2000, 2024);

      // ($2,000 - $2,500) * 15% = $0 (negative)
      expect(credit).toBe(0);
    });
  });

  describe('calculateChildCareCredit', () => {
    it('should calculate credit for one child at max rate', () => {
      const credit = calculateChildCareCredit(3000, 1, 10000, 2024);

      // $3,000 * 35% = $1,050
      expect(credit).toBe(1050);
    });

    it('should calculate credit for two children', () => {
      const credit = calculateChildCareCredit(6000, 2, 10000, 2024);

      // $6,000 * 35% = $2,100
      expect(credit).toBe(2100);
    });

    it('should cap expenses at maximum', () => {
      const credit = calculateChildCareCredit(5000, 1, 10000, 2024);

      // Max for 1 child is $3,000
      // $3,000 * 35% = $1,050
      expect(credit).toBe(1050);
    });

    it('should reduce rate for higher AGI', () => {
      const credit = calculateChildCareCredit(3000, 1, 50000, 2024);

      // AGI $50,000: ($50,000 - $15,000) / $2,000 = 17.5 steps
      // 35% - 17% = 18%, but min is 20%
      // $3,000 * 20% = $600
      expect(credit).toBe(600);
    });

    it('should return 0 for no expenses', () => {
      const credit = calculateChildCareCredit(0, 1, 30000, 2024);
      expect(credit).toBe(0);
    });

    it('should return 0 for no dependents', () => {
      const credit = calculateChildCareCredit(3000, 0, 30000, 2024);
      expect(credit).toBe(0);
    });
  });

  describe('calculateAmericanOpportunityCredit', () => {
    it('should calculate full credit for moderate expenses', () => {
      const credit = calculateAmericanOpportunityCredit(4000, 50000, 'single', 2024);

      // 100% of first $2,000 + 25% of next $2,000
      // $2,000 + $500 = $2,500
      expect(credit).toBe(2500);
    });

    it('should calculate partial credit for low expenses', () => {
      const credit = calculateAmericanOpportunityCredit(1000, 50000, 'single', 2024);

      // 100% of $1,000 = $1,000
      expect(credit).toBe(1000);
    });

    it('should cap at maximum credit', () => {
      const credit = calculateAmericanOpportunityCredit(10000, 50000, 'single', 2024);

      // Max credit is $2,500
      expect(credit).toBe(2500);
    });

    it('should phase out for high earners (single)', () => {
      const credit = calculateAmericanOpportunityCredit(4000, 85000, 'single', 2024);

      // Phase out between $80k-$90k
      // $85,000 is 50% through range
      // $2,500 * 50% = $1,250
      expect(credit).toBe(1250);
    });

    it('should return 0 above phase-out threshold', () => {
      const credit = calculateAmericanOpportunityCredit(4000, 100000, 'single', 2024);
      expect(credit).toBe(0);
    });

    it('should phase out for married couples', () => {
      const credit = calculateAmericanOpportunityCredit(4000, 170000, 'married-joint', 2024);

      // Phase out between $160k-$180k
      // $170,000 is 50% through range
      expect(credit).toBe(1250);
    });
  });

  describe('calculateLifetimeLearningCredit', () => {
    it('should calculate credit for moderate expenses', () => {
      const credit = calculateLifetimeLearningCredit(5000, 50000, 'single', 2024);

      // 20% of $5,000 = $1,000
      expect(credit).toBe(1000);
    });

    it('should cap at maximum credit', () => {
      const credit = calculateLifetimeLearningCredit(15000, 50000, 'single', 2024);

      // 20% of $10,000 (max) = $2,000
      expect(credit).toBe(2000);
    });

    it('should phase out for high earners', () => {
      const credit = calculateLifetimeLearningCredit(10000, 85000, 'single', 2024);

      // Phase out between $80k-$90k
      // $85,000 is 50% through range
      // $2,000 * 50% = $1,000
      expect(credit).toBe(1000);
    });

    it('should return 0 above phase-out threshold', () => {
      const credit = calculateLifetimeLearningCredit(10000, 100000, 'single', 2024);
      expect(credit).toBe(0);
    });
  });

  describe('calculateAMT', () => {
    it('should calculate AMT for moderate income', () => {
      const amt = calculateAMT(100000, 20000, 'single', 2024);

      // AMTI = $100,000 + SALT add-back
      // After exemption, taxed at 26%
      expect(amt).toBeGreaterThan(0);
    });

    it('should calculate AMT for high income with itemized deductions', () => {
      const amt = calculateAMT(300000, 50000, 'single', 2024);

      // High income should trigger AMT
      expect(amt).toBeGreaterThan(50000);
    });

    it('should calculate AMT for married couples', () => {
      const amt = calculateAMT(200000, 30000, 'married-joint', 2024);

      // Higher exemption for married couples
      expect(amt).toBeGreaterThan(0);
    });

    it('should phase out exemption for very high income', () => {
      const amt = calculateAMT(700000, 40000, 'single', 2024);

      // Exemption phases out above $609,350 for single filers
      expect(amt).toBeGreaterThan(100000);
    });
  });
});
