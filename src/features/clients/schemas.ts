import { z } from "zod";

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

/** Mirrors lib/validations/clients.schema.ts's createClientSchema. Client-side validation is UX-only — the server is the source of truth. */
export const createClientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  fatherOrSpouse: optionalString(120),
  occupation: optionalString(80),
  gender: z.enum(["male", "female", "other", "prefer_not"]).optional().or(z.literal("")),
  mobile: z.string().trim().min(10, "Enter a valid mobile number").max(15),
  altMobile: optionalString(15),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  address: optionalString(500),
  city: optionalString(80),
  district: optionalString(80),
  state: optionalString(80),
  aadhaarLast4: z.string().regex(/^\d{4}$/, "Enter last 4 digits").optional().or(z.literal("")),
  referredBy: optionalString(120),
  matterBrief: optionalString(2000),
  notes: optionalString(1000),
  smsConsent: z.boolean().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
