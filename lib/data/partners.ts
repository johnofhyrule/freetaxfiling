import { Partner } from "../types";

/**
 * IRS Free File partner data
 * Data based on typical Free File program requirements and partner offerings
 */
export const partners: Partner[] = [
  {
    id: "1040now",
    name: "1040NOW",
    url: "https://www.1040now.com",
    maxAGI: 79000,
    supportedForms: {
      federal: ["1040", "1040-SR"],
      state: true,
      schedules: ["1", "2", "3", "A", "B", "C", "D", "E", "EIC", "SE"],
    },
    features: {
      priorYearReturns: false,
      importW2: true,
      liveSupport: true,
      mobileApp: false,
      spanishLanguage: true,
    },
    description:
      "Full-featured free filing with extensive schedule support and Spanish language options.",
    highlights: [
      "Wide AGI limit ($79,000)",
      "Supports most common schedules",
      "Spanish language available",
      "Live customer support",
    ],
  },
  {
    id: "taxact",
    name: "TaxAct",
    url: "https://www.taxact.com",
    maxAGI: 73000,
    supportedForms: {
      federal: ["1040", "1040-SR"],
      state: true,
      schedules: ["1", "2", "3", "A", "B", "C", "D", "EIC", "SE"],
    },
    features: {
      priorYearReturns: false,
      importW2: true,
      liveSupport: false,
      mobileApp: true,
      spanishLanguage: false,
    },
    specialEligibility: {
      students: true,
    },
    description:
      "Reliable free filing option with mobile app and good support for students.",
    highlights: [
      "Mobile app available",
      "Great for students",
      "Import W-2 data",
      "State returns included",
    ],
  },
  {
    id: "freetaxusa",
    name: "FreeTaxUSA",
    url: "https://www.freetaxusa.com",
    maxAGI: 45000,
    maxAge: 65,
    supportedForms: {
      federal: ["1040"],
      state: true,
      schedules: ["1", "2", "3", "A", "B", "EIC"],
    },
    features: {
      priorYearReturns: false,
      importW2: true,
      liveSupport: false,
      mobileApp: false,
      spanishLanguage: false,
    },
    description:
      "Simple and straightforward option for younger filers with moderate income.",
    highlights: [
      "Easy to use interface",
      "Good for simple returns",
      "Import W-2 data",
      "Free state returns",
    ],
    limitations: [
      "Age limit: 65 and under",
      "Limited schedule support",
    ],
  },
  {
    id: "taxslayer",
    name: "TaxSlayer",
    url: "https://www.taxslayer.com",
    maxAGI: 60000,
    supportedForms: {
      federal: ["1040", "1040-SR"],
      state: true,
      schedules: ["1", "2", "3", "A", "B", "C", "D", "E", "EIC", "SE"],
    },
    features: {
      priorYearReturns: true,
      importW2: true,
      liveSupport: true,
      mobileApp: true,
      spanishLanguage: false,
    },
    specialEligibility: {
      military: true,
    },
    militaryOnly: false,
    description:
      "Comprehensive option with prior year support and excellent for military members.",
    highlights: [
      "File prior year returns",
      "Military-friendly features",
      "Mobile and desktop access",
      "Live support available",
    ],
  },
  {
    id: "military-1040",
    name: "Military OneSource",
    url: "https://www.militaryonesource.mil",
    maxAGI: 79000,
    militaryOnly: true,
    supportedForms: {
      federal: ["1040", "1040-SR"],
      state: true,
      schedules: ["1", "2", "3", "A", "B", "C", "D", "E", "EIC", "SE"],
    },
    features: {
      priorYearReturns: true,
      importW2: true,
      liveSupport: true,
      mobileApp: true,
      spanishLanguage: true,
    },
    specialEligibility: {
      military: true,
    },
    description:
      "Exclusively for military members and their families with comprehensive support.",
    highlights: [
      "Military members only",
      "Highest AGI limit for military",
      "Full schedule support",
      "Prior year filing available",
      "Spanish language support",
    ],
  },
  {
    id: "online-taxes",
    name: "OnLine Taxes",
    url: "https://www.onlinetaxes.com",
    maxAGI: 48000,
    minAge: 51,
    supportedForms: {
      federal: ["1040", "1040-SR"],
      state: true,
      schedules: ["1", "2", "A", "B", "D", "EIC"],
    },
    features: {
      priorYearReturns: false,
      importW2: true,
      liveSupport: true,
      mobileApp: false,
      spanishLanguage: false,
    },
    specialEligibility: {
      seniorCitizens: true,
    },
    description:
      "Designed for senior citizens with age-appropriate features and support.",
    highlights: [
      "For ages 51 and up",
      "Senior-friendly interface",
      "Live support for seniors",
      "Includes state returns",
    ],
  },
  {
    id: "ezTaxReturn",
    name: "ezTaxReturn.com",
    url: "https://www.eztaxreturn.com",
    maxAGI: 35000,
    supportedForms: {
      federal: ["1040"],
      state: false,
      schedules: ["1", "EIC"],
    },
    features: {
      priorYearReturns: false,
      importW2: false,
      liveSupport: false,
      mobileApp: false,
      spanishLanguage: true,
    },
    description:
      "Basic free filing for simple returns and low-income filers.",
    highlights: [
      "Very simple interface",
      "Good for basic W-2 income",
      "Spanish language available",
      "Fast processing",
    ],
    limitations: [
      "Federal only (no state)",
      "Limited schedule support",
      "Lower AGI limit",
    ],
  },
  {
    id: "file-your-taxes",
    name: "FileYourTaxes.com",
    url: "https://www.fileyourtaxes.com",
    maxAGI: 69000,
    stateRestrictions: {
      type: "exclude",
      states: ["CA", "NY", "NJ"], // Example restrictions
    },
    supportedForms: {
      federal: ["1040", "1040-SR"],
      state: true,
      schedules: ["1", "2", "3", "A", "B", "C", "D", "EIC"],
    },
    features: {
      priorYearReturns: false,
      importW2: true,
      liveSupport: true,
      mobileApp: true,
      spanishLanguage: false,
    },
    description:
      "Solid all-around option with good AGI limits but some state restrictions.",
    highlights: [
      "High AGI limit ($69,000)",
      "Mobile app available",
      "Good schedule coverage",
      "Live support",
    ],
    limitations: [
      "Not available in CA, NY, NJ",
    ],
  },
];

// Helper function to get partner by ID
export function getPartnerById(id: string): Partner | undefined {
  return partners.find((p) => p.id === id);
}

// Helper function to get all partners
export function getAllPartners(): Partner[] {
  return partners;
}
