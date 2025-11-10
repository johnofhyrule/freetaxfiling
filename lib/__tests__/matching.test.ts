import {
  matchPartnersToUser,
  getTopMatches,
  getEligibleMatches,
  getIneligibleMatches,
} from '../matching';
import { Partner, UserProfile } from '../types';

describe('Partner Matching Algorithm', () => {
  // Test partner fixtures
  const createBasicPartner = (overrides: Partial<Partner> = {}): Partner => ({
    id: 'test-partner',
    name: 'Test Partner',
    url: 'https://example.com',
    maxAGI: 79000,
    supportedForms: {
      federal: ['1040'],
      state: true,
      schedules: ['A', 'B', 'C'],
    },
    features: {
      priorYearReturns: true,
      importW2: true,
      liveSupport: true,
      mobileApp: true,
      spanishLanguage: true,
    },
    description: 'Test partner',
    highlights: ['Easy to use'],
    ...overrides,
  });

  // Test user profile fixture
  const createBasicUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    agi: 50000,
    age: 30,
    state: 'CA',
    needsStateTaxReturn: true,
    filingStatus: 'single',
    hasSchedules: ['A'],
    needsPriorYearReturn: false,
    isMilitary: false,
    isStudent: false,
    hasDisability: false,
    preferSpanish: false,
    wantsLiveSupport: false,
    wantsMobileApp: false,
    ...overrides,
  });

  describe('AGI Requirements', () => {
    it('should match partner when AGI is below limit', () => {
      const partner = createBasicPartner({ maxAGI: 79000 });
      const user = createBasicUser({ agi: 50000 });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(true);
      expect(matches[0].score).toBe(100);
      expect(matches[0].reasons.eligible).toContain('Within AGI limit ($79,000)');
    });

    it('should disqualify partner when AGI exceeds limit', () => {
      const partner = createBasicPartner({ maxAGI: 79000 });
      const user = createBasicUser({ agi: 80000 });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(false);
      expect(matches[0].reasons.disqualified).toContain(
        'AGI of $80,000 exceeds limit of $79,000'
      );
    });

    it('should deduct points when AGI is close to limit', () => {
      const partner = createBasicPartner({ maxAGI: 79000 });
      const user = createBasicUser({ agi: 75000 }); // ~95% of limit

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(true);
      expect(matches[0].score).toBeLessThan(100);
      expect(matches[0].reasons.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Age Requirements', () => {
    it('should match when age is within range', () => {
      const partner = createBasicPartner({ minAge: 18, maxAge: 65 });
      const user = createBasicUser({ age: 30 });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(true);
      expect(matches[0].reasons.eligible).toContain('Meets age requirements');
    });

    it('should disqualify when age is below minimum', () => {
      const partner = createBasicPartner({ minAge: 18 });
      const user = createBasicUser({ age: 16 });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(false);
      expect(matches[0].reasons.disqualified).toContain(
        'Minimum age requirement is 18, you are 16'
      );
    });

    it('should disqualify when age exceeds maximum', () => {
      const partner = createBasicPartner({ maxAge: 50 });
      const user = createBasicUser({ age: 55 });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(false);
      expect(matches[0].reasons.disqualified).toContain(
        'Maximum age limit is 50, you are 55'
      );
    });
  });

  describe('Military Requirements', () => {
    it('should match military users to military-only partners', () => {
      const partner = createBasicPartner({ militaryOnly: true });
      const user = createBasicUser({ isMilitary: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(true);
      expect(matches[0].reasons.eligible).toContain('Military-only option (you qualify)');
    });

    it('should disqualify non-military users from military-only partners', () => {
      const partner = createBasicPartner({ militaryOnly: true });
      const user = createBasicUser({ isMilitary: false });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(false);
      expect(matches[0].reasons.disqualified).toContain(
        'This option is only available to military members'
      );
    });
  });

  describe('State Restrictions', () => {
    it('should match when state is in include list', () => {
      const partner = createBasicPartner({
        stateRestrictions: {
          type: 'include',
          states: ['CA', 'NY', 'TX'],
        },
      });
      const user = createBasicUser({ state: 'CA' });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(true);
      expect(matches[0].reasons.eligible).toContain('Available in CA');
    });

    it('should disqualify when state is not in include list', () => {
      const partner = createBasicPartner({
        stateRestrictions: {
          type: 'include',
          states: ['NY', 'TX'],
        },
      });
      const user = createBasicUser({ state: 'CA' });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(false);
      expect(matches[0].reasons.disqualified).toContain('Not available in CA');
    });

    it('should match when state is not in exclude list', () => {
      const partner = createBasicPartner({
        stateRestrictions: {
          type: 'exclude',
          states: ['NY', 'TX'],
        },
      });
      const user = createBasicUser({ state: 'CA' });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(true);
      expect(matches[0].reasons.eligible).toContain('Available in CA');
    });

    it('should disqualify when state is in exclude list', () => {
      const partner = createBasicPartner({
        stateRestrictions: {
          type: 'exclude',
          states: ['CA', 'TX'],
        },
      });
      const user = createBasicUser({ state: 'CA' });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].isEligible).toBe(false);
      expect(matches[0].reasons.disqualified).toContain('Not available in CA');
    });
  });

  describe('State Tax Return Support', () => {
    it('should not penalize when state return not needed', () => {
      const partner = createBasicPartner({
        supportedForms: {
          federal: ['1040'],
          state: false,
          schedules: ['A'],
        },
      });
      const user = createBasicUser({ needsStateTaxReturn: false });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(100);
    });

    it('should deduct points when state return needed but not supported', () => {
      const partner = createBasicPartner({
        supportedForms: {
          federal: ['1040'],
          state: false,
          schedules: ['A'],
        },
      });
      const user = createBasicUser({ needsStateTaxReturn: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(80); // 100 - 20 points
      expect(matches[0].reasons.warnings).toContain('Does not support state returns');
    });

    it('should not deduct when state return supported', () => {
      const partner = createBasicPartner({
        supportedForms: {
          federal: ['1040'],
          state: true,
          schedules: ['A'],
        },
      });
      const user = createBasicUser({ needsStateTaxReturn: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(100);
      expect(matches[0].reasons.eligible).toContain('Supports state returns');
    });
  });

  describe('Schedule Support', () => {
    it('should match when all schedules are supported', () => {
      const partner = createBasicPartner({
        supportedForms: {
          federal: ['1040'],
          state: true,
          schedules: ['A', 'B', 'C', 'D'],
        },
      });
      const user = createBasicUser({ hasSchedules: ['A', 'C'] });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(100);
      expect(matches[0].reasons.eligible).toContain('Supports all needed tax schedules');
    });

    it('should deduct points for unsupported schedules', () => {
      const partner = createBasicPartner({
        supportedForms: {
          federal: ['1040'],
          state: true,
          schedules: ['A', 'B'],
        },
      });
      const user = createBasicUser({ hasSchedules: ['A', 'C', 'D'] });

      const matches = matchPartnersToUser([partner], user);

      // Should deduct 8 points per missing schedule (C and D)
      expect(matches[0].score).toBe(84); // 100 - 16
      expect(matches[0].reasons.warnings[0]).toContain('May not support');
    });
  });

  describe('Prior Year Returns', () => {
    it('should deduct points when prior year needed but not supported', () => {
      const partner = createBasicPartner({
        features: {
          priorYearReturns: false,
          importW2: true,
          liveSupport: true,
          mobileApp: true,
          spanishLanguage: true,
        },
      });
      const user = createBasicUser({ needsPriorYearReturn: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(85); // 100 - 15 points
      expect(matches[0].reasons.warnings).toContain('Does not support prior year returns');
    });

    it('should not deduct when prior year supported', () => {
      const partner = createBasicPartner({
        features: {
          priorYearReturns: true,
          importW2: true,
          liveSupport: true,
          mobileApp: true,
          spanishLanguage: true,
        },
      });
      const user = createBasicUser({ needsPriorYearReturn: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(100);
      expect(matches[0].reasons.eligible).toContain('Supports prior year returns');
    });
  });

  describe('Special Eligibility Features', () => {
    it('should give bonus for military-friendly features', () => {
      const partner1 = createBasicPartner({
        specialEligibility: { military: true },
      });
      const partner2 = createBasicPartner({
        specialEligibility: undefined,
      });
      const user = createBasicUser({ isMilitary: true });

      const matches = matchPartnersToUser([partner1, partner2], user);

      expect(matches[0].score).toBeGreaterThan(matches[1].score);
      expect(matches[0].reasons.eligible).toContain('Military-friendly features');
    });

    it('should give bonus for student features', () => {
      const partner1 = createBasicPartner({
        specialEligibility: { students: true },
      });
      const partner2 = createBasicPartner({
        specialEligibility: undefined,
      });
      const user = createBasicUser({ isStudent: true });

      const matches = matchPartnersToUser([partner1, partner2], user);

      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    });

    it('should give bonus for disability support', () => {
      const partner1 = createBasicPartner({
        specialEligibility: { disabilities: true },
      });
      const partner2 = createBasicPartner({
        specialEligibility: undefined,
      });
      const user = createBasicUser({ hasDisability: true });

      const matches = matchPartnersToUser([partner1, partner2], user);

      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    });

    it('should give bonus for senior citizen features', () => {
      const partner1 = createBasicPartner({
        specialEligibility: { seniorCitizens: true },
      });
      const partner2 = createBasicPartner({
        specialEligibility: undefined,
      });
      const user = createBasicUser({ age: 65 });

      const matches = matchPartnersToUser([partner1, partner2], user);

      expect(matches[0].score).toBeGreaterThan(matches[1].score);
      expect(matches[0].reasons.eligible).toContain('Senior citizen features');
    });
  });

  describe('Language and Support Preferences', () => {
    it('should deduct points when Spanish needed but not available', () => {
      const partner = createBasicPartner({
        features: {
          priorYearReturns: true,
          importW2: true,
          liveSupport: true,
          mobileApp: true,
          spanishLanguage: false,
        },
      });
      const user = createBasicUser({ preferSpanish: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(90); // 100 - 10 points
      expect(matches[0].reasons.warnings).toContain('No Spanish language support');
    });

    it('should deduct points when live support wanted but not available', () => {
      const partner = createBasicPartner({
        features: {
          priorYearReturns: true,
          importW2: true,
          liveSupport: false,
          mobileApp: true,
          spanishLanguage: true,
        },
      });
      const user = createBasicUser({ wantsLiveSupport: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(92); // 100 - 8 points
      expect(matches[0].reasons.warnings).toContain('No live support');
    });

    it('should deduct points when mobile app wanted but not available', () => {
      const partner = createBasicPartner({
        features: {
          priorYearReturns: true,
          importW2: true,
          liveSupport: true,
          mobileApp: false,
          spanishLanguage: true,
        },
      });
      const user = createBasicUser({ wantsMobileApp: true });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBe(95); // 100 - 5 points
      expect(matches[0].reasons.warnings).toContain('No mobile app');
    });
  });

  describe('Sorting and Ranking', () => {
    it('should sort eligible partners above ineligible ones', () => {
      const eligiblePartner = createBasicPartner({
        id: 'eligible',
        maxAGI: 79000,
      });
      const ineligiblePartner = createBasicPartner({
        id: 'ineligible',
        maxAGI: 30000,
      });
      const user = createBasicUser({ agi: 50000 });

      const matches = matchPartnersToUser([ineligiblePartner, eligiblePartner], user);

      expect(matches[0].partner.id).toBe('eligible');
      expect(matches[1].partner.id).toBe('ineligible');
    });

    it('should sort by score within eligible partners', () => {
      const partner1 = createBasicPartner({
        id: 'partner1',
        features: {
          priorYearReturns: true,
          importW2: true,
          liveSupport: true,
          mobileApp: true,
          spanishLanguage: true,
        },
      });
      const partner2 = createBasicPartner({
        id: 'partner2',
        features: {
          priorYearReturns: false,
          importW2: false,
          liveSupport: false,
          mobileApp: false,
          spanishLanguage: false,
        },
      });
      const user = createBasicUser({
        preferSpanish: true,
        wantsLiveSupport: true,
        wantsMobileApp: true,
      });

      const matches = matchPartnersToUser([partner2, partner1], user);

      expect(matches[0].partner.id).toBe('partner1');
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    });
  });

  describe('Helper Functions', () => {
    const eligiblePartner1 = createBasicPartner({ id: 'eligible1', maxAGI: 79000 });
    const eligiblePartner2 = createBasicPartner({ id: 'eligible2', maxAGI: 85000 });
    const ineligiblePartner = createBasicPartner({ id: 'ineligible', maxAGI: 30000 });
    const user = createBasicUser({ agi: 50000 });

    describe('getTopMatches', () => {
      it('should return top N eligible matches', () => {
        const matches = matchPartnersToUser(
          [eligiblePartner1, eligiblePartner2, ineligiblePartner],
          user
        );
        const topMatches = getTopMatches(matches, 2);

        expect(topMatches).toHaveLength(2);
        expect(topMatches[0].isEligible).toBe(true);
        expect(topMatches[1].isEligible).toBe(true);
      });

      it('should default to top 3 matches', () => {
        const partners = [
          createBasicPartner({ id: '1', maxAGI: 79000 }),
          createBasicPartner({ id: '2', maxAGI: 79000 }),
          createBasicPartner({ id: '3', maxAGI: 79000 }),
          createBasicPartner({ id: '4', maxAGI: 79000 }),
        ];
        const matches = matchPartnersToUser(partners, user);
        const topMatches = getTopMatches(matches);

        expect(topMatches).toHaveLength(3);
      });
    });

    describe('getEligibleMatches', () => {
      it('should return only eligible matches', () => {
        const matches = matchPartnersToUser(
          [eligiblePartner1, eligiblePartner2, ineligiblePartner],
          user
        );
        const eligible = getEligibleMatches(matches);

        expect(eligible).toHaveLength(2);
        expect(eligible.every((m) => m.isEligible)).toBe(true);
      });
    });

    describe('getIneligibleMatches', () => {
      it('should return only ineligible matches', () => {
        const matches = matchPartnersToUser(
          [eligiblePartner1, eligiblePartner2, ineligiblePartner],
          user
        );
        const ineligible = getIneligibleMatches(matches);

        expect(ineligible).toHaveLength(1);
        expect(ineligible[0].isEligible).toBe(false);
        expect(ineligible[0].partner.id).toBe('ineligible');
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple deductions correctly', () => {
      const partner = createBasicPartner({
        supportedForms: {
          federal: ['1040'],
          state: false,
          schedules: ['A'],
        },
        features: {
          priorYearReturns: false,
          importW2: false,
          liveSupport: false,
          mobileApp: false,
          spanishLanguage: false,
        },
      });
      const user = createBasicUser({
        needsStateTaxReturn: true, // -20
        hasSchedules: ['C', 'D'], // -16 (8 each)
        needsPriorYearReturn: true, // -15
        preferSpanish: true, // -10
        wantsLiveSupport: true, // -8
        wantsMobileApp: true, // -5
      });

      const matches = matchPartnersToUser([partner], user);

      // Total deductions: 20 + 16 + 15 + 10 + 8 + 5 = 74
      expect(matches[0].score).toBe(26);
      expect(matches[0].isEligible).toBe(true);
    });

    it('should not let score go below 0', () => {
      const partner = createBasicPartner({
        supportedForms: {
          federal: ['1040'],
          state: false,
          schedules: [],
        },
        features: {
          priorYearReturns: false,
          importW2: false,
          liveSupport: false,
          mobileApp: false,
          spanishLanguage: false,
        },
      });
      const user = createBasicUser({
        needsStateTaxReturn: true,
        hasSchedules: ['A', 'B', 'C', 'D', 'E'],
        needsPriorYearReturn: true,
        preferSpanish: true,
        wantsLiveSupport: true,
        wantsMobileApp: true,
      });

      const matches = matchPartnersToUser([partner], user);

      expect(matches[0].score).toBeGreaterThanOrEqual(0);
      expect(matches[0].score).toBeLessThanOrEqual(100);
    });
  });
});
