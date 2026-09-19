import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as attendanceApi from "./api";
import { getCurrentCoords } from "./lib/location";

const HISTORY_KEY = ["attendance", "history"];

export function useAttendanceHistory() {
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: () => attendanceApi.listAttendance(),
  });
}

/** Captures a fresh location fix on every call, then records the check-in. */
export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notes?: string) => {
      const coords = await getCurrentCoords();
      return attendanceApi.checkIn(coords, notes);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HISTORY_KEY }),
  });
}

/** Captures a fresh location fix on every call, then records the check-out. */
export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notes?: string) => {
      const coords = await getCurrentCoords();
      return attendanceApi.checkOut(coords, notes);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HISTORY_KEY }),
  });
}
