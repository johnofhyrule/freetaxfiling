# Development Handoff Notes

**Last Updated:** 2025-11-10
**Current Status:** Tax Prep Assistant (PRD 2) - 100% Complete | Document Upload/OCR - Complete ✅
**Dev Server:** Running on localhost:3001

---

## ✅ Completed Work

### 1. Free File Navigator (PRD 1) - COMPLETE ✅
- Landing page with collapsible FAQ (Basecamp-style)
- Eligibility checker with 8 form fields
- Partner matching algorithm (deductive 100→0 scoring)
- Results page with 8 Free File partners
- All features working and ready for production

### 2. Tax Preparation Assistant (PRD 2) - COMPLETE ✅
**Feature-flagged:** `NEXT_PUBLIC_FEATURE_TAX_PREP=true` in `.env.local`

**Interview Flow (12 pages):**
1. `/tax-prep/start` - Tax year & filing status selection
2. `/tax-prep/interview/basic-info` - Personal information, address
3. `/tax-prep/interview/dependents` - Add dependents with Child Tax Credit auto-calc
4. `/tax-prep/interview/w2-income` - W-2 forms with all boxes
5. `/tax-prep/interview/1099-income` - 1099-INT, DIV, B, MISC (tabbed interface) ✨ NEW
6. `/tax-prep/interview/self-employment` - Schedule C business income/expenses ✨ NEW
7. `/tax-prep/interview/rental-income` - Schedule E rental property income ✨ NEW
8. `/tax-prep/interview/deductions` - Standard vs itemized with smart recommendations
9. `/tax-prep/interview/adjustments` - Schedule 1 adjustments to income ✨ NEW
10. `/tax-prep/interview/credits` - Tax credits (child, education, child care)
11. `/tax-prep/interview/payments` - Withholding, estimated payments
12. `/tax-prep/interview/bank-info` - Direct deposit setup ✨ NEW
13. `/tax-prep/interview/review` - Complete tax calculation and summary
14. `/tax-prep/download` - PDF generation and download

**Features:**
- ✅ Full tax calculation with 2024 tax brackets (single filers)
- ✅ All 1099 income types (INT, DIV, B, MISC)
- ✅ Self-employment income (Schedule C)
- ✅ Rental income (Schedule E)
- ✅ Adjustments to income (Schedule 1)
- ✅ Direct deposit/bank info setup
- ✅ localStorage persistence (auto-save)
- ✅ Progress bar tracking
- ✅ Smart recommendations (itemized vs standard, SALT cap warnings)
- ✅ PDF generation using pdf-lib with signature fields
- ✅ Automatic page overflow (creates page 2 if needed)
- ✅ Download and preview PDF functionality

---

## 📂 Project Structure

```
/freetaxfiling
├── app/
│   ├── page.tsx                    # Landing page (Free File Navigator)
│   ├── eligibility/page.tsx        # Eligibility form
│   ├── results/page.tsx            # Partner results
│   └── tax-prep/                   # Tax Prep Assistant (feature flagged)
│       ├── page.tsx                # Tax Prep landing
│       ├── start/page.tsx          # Start tax return
│       ├── download/page.tsx       # PDF download
│       └── interview/
│           ├── layout.tsx          # Interview layout with progress bar
│           ├── basic-info/         # Personal info
│           ├── dependents/         # Dependents & credits
│           ├── w2-income/          # W-2 wage forms
│           ├── 1099-income/        # 1099-INT, DIV, B, MISC (NEW)
│           ├── self-employment/    # Schedule C (NEW)
│           ├── rental-income/      # Schedule E (NEW)
│           ├── deductions/         # Standard/itemized
│           ├── adjustments/        # Schedule 1 (NEW)
│           ├── credits/            # Tax credits
│           ├── payments/           # Withholding & payments
│           ├── bank-info/          # Direct deposit (NEW)
│           └── review/             # Final review & calculation
├── lib/
│   ├── feature-flags.ts            # Feature flag configuration
│   ├── matching.ts                 # Free File partner matching
│   ├── types.ts                    # Partner types
│   ├── schemas.ts                  # Zod validation schemas
│   ├── data/partners.ts            # 8 Free File partners data
│   └── tax-prep/
│       ├── types.ts                # Form 1040 types (all schedules)
│       ├── storage.ts              # localStorage management
│       └── pdf-generator.ts        # PDF generation with signatures
├── docs/
│   ├── PROJECT_ROADMAP.md          # All 4 PRDs roadmap
│   └── HANDOFF.md                  # This file
└── .env.local                      # Feature flags (gitignored)
```

