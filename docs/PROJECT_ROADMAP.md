# Free Tax Filing Platform - Project Roadmap

## Vision
Create a comprehensive ecosystem of free tax filing tools that empowers taxpayers and advocates for permanent free filing solutions.

## Product Suite

### 1. Free File Navigator ✅ **COMPLETED**
**Status:** Live in production
**Purpose:** Help taxpayers find and compare IRS Free File partners
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS
**Key Features:**
- Partner matching algorithm (deductive 100→0 scoring)
- Eligibility questionnaire
- Comparison table with 8 Free File partners
- Mobile-responsive Basecamp-inspired design

**Live URL:** localhost:3001 (dev)

---

### 2. Tax Preparation Assistant 📋 **PLANNED**
**Status:** Not started
**Purpose:** Client-side tax preparation tool with PDF generation for mail filing
**Tech Stack:** Next.js 14, TypeScript, PDF-lib/jsPDF, localStorage
**Key Features:**
- Interview-style tax form completion (1040, schedules A-SE)
- Client-side data storage (privacy-first)
- PDF generation for printing and mailing
- Step-by-step guidance for common tax situations
- Import W-2 data via manual entry or photo

**No e-filing capability** - Users mail completed forms to IRS

**Target Users:**
- Income > $79,000 (above Free File limits)
- Complex tax situations
- Privacy-conscious filers
- Prior year returns

**Estimated Timeline:** 8-12 weeks
**Priority:** High (fills gap for users above Free File income limits)

---

### 3. State Filing Solution 🏛️ **PLANNED**
**Status:** Not started
**Purpose:** Multi-state e-filing platform partnering with state governments
**Tech Stack:** Next.js 14, TypeScript, PostgreSQL, Stripe, Multi-tenant SaaS
**Key Features:**
- E-file state returns for participating states
- Partner with state governments (B2G model)
- State-specific form logic and calculations
- Multi-tenant architecture (white-label for states)
- Federal + state combo filing
- Audit support and amendment filing

**Revenue Model:** B2G partnerships with state governments

**Target Users:**
- State governments seeking free filing solutions
- Taxpayers in participating states
- Users needing state-only filing

**Estimated Timeline:** 6-12 months (requires government partnerships)
**Priority:** Medium (long-term strategic play)

---

### 4. Advocacy Platform 📢 **PLANNED**
**Status:** Not started
**Purpose:** Grassroots advocacy to restore Direct File and support free filing legislation
**Tech Stack:** Next.js 14, TypeScript, PostgreSQL, PWA, Email/SMS APIs
**Key Features:**
- Find and contact elected representatives
- Pre-written advocacy templates (emails, calls, tweets)
- Campaign tracking and impact metrics
- Community forums and success stories
- Activism purple (#7c3aed) brand color
- Mobile-first PWA

**Target Users:**
- Free filing advocates
- Taxpayers frustrated with paid filing
- Policy advocates and nonprofits

**Estimated Timeline:** 6-8 weeks
**Priority:** Medium (complements other products, builds community)

---

## Product Integration Strategy

### Shared Components
- Design system (Trust blue, Action orange, Success green, Activism purple)
- Basecamp-inspired UI patterns
- Mobile-first responsive layouts
- Accessibility (WCAG 2.1 AA)
- Inter font family

### Cross-Product User Flows
1. **Free File Navigator → Tax Prep Assistant**
   - If user's AGI > $79,000, recommend Tax Prep Assistant
   - "Your income exceeds Free File limits. Try our Tax Preparation Assistant instead."

2. **Tax Prep Assistant → State Filing Solution**
   - After federal return complete, offer state e-filing if available
   - "Your state offers free e-filing. File your state return now."

3. **Free File Navigator → Advocacy Platform**
   - If no eligible partners found, offer advocacy signup
   - "Frustrated with limited options? Join the movement for permanent free filing."

4. **All Products → Advocacy Platform**
   - Footer CTAs: "Support free filing legislation"
   - Post-filing surveys: "Help us make filing free for everyone"

---

## Technical Architecture

### Monorepo Structure (Proposed)
```
/freetaxfiling
├── apps/
│   ├── navigator/        # Free File Navigator (current app/)
│   ├── tax-prep/         # Tax Preparation Assistant
│   ├── state-filing/     # State Filing Solution
│   └── advocacy/         # Advocacy Platform
├── packages/
│   ├── ui/              # Shared UI components
│   ├── design-system/   # Tailwind config, theme
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities
├── docs/
│   ├── prds/           # Product requirements
│   └── architecture/   # Technical docs
└── package.json        # Turborepo/workspace config
```

### Shared Infrastructure
- **Design System:** Tailwind CSS v4 with shared theme
- **Database:** PostgreSQL (for State Filing + Advocacy)
- **Auth:** NextAuth.js (for State Filing + Advocacy)
- **Deployment:** Vercel (all products)
- **Analytics:** Privacy-focused (Plausible or similar)

---

## Development Phases

### Phase 1: Foundation ✅ **COMPLETE**
- [x] Free File Navigator MVP
- [x] Landing page with FAQ
- [x] Eligibility checker
- [x] Partner matching algorithm
- [x] Results and comparison

### Phase 2: Tax Prep Assistant (Next)
**Timeline:** Q1 2025
- [ ] Interview-style form flow
- [ ] Form 1040 implementation
- [ ] Schedule A, C, D, E implementation
- [ ] PDF generation
- [ ] localStorage data management
- [ ] Privacy policy and data handling
- [ ] Help/guidance system

### Phase 3: Advocacy Platform
**Timeline:** Q2 2025
- [ ] Representative lookup (OpenStates/ProPublica API)
- [ ] Contact form templates
- [ ] Campaign tracking
- [ ] Community features
- [ ] PWA implementation
- [ ] SMS/email integration

### Phase 4: State Filing Solution
**Timeline:** Q3-Q4 2025
- [ ] Multi-tenant architecture
- [ ] State partnership framework
- [ ] State-specific form logic (pilot with 2-3 states)
- [ ] E-filing integration
- [ ] Payment processing (Stripe)
- [ ] Admin dashboard for states

---

## Success Metrics

### Free File Navigator
- Users matched to partners: 10,000+ in first tax season
- Successful conversions to partner sites: 30%+
- Mobile usage: 60%+

### Tax Preparation Assistant
- Completed returns: 5,000+ in first tax season
- Return accuracy: 95%+
- User satisfaction: 4.5/5 stars

### State Filing Solution
- State partnerships: 5+ states by end of Year 1
- E-filed returns: 50,000+ across all states
- State government satisfaction: 4.5/5

### Advocacy Platform
- Active advocates: 25,000+
- Letters sent to representatives: 100,000+
- Policy wins: Support for 2+ pieces of legislation

---

## Notes

**Current Status:** Free File Navigator is complete and running on localhost:3001

**Next Steps:** Decide which product to build next:
1. Tax Preparation Assistant (high priority, fills income gap)
2. Advocacy Platform (medium priority, builds community)
3. State Filing Solution (long-term, requires partnerships)

**Design Philosophy:** Basecamp-inspired simplicity - opinionated, clear, no dark patterns
**Privacy Commitment:** Minimal data collection, client-side storage where possible
**Accessibility:** WCAG 2.1 AA compliance across all products
