import { z } from "zod";

const ymdSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Mirrors lib/validations/hrms.schema.ts's applyLeaveSchema. Client-side validation is UX-only — the server is the source of truth. */
export const applyLeaveSchema = z
  .object({
    fromDate: ymdSchema,
    toDate: ymdSchema,
    reason: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((data) => data.fromDate <= data.toDate, {
    message: "From date must be on/before to date",
    path: ["toDate"],
  })
  .refine((data) => data.fromDate >= todayKey(), {
    message: "Leave cannot start in the past",
    path: ["fromDate"],
  });

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
