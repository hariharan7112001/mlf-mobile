import { apiGet, apiPatch, apiPost } from "@/core/api/client";
import { APPOINTMENTS_API } from "./constants";
import type { CreateAppointmentInput, UpdateAppointmentInput } from "./schemas";
import type {
  AdvocateSummary,
  AppointmentStatus,
  AppointmentSummary,
  DayAvailability,
} from "./types";

export type AppointmentResponse = { appointment: AppointmentSummary };

export function listAdvocates(params?: { q?: string }) {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  return apiGet<AdvocateSummary[]>(`${APPOINTMENTS_API.advocates}${qs ? `?${qs}` : ""}`);
}

export function getAvailability(params: {
  date: string;
  advocateMobile: string;
  durationMin?: number;
  clientUnitId?: string;
  excludeAppointmentUnitId?: string;
}) {
  const query = new URLSearchParams({ date: params.date, advocateMobile: params.advocateMobile });
  if (params.durationMin) query.set("durationMin", String(params.durationMin));
  if (params.clientUnitId) query.set("clientUnitId", params.clientUnitId);
  if (params.excludeAppointmentUnitId) {
    query.set("excludeAppointmentUnitId", params.excludeAppointmentUnitId);
  }
  return apiGet<DayAvailability>(`${APPOINTMENTS_API.availability}?${query.toString()}`);
}

export function createAppointment(body: CreateAppointmentInput) {
  return apiPost<AppointmentResponse>(APPOINTMENTS_API.create, body);
}

export function listAppointments(params?: {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  q?: string;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  return apiGet<AppointmentSummary[]>(`${APPOINTMENTS_API.list}${qs ? `?${qs}` : ""}`);
}

export function getAppointment(unitId: string) {
  return apiGet<AppointmentResponse>(APPOINTMENTS_API.detail(unitId));
}

export function updateAppointment(unitId: string, body: UpdateAppointmentInput) {
  return apiPatch<AppointmentResponse>(APPOINTMENTS_API.detail(unitId), body);
}

export function confirmAppointment(unitId: string) {
  return apiPost<AppointmentResponse>(APPOINTMENTS_API.confirm(unitId));
}