---

## 🔧 Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with `@theme` inline syntax
- **Forms:** React Hook Form + Zod validation
- **PDF:** pdf-lib
- **Storage:** localStorage (client-side only, privacy-first)
- **Node:** v20.19.5 (required for Next.js 16)

**Dependencies:**
```json
{
  "next": "16.0.1",
  "react": "^19.0.0",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "pdf-lib": "^1.17.1"
}
```

**To Add for Next Phase:**
- `tesseract.js` - Client-side OCR for document upload

---

## 🎨 Design System

**Brand Colors:**
- Trust Blue: `#1d4ed8` (primary)
- Action Orange: `#ea580c` (secondary)
- Success Green: `#059669` (success)
- Activism Purple: `#7c3aed` (advocacy - future)

**Design Philosophy:** Basecamp-inspired simplicity - opinionated, clear, no dark patterns

**Key Classes:**
- `text-primary` → Trust blue
- `text-secondary` → Action orange
- `text-success` → Success green
- `bg-primary`, `bg-secondary`, `bg-success` → Background colors

---

## 🚀 Running the Project

```bash
# Use Node 20
nvm use 20

# Install dependencies
npm install

# Run dev server (port 3001)
npm run dev
```

**Access:**
- Free File Navigator: http://localhost:3001
- Tax Prep Assistant: http://localhost:3001/tax-prep (feature flagged)

---

## 🎯 Next Steps - PRIORITY ORDER

### ✅ **Priority 1: Document Upload/OCR - COMPLETED**
**Impact: HIGH** | **Effort: MEDIUM** | **Status: Done**

**What was built:**
1. ✅ Installed `tesseract.js` for client-side OCR
2. ✅ Added upload UI to W-2 income page with image preview
3. ✅ Client-side image processing (privacy-first approach)
4. ✅ Created W-2 parser with enhanced regex patterns
5. ✅ Auto-fill all W-2 form fields with extracted data
6. ✅ User review/edit capability with helpful feedback
7. ✅ Created and integrated parsers for 1099 forms (INT, DIV, MISC) - fully functional
8. ✅ Improved OCR accuracy with error correction for common mistakes
9. ✅ Added user feedback, tooltips, and time-saving indicators
10. ✅ Integrated OCR upload UI into all 1099 form types (INT, DIV, MISC)

**Files Created:**
- `lib/tax-prep/ocr.ts` - OCR processing utilities with Tesseract.js
- `lib/tax-prep/parsers/w2-parser.ts` - W-2 text parsing with enhanced regex
- `lib/tax-prep/parsers/1099-int-parser.ts` - 1099-INT parser (fully integrated)
- `lib/tax-prep/parsers/1099-div-parser.ts` - 1099-DIV parser (fully integrated)
- `lib/tax-prep/parsers/1099-misc-parser.ts` - 1099-MISC/NEC parser (fully integrated)

**Files Modified:**
- `app/tax-prep/interview/w2-income/page.tsx` - Added OCR upload UI with preview and feedback
- `app/tax-prep/interview/1099-income/page.tsx` - Integrated OCR upload for all 1099 form types
- `package.json` - Added tesseract.js dependency, set dev port to 3001

---

### ✅ **Priority 2: Improve Tax Calculations - COMPLETED**
**Impact: MEDIUM-HIGH** | **Effort: MEDIUM** | **Status: Done**

**What was built:**
1. ✅ Tax brackets for ALL filing statuses (single, married joint/separate, HOH, qualifying widow)
2. ✅ Self-employment tax calculation (15.3% SE tax with employer-equivalent deduction)
3. ✅ Earned Income Credit (EIC) with phase-in and phase-out
4. ✅ Alternative Minimum Tax (AMT) with exemptions and phase-outs
5. ✅ Child and Dependent Care Credit (20-35% sliding scale)
6. ✅ American Opportunity Tax Credit (AOTC) with AGI phase-out
7. ✅ Lifetime Learning Credit with AGI phase-out
8. ✅ Additional Child Tax Credit (refundable portion)

