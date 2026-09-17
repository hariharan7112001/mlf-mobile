import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as leaveApi from "./api";
import type { LeaveStatus } from "./types";

const LEAVE_LIST_KEY = ["leave", "list"];

export function useMyLeave(status?: LeaveStatus | "decided") {
  return useQuery({
    queryKey: [...LEAVE_LIST_KEY, status ?? "all"],
    queryFn: () => leaveApi.listLeave({ status }),
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveApi.applyLeave,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEAVE_LIST_KEY }),
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (unitId: string) => leaveApi.cancelLeave(unitId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEAVE_LIST_KEY }),
  });
}
