import { z } from "zod";

/** Mirrors lib/validations/appointments.schema.ts's createAppointmentSchema. Client-side validation is UX-only — the server is the source of truth. */
export const createAppointmentSchema = z.object({
  clientUnitId: z.string().optional().or(z.literal("")),
  caseUnitId: z.string().optional().or(z.literal("")),
  advocateMobile: z.string().trim().min(10, "Select an advocate").max(15),
  title: z.string().trim().min(1, "Title is required").max(160),
  scheduledAt: z.string().min(1, "Pick a date and time"),
  durationMin: z.number().int().min(5).max(480).optional(),
  mode: z.enum(["office", "call", "video"]).optional(),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