**Files Created:**
- `lib/tax-prep/tax-calculator.ts` - Comprehensive tax calculation utilities

**Files Modified:**
- `app/tax-prep/interview/review/page.tsx` - Integrated all new tax calculations

**Commits:**
- `a388b1b` - Implement comprehensive tax calculations for all filing statuses
- `135c17a` - Add complete tax calculation suite: all years, credits, and AMT

---

### ✅ **Priority 4: Prior Year Support - COMPLETED**
**Impact: MEDIUM** | **Effort: LOW-MEDIUM** | **Status: Done**

**What was built:**
- ✅ Tax years 2025, 2024, 2023, 2022 fully supported
- ✅ Standard deductions for all 4 years
- ✅ Tax brackets for all 4 years and all filing statuses
- ✅ Year-specific credit calculations

**Files Modified:**
- `lib/tax-prep/tax-calculator.ts` - Year-based tax bracket calculations for all years

---

### ✅ **Priority 3: Privacy-First Analytics - COMPLETED**
**Impact: HIGH** | **Effort: LOW** | **Status: Done**

**What was built:**
- ✅ Fathom Analytics integration (privacy-first, no cookies, GDPR compliant)
- ✅ Type-safe analytics utility with comprehensive event tracking
- ✅ Automatic page view tracking for SPA navigation
- ✅ Event tracking for Free File Navigator (eligibility, partner clicks)
- ✅ Event tracking for Tax Prep Assistant (starts, completions, downloads)
- ✅ Privacy-compliant design (no PII, no actual tax data)
- ✅ Easy activation via environment variable

**Files Created:**
- `lib/analytics.ts` - Privacy-first analytics utility with type-safe event tracking
- `components/analytics/fathom-analytics.tsx` - Fathom script loader component

**Files Modified:**
- `app/layout.tsx` - Added Fathom Analytics component
- `app/eligibility/page.tsx` - Track eligibility form starts
- `app/results/page.tsx` - Track eligibility completions and partner clicks
- `app/tax-prep/start/page.tsx` - Track tax prep starts
- `app/tax-prep/interview/review/page.tsx` - Track tax prep completions
- `app/tax-prep/download/page.tsx` - Track PDF downloads
- `.env.example` - Added NEXT_PUBLIC_FATHOM_SITE_ID configuration

**Events Being Tracked:**
1. **Free File Navigator:**
   - `eligibility_started` - User begins eligibility form
   - `eligibility_completed` - Form submitted with number of matches
   - `partner_clicked` - User clicks partner link (partner name + rank)

2. **Tax Prep Assistant:**
   - `tax_prep_started` - User starts new tax return (year + filing status)
   - `tax_prep_completed` - User reaches review page (year + has refund)
   - `pdf_downloaded` - User downloads Form 1040 PDF (year)

3. **OCR (ready for integration):**
   - `ocr_upload_started` - User starts upload (form type)
   - `ocr_upload_success` - Upload succeeds (form type)
   - `ocr_upload_failed` - Upload fails (form type)

**Privacy Compliance:**
- ✅ No cookies or localStorage from analytics
- ✅ No PII tracked (names, SSNs, addresses)
- ✅ No actual tax data (income amounts, deductions)
- ✅ Anonymous behavioral events only
- ✅ Honors Do Not Track browser setting
- ✅ EU data hosting via Fathom

