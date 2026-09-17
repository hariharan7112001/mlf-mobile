import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as attendanceApi from "./api";
import { getCurrentCoords } from "./lib/location";

const TODAY_KEY = ["attendance", "today"];
const HISTORY_KEY = ["attendance", "history"];

/** Most recent attendance row for the caller — rows are date-desc and at most one per day, so [0] is today's if it exists. */
export function useTodayAttendance() {
  return useQuery({
    queryKey: TODAY_KEY,
    queryFn: async () => {
      const rows = await attendanceApi.listAttendance();
      return rows[0] ?? null;
    },
  });
}

export function useAttendanceHistory() {
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: () => attendanceApi.listAttendance(),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notes?: string) => {
      const coords = await getCurrentCoords();
      return attendanceApi.checkIn(coords, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notes?: string) => {
      const coords = await getCurrentCoords();
      return attendanceApi.checkOut(coords, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
    },
  });
}
