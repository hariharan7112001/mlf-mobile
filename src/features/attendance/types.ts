/** Mirrors the backend's AttendanceSummary contract (features/hrms/server/serialize.ts). */
export type AttendanceSummary = {
  unitId: string;
  userUnitId: string;
  userName: string | null;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInLat: number | null;
  checkInLng: number | null;
  checkInAccuracy: number | null;
  checkOutLat: number | null;
  checkOutLng: number | null;
  checkOutAccuracy: number | null;
  notes: string | null;
};