**How to Activate:**
1. Sign up for Fathom Analytics at https://usefathom.com
2. Create a new site and get your Site ID
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_FATHOM_SITE_ID=your-site-id-here
   ```
4. Restart dev server - analytics will automatically start tracking
5. View dashboard at https://app.usefathom.com

**Cost:** ~$14/month for up to 100k pageviews (Fathom pricing)

---

### **Priority 5: State Tax Returns (PRD 3)**
**Impact: HIGH** | **Effort: VERY HIGH**

**Note:** This is complex enough to be a separate product (PRD 3)
- 50 different state forms
- State-specific calculations and rules
- Multi-state support
- State e-filing integration

---

## 📝 Important Notes

### Feature Flags
- **Production:** Set `NEXT_PUBLIC_FEATURE_TAX_PREP=false` to hide Tax Prep
- **Development:** Currently `true` in `.env.local`
- File: `.env.local` (gitignored), `.env.example` (committed)

### Tax Calculation (Production Ready)
- ✅ Tax brackets for ALL years (2022-2025) and ALL filing statuses
- ✅ Progressive tax calculation using actual IRS brackets
- ✅ Self-employment tax (15.3% with employer-equivalent deduction)
- ✅ Earned Income Credit with phase-in/phase-out
- ✅ Alternative Minimum Tax (AMT) calculation
- ✅ SALT deduction capped at $10,000
- ✅ Child Tax Credit: $2,000/child with AGI phase-out
- ✅ Additional Child Tax Credit (refundable portion)
- ✅ Child and Dependent Care Credit (20-35% sliding scale)
- ✅ American Opportunity Tax Credit
- ✅ Lifetime Learning Credit
- ✅ Other Dependent Credit: $500/dependent

### localStorage Keys
- `tax-prep-returns` - Array of all tax returns
- `tax-prep-current` - ID of current return

### Git Workflow
- **DO NOT** include "Generated with Claude Code" footer in commits
- Commit messages should be descriptive and professional
- Always test before committing

### Known Quirks
- **Download page text:** Uses inline styles instead of Tailwind classes
  - Why: Tailwind compilation issue causes one-word-per-line wrapping
  - File: `app/tax-prep/download/page.tsx` (lines 143-153)
  - Solution: Inline `style={{ width: '100%', maxWidth: '672px', ... }}`

---

## 🐛 Debugging Tips

### Common Issues
1. **Port 3000 in use** → Dev server runs on 3001
2. **Node version warning** → Use Node 20+ (not 18)
3. **Feature not showing** → Check `.env.local` feature flags
4. **localStorage errors** → Check browser settings, private browsing blocks it
5. **Text wrapping on download page** → Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Useful Commands
```bash
# Check git status
git status

# View recent commits
git log --oneline -10

# Check Node version
node --version

# Clear localStorage (in browser console)
localStorage.clear()

# Hard refresh browser
# Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Firefox: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
```

---

## 📊 Progress Tracking

**Free File Navigator (PRD 1):** 100% complete ✅
**Tax Prep Assistant (PRD 2):** 100% complete ✅
- Core features: 100% ✅
- Advanced features: 100% ✅
- Tax calculations: 100% ✅
- Document upload/OCR: 100% ✅
- Prior year support: 100% ✅

**State Filing Solution (PRD 3):** 0% (not started)
**Advocacy Platform (PRD 4):** 0% (not started)

**Total Lines of Code:** ~10,500+ lines across all files

---

## 🔗 Related Documents

- [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) - Complete roadmap for all 4 products
- [PRD 1](./prds/PRD_1_Free_File_Navigator.pdf) - Free File Navigator
- [PRD 2](./prds/PRD_2_Tax_Preparation_Assistant.pdf) - Tax Prep Assistant
- [PRD 3](./prds/PRD_3_State_Filing_Solution.pdf) - State Filing Solution
- [PRD 4](./prds/PRD_4_Advocacy_Platform.pdf) - Advocacy Platform

---

## 💡 Quick Start for Next Session

### Start Document Upload/OCR Feature

1. **Install Tesseract.js:**
   ```bash
   npm install tesseract.js
   npm install --save-dev @types/tesseract.js
   ```

2. **Create OCR utility:**
   ```bash
   # Create new files
   touch lib/tax-prep/ocr.ts
   touch lib/tax-prep/parsers/w2-parser.ts
   ```

3. **Review current W-2 page structure:**
   ```bash
   # Understand current implementation
   cat app/tax-prep/interview/w2-income/page.tsx
   ```

4. **Plan upload UI:**
   - Add "Upload W-2" button above manual entry form
   - Show image preview
   - Display OCR progress indicator
   - Pre-fill form on successful extraction
   - Allow manual corrections

5. **Test with sample W-2 images:**
   - Find or create sample W-2 images for testing
   - Test OCR accuracy
   - Refine regex patterns for field extraction

### Recent Commits
```bash
git log --oneline -5
# c2e035e Fix text wrapping on download page with inline styles
# 1839726 Add advanced tax prep features and fix PDF generation
# 8d595ae Fix text wrapping and button width on download page
# b5d460b Add development handoff notes for session continuity
# 7e1154c Fix layout issues on PDF download page
```

---

*Last modified: 2025-11-10 by Claude*
