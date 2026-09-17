export type AppointmentMode = "office" | "call" | "video";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

/** Mirrors the backend's AppointmentSummary contract (features/appointments/server/serialize.ts + enrich.ts). */
export type AppointmentSummary = {
  unitId: string;
  clientUnitId: string | null;
  clientName: string | null;
  caseUnitId: string | null;
  advocateMobile: string | null;
  advocateName: string | null;
  advocatePhotoUrl?: string | null;
  advocateUnitId?: string | null;
  title: string;
  scheduledAt: string;
  durationMin: number;
  mode: AppointmentMode;
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
  confirmedAt: string | null;
  confirmedByUnitId: string | null;
  confirmedByRole: string | null;
  canConfirm: boolean;
  confirmWindowHours: number;
  createdAt: string;
};

export type AdvocateSummary = {
  unitId: string;
  name: string | null;
  displayName: string;
  mobile: string;
  designation: string | null;
  photoUrl: string | null;
  defaultCourts: string[];
};

export type AvailabilityWindow = { start: string; end: string };

export type BusySlot = {
  start: string;
  end: string;
  reason: "appointment" | "block" | "leave" | "closed";
  label?: string;
};

/** Mirrors lib/appointments/availability.ts's DayAvailability. */
export type DayAvailability = {
  date: string;
  advocateMobile: string;
  durationMin: number;
  onLeave: boolean;
  windows: AvailabilityWindow[];
  freeSlots: string[];
  busy: BusySlot[];
};
