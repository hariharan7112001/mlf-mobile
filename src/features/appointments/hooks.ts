import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as appointmentsApi from "./api";
import type { CreateAppointmentInput, UpdateAppointmentInput } from "./schemas";
import type { AppointmentStatus } from "./types";

const APPOINTMENTS_LIST_KEY = ["appointments", "list"];
const appointmentDetailKey = (unitId: string) => ["appointments", "detail", unitId];

export function useAdvocates(q?: string) {
  return useQuery({
    queryKey: ["advocates", q ?? ""],
    queryFn: () => appointmentsApi.listAdvocates({ q }),
  });
}

export function useAvailability(
  params: { date: string; advocateMobile: string; durationMin?: number } | null
) {
  return useQuery({
    queryKey: ["appointments", "availability", params],
    queryFn: () => appointmentsApi.getAvailability(params!),
    enabled: Boolean(params?.date && params?.advocateMobile),
  });
}

export function useAppointments(status?: AppointmentStatus) {
  return useQuery({
    queryKey: [...APPOINTMENTS_LIST_KEY, status ?? "all"],
    queryFn: () => appointmentsApi.listAppointments({ status }),
  });
}

export function useAppointment(unitId: string) {
  return useQuery({
    queryKey: appointmentDetailKey(unitId),
    queryFn: () => appointmentsApi.getAppointment(unitId),
    enabled: Boolean(unitId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAppointmentInput) => appointmentsApi.createAppointment(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_LIST_KEY }),
  });
}

export function useUpdateAppointment(unitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAppointmentInput) => appointmentsApi.updateAppointment(unitId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: appointmentDetailKey(unitId) });
    },
  });
}

export function useConfirmAppointment(unitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => appointmentsApi.confirmAppointment(unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: appointmentDetailKey(unitId) });
    },
  });
}
