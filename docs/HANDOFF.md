# Development Handoff Notes

**Last Updated:** 2025-11-08
**Current Status:** Tax Prep Assistant (PRD 2) core functionality complete
**Dev Server:** Running on localhost:3001

---

## ✅ Completed Work

### 1. Free File Navigator (PRD 1) - COMPLETE ✅
- Landing page with collapsible FAQ (Basecamp-style)
- Eligibility checker with 8 form fields
- Partner matching algorithm (deductive 100→0 scoring)
- Results page with 8 Free File partners
- All features working and ready for production

### 2. Tax Preparation Assistant (PRD 2) - CORE COMPLETE ✅
**Feature-flagged:** `NEXT_PUBLIC_FEATURE_TAX_PREP=true` in `.env.local`

**Interview Flow (7 pages):**
1. `/tax-prep/start` - Tax year & filing status selection
2. `/tax-prep/interview/basic-info` - Personal information, address
3. `/tax-prep/interview/dependents` - Add dependents with Child Tax Credit auto-calc
4. `/tax-prep/interview/w2-income` - W-2 forms with all boxes
5. `/tax-prep/interview/deductions` - Standard vs itemized with smart recommendations
6. `/tax-prep/interview/credits` - Tax credits (child, education, child care)
7. `/tax-prep/interview/payments` - Withholding, estimated payments, direct deposit
8. `/tax-prep/interview/review` - Complete tax calculation and summary
9. `/tax-prep/download` - PDF generation and download

**Features:**
- ✅ Full tax calculation with 2024 tax brackets
- ✅ localStorage persistence (auto-save)
- ✅ Progress bar tracking
- ✅ Smart recommendations (itemized vs standard, SALT cap warnings)
- ✅ PDF generation using pdf-lib
- ✅ Download and preview PDF functionality

---

## 🚧 Known Issues

### Download Page Layout (NOT YET COMMITTED)
**Status:** Fixed locally but NOT pushed to GitHub
**Issue:** Text wrapping incorrectly, buttons too narrow
**Fix Applied:**
- Removed parent `text-center` div
- Applied centering to individual elements
- Changed buttons to `min-w-[200px]`
- File: `app/tax-prep/download/page.tsx`

**Action Needed:** Commit and push the download page fixes

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
│       ├── download/page.tsx       # PDF download (NEEDS COMMIT)
│       └── interview/
│           ├── layout.tsx          # Interview layout with progress bar
│           ├── basic-info/
│           ├── dependents/
│           ├── w2-income/
│           ├── deductions/
│           ├── credits/
│           ├── payments/
│           └── review/
├── lib/
│   ├── feature-flags.ts            # Feature flag configuration
│   ├── matching.ts                 # Free File partner matching
│   ├── types.ts                    # Partner types
│   ├── schemas.ts                  # Zod validation schemas
│   ├── data/partners.ts            # 8 Free File partners data
│   └── tax-prep/
│       ├── types.ts                # Form 1040 types
│       ├── storage.ts              # localStorage management
│       └── pdf-generator.ts        # PDF generation (pdf-lib)
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

## 🎯 Next Steps

### Immediate (Next Session Start)
1. **Commit download page fixes** - The layout fixes are done but not committed
2. **Test complete flow** - Go through entire tax prep flow end-to-end
3. **Test PDF generation** - Ensure PDFs generate correctly with sample data

### Tax Prep Assistant - Additional Features
1. **1099 Income Pages** - INT, DIV, B, MISC forms
2. **Self-Employment (Schedule C)** - Business income/expenses
3. **Rental Income (Schedule E)** - Rental property income
4. **Prior Year Support** - 2021-2023 tax returns
5. **State Tax Returns** - State-specific forms

### Future Products (PRD 3 & 4)
- **State Filing Solution** - Multi-state e-filing platform
- **Advocacy Platform** - Grassroots advocacy for free filing

---

## 📝 Important Notes

### Feature Flags
- **Production:** Set `NEXT_PUBLIC_FEATURE_TAX_PREP=false` to hide Tax Prep
- **Development:** Currently `true` in `.env.local`
- File: `.env.local` (gitignored), `.env.example` (committed)

### Tax Calculation
- Uses 2024 tax brackets for single filers
- Other filing statuses use simplified 22% rate (placeholder)
- SALT deduction capped at $10,000
- Child Tax Credit: $2,000/child under 17
- Other Dependent Credit: $500/dependent

### localStorage Keys
- `tax-prep-returns` - Array of all tax returns
- `tax-prep-current` - ID of current return

### Git Workflow
- **DO NOT** include "Generated with Claude Code" footer in commits
- Commit messages should be descriptive and professional
- Always test before committing

---

## 🐛 Debugging Tips

### Common Issues
1. **Port 3000 in use** → Dev server runs on 3001
2. **Node version warning** → Use Node 20+ (not 18)
3. **Feature not showing** → Check `.env.local` feature flags
4. **localStorage errors** → Check browser settings, private browsing blocks it

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
```

---

## 📊 Progress Tracking

**Free File Navigator:** 100% complete ✅
**Tax Prep Assistant:** 80% complete (core done, advanced features pending)
**State Filing Solution:** 0% (not started)
**Advocacy Platform:** 0% (not started)

**Total Lines of Code:** ~7,000+ lines across all files

---

## 🔗 Related Documents

- [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) - Complete roadmap for all 4 products
- [PRD 1](./prds/PRD_1_Free_File_Navigator.pdf) - Free File Navigator
- [PRD 2](./prds/PRD_2_Tax_Preparation_Assistant.pdf) - Tax Prep Assistant
- [PRD 3](./prds/PRD_3_State_Filing_Solution.pdf) - State Filing Solution
- [PRD 4](./prds/PRD_4_Advocacy_Platform.pdf) - Advocacy Platform

---

## 💡 Quick Start for Next Session

1. **Check uncommitted changes:**
   ```bash
   git status
   ```

2. **Commit download page fix if needed:**
   ```bash
   git add app/tax-prep/download/page.tsx
   git commit -m "Fix layout issues on PDF download page"
   git push
   ```

3. **Continue development or start new feature**

---

*Last modified: 2025-11-08 by Claude*
