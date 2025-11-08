# Free File Navigator

A web application to help taxpayers find truly free tax filing options after IRS Direct File was eliminated.

## Features

- **Landing Page**: Clear, Basecamp-inspired design with trust blue (#1d4ed8) and action orange (#ea580c) brand colors
- **Eligibility Checker**: Comprehensive form to collect user information (AGI, age, state, tax situation, preferences)
- **Smart Matching Algorithm**: Matches users with the best IRS Free File partners based on their specific needs
- **Results Page**: Displays personalized recommendations with match scores and detailed feature comparisons
- **Comparison Table**: Side-by-side feature comparison of all eligible partners
- **Mobile-First Design**: Responsive, accessible (WCAG AA), and optimized for all devices

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **Forms**: React Hook Form + Zod validation
- **Font**: Inter (via next/font/google)

## Design System

- **Colors**:
  - Trust Blue (Primary): `#1d4ed8`
  - Action Orange (Secondary): `#ea580c`
- **Typography**: Inter font family
- **Style**: Basecamp-inspired (simple, opinionated, clear)

## Project Structure

```
/app
  /eligibility      # Eligibility checker form
  /results          # Results and comparison page
  page.tsx          # Landing page
  layout.tsx        # Root layout with Inter font
  globals.css       # Global styles and design tokens

/lib
  types.ts          # TypeScript type definitions
  schemas.ts        # Zod validation schemas
  matching.ts       # Partner matching algorithm
  /data
    partners.ts     # 8 Free File partner data

/public             # Static assets
```

## Getting Started

### Prerequisites

**Important**: This project requires Node.js version 20.9.0 or higher.

Check your Node version:
```bash
node --version
```

If you have Node 18.x, you'll need to upgrade to Node 20+:
- Using nvm: `nvm install 20 && nvm use 20`
- Download from: https://nodejs.org/

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How It Works

1. **User Flow**:
   - User lands on homepage
   - Clicks "Find Your Free Filing Option"
   - Fills out eligibility form (AGI, age, state, tax situation, preferences)
   - Submits form
   - Algorithm matches user with partners
   - Results page shows ranked recommendations with match scores

2. **Matching Algorithm**:
   - Evaluates hard requirements (AGI limits, age restrictions, geographic availability)
   - Calculates match score (0-100) based on:
     - Feature alignment (state returns, schedules, prior years)
     - Special circumstances (military, student, disability, senior)
     - User preferences (Spanish, live support, mobile app)
   - Ranks partners by eligibility and score
   - Provides detailed reasons for matches/warnings

3. **Partner Data**:
   - 8 IRS Free File partners with realistic data
   - AGI limits ranging from $35k to $79k
   - Various features: state returns, live support, mobile apps, Spanish language
   - Special eligibility for military, students, seniors, disabilities

## Partner Data

The app includes 8 Free File partners:

1. **1040NOW** - AGI up to $79k, Spanish support, live help
2. **TaxAct** - AGI up to $73k, student-friendly, mobile app
3. **FreeTaxUSA** - AGI up to $45k, ages 65 and under
4. **TaxSlayer** - AGI up to $60k, prior year support, military-friendly
5. **Military OneSource** - AGI up to $79k, military only
6. **OnLine Taxes** - AGI up to $48k, for ages 51+
7. **ezTaxReturn** - AGI up to $35k, very simple, Spanish support
8. **FileYourTaxes** - AGI up to $69k, some state restrictions

## Customization

### Adding New Partners

Edit `/lib/data/partners.ts` to add new partner data:

```typescript
{
  id: "partner-id",
  name: "Partner Name",
  url: "https://partner.com",
  maxAGI: 60000,
  supportedForms: {
    federal: ["1040"],
    state: true,
    schedules: ["A", "B", "C"],
  },
  features: {
    priorYearReturns: false,
    importW2: true,
    liveSupport: true,
    mobileApp: false,
    spanishLanguage: false,
  },
  description: "...",
  highlights: ["..."],
}
```

### Modifying Matching Logic

Edit `/lib/matching.ts` to adjust scoring weights or add new matching criteria.

### Design System Updates

Edit `/app/globals.css` to change colors, spacing, or other design tokens.

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Mobile-first responsive design

## Future Enhancements

Potential features for future iterations:
- User accounts to save searches
- Email notifications for tax deadline reminders
- Educational content about tax filing
- Partner reviews and ratings
- Multilingual support (beyond Spanish)
- PDF export of recommendations
- Integration with IRS APIs for real-time data

## License

This is a demonstration project. Partner data is based on typical Free File program requirements and should be verified with actual IRS Free File partners.

## Disclaimer

Free File Navigator is an independent service and is not affiliated with the IRS or any tax preparation company. Always verify eligibility requirements directly with the partner before filing your taxes.
