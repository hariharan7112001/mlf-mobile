import { z } from "zod";
import { CASE_PIPELINE_STATUSES, isValidCnr, OUR_SIDE_OPTIONS } from "./constants";

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

/**
 * Mirrors lib/validations/cases.schema.ts's createCaseSchema. Client-side validation is
 * UX-only — the server is the source of truth (including stage ↔ case-type checks).
 */
export const createCaseSchema = z.object({
  clientUnitId: z.string().trim().min(1, "Select or add a client"),
  caseNumber: optionalString(120),
  filingNumber: optionalString(120),
  caseYear: z.number().int().min(1950).max(2100).optional(),
  cnr: z
    .string()
    .optional()
    .refine((v) => !v || isValidCnr(v), "CNR must be 16 letters/digits (dashes optional)"),
  state: z.string().trim().min(1, "Select state").max(80),
  district: z.string().trim().min(1, "Select district").max(80),
  city: z.string().trim().min(1, "Select city / town").max(80),
  courtName: z.string().trim().min(1, "Select court").max(160),
  primaryAdvocateMobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Select an advocate or enter a 10-digit mobile"),
  advocateMobiles: z.array(z.string()).optional(),
  opposingParty: optionalString(160),
  ourSide: z
    .enum(OUR_SIDE_OPTIONS.map((o) => o.value) as [string, ...string[]])
    .optional()
    .or(z.literal("")),
  underActs: optionalString(500),
  policeStation: optionalString(160),
  firNumber: optionalString(120),
  stage: optionalString(160),
  caseType: z.string().trim().min(1, "Select case type").max(80),
  status: z.enum(CASE_PIPELINE_STATUSES).optional(),
  filingDate: ymd.optional(),
  nextHearingAt: ymd.optional(),
  agreedFee: z
    .number({ error: "Enter the case fee (₹)" })
    .nonnegative("Case fee cannot be negative"),
  notes: optionalString(2000),
});

export const updateCaseSchema = createCaseSchema.omit({ clientUnitId: true, status: true });

export const addHearingSchema = z.object({
  hearingDate: ymd,
  purpose: optionalString(200),
  notes: optionalString(1000),
});

export const adjournHearingSchema = z.object({
  nextHearingDate: ymd,
  outcome: optionalString(200),
  notes: optionalString(1000),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type AddHearingInput = z.infer<typeof addHearingSchema>;
export type AdjournHearingInput = z.infer<typeof adjournHearingSchema>;
