import { z } from "zod";

// US State codes
export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC"
] as const;

// Tax schedules
export const TAX_SCHEDULES = [
  { value: "1", label: "Schedule 1 - Additional Income" },
  { value: "2", label: "Schedule 2 - Additional Taxes" },
  { value: "3", label: "Schedule 3 - Additional Credits" },
  { value: "A", label: "Schedule A - Itemized Deductions" },
  { value: "B", label: "Schedule B - Interest and Dividends" },
  { value: "C", label: "Schedule C - Business Income/Loss" },
  { value: "D", label: "Schedule D - Capital Gains/Losses" },
  { value: "E", label: "Schedule E - Rental/Royalty Income" },
  { value: "EIC", label: "Schedule EIC - Earned Income Credit" },
  { value: "SE", label: "Schedule SE - Self-Employment Tax" },
] as const;

export const eligibilityFormSchema = z.object({
  // Basic financial info
  agi: z
    .number({
      required_error: "Adjusted Gross Income is required",
      invalid_type_error: "Please enter a valid number",
    })
    .min(0, "AGI cannot be negative")
    .max(1000000, "AGI seems unusually high"),

  // Personal info
  age: z.preprocess(
    (val) => {
      // Convert empty string or NaN to undefined
      if (val === "" || val === null || (typeof val === "number" && isNaN(val))) {
        return undefined;
      }
      return val;
    },
    z
      .number({
        invalid_type_error: "Please enter a valid age",
      })
      .min(16, "Must be at least 16 years old")
      .max(120, "Please enter a valid age")
      .optional()
  ),

  state: z.enum(US_STATES, {
    required_error: "Please select your state",
  }),

  // Tax situation
  filingStatus: z.enum(
    ["single", "married-joint", "married-separate", "head-of-household", "qualifying-widow"],
    {
      required_error: "Please select your filing status",
    }
  ),

  needsStateTaxReturn: z.boolean().default(true),

  hasSchedules: z.array(z.string()).default([]),

  needsPriorYearReturn: z.boolean().default(false),

  // Special circumstances
  isMilitary: z.boolean().default(false),
  isStudent: z.boolean().default(false),
  hasDisability: z.boolean().default(false),

  // Preferences
  preferSpanish: z.boolean().default(false),
  wantsLiveSupport: z.boolean().default(false),
  wantsMobileApp: z.boolean().default(false),
});

export type EligibilityFormData = z.infer<typeof eligibilityFormSchema>;
