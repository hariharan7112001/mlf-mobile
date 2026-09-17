export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

/** Mirrors the backend's LeaveSummary contract (features/hrms/server/serialize.ts). */
export type LeaveSummary = {
  unitId: string;
  userUnitId: string;
  userName: string | null;
  fromDate: string;
  toDate: string;
  reason: string | null;
  status: LeaveStatus;
  approvedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
};
