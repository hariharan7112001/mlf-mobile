/** Appointment API paths — mirrors app/api/appointments/**, app/api/advocates/route.ts. */
export const APPOINTMENTS_API = {
  advocates: "/api/advocates",
  availability: "/api/appointments/availability",
  list: "/api/appointments",
  create: "/api/appointments",
  detail: (unitId: string) => `/api/appointments/${unitId}`,
  confirm: (unitId: string) => `/api/appointments/${unitId}/confirm`,
} as const;

export const APPOINTMENT_MODE_OPTIONS = [
  { value: "office", label: "Office" },
  { value: "call", label: "Call" },
  { value: "video", label: "Video" },
] as const;

export const DEFAULT_APPOINTMENT_DURATION_MIN = 30;
