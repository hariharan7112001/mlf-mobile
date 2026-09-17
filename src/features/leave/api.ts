import { apiGet, apiPost } from "@/core/api/client";
import { LEAVE_API } from "./constants";
import type { LeaveStatus, LeaveSummary } from "./types";

export type ApplyLeaveRequest = { fromDate: string; toDate: string; reason?: string };
export type LeaveResponse = { leave: LeaveSummary };
export type CancelLeaveResponse = { cancelled: boolean; unitId: string; leave: LeaveSummary };

export function applyLeave(body: ApplyLeaveRequest) {
  return apiPost<LeaveResponse>(LEAVE_API.apply, body);
}

export function listLeave(params?: { status?: LeaveStatus | "decided" }) {
  const query = new URLSearchParams({ mine: "1" });
  if (params?.status) query.set("status", params.status);
  return apiGet<LeaveSummary[]>(`${LEAVE_API.list}?${query.toString()}`);
}

export function cancelLeave(unitId: string) {
  return apiPost<CancelLeaveResponse>(LEAVE_API.cancel(unitId));
}
