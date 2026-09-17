import { apiGet, apiPost } from "@/core/api/client";
import { ATTENDANCE_API } from "./constants";
import type { Coords } from "./lib/location";
import type { AttendanceSummary } from "./types";

export type CheckInOutRequest = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  notes?: string;
};

export type AttendanceResponse = { attendance: AttendanceSummary };

function toRequest(coords: Coords, notes?: string): CheckInOutRequest {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? undefined,
    notes,
  };
}

export function checkIn(coords: Coords, notes?: string) {
  return apiPost<AttendanceResponse>(ATTENDANCE_API.checkIn, toRequest(coords, notes));
}

export function checkOut(coords: Coords, notes?: string) {
  return apiPost<AttendanceResponse>(ATTENDANCE_API.checkOut, toRequest(coords, notes));
}

export function listAttendance(params?: { from?: string; to?: string }) {
  const query = new URLSearchParams({ mine: "1" });
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  return apiGet<AttendanceSummary[]>(`${ATTENDANCE_API.list}?${query.toString()}`);
}
