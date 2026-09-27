import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as casesApi from "./api";
import type { CaseListParams } from "./api";
import type { CaseStatus } from "./constants";
import type {
  AddHearingInput,
  AdjournHearingInput,
  CreateCaseInput,
  UpdateCaseInput,
} from "./schemas";
import type { CourtMetaLevel, FilingChecklistState } from "./types";

const CASES_LIST_KEY = ["cases", "list"];
export const caseDetailKey = (unitId: string) => ["cases", "detail", unitId];

export function useCases(params: CaseListParams) {
  return useQuery({
    queryKey: [...CASES_LIST_KEY, params],
    queryFn: () => casesApi.listCases(params),
  });
}

export function useCase(unitId: string) {
  return useQuery({
    queryKey: caseDetailKey(unitId),
    queryFn: () => casesApi.getCase(unitId),
    enabled: Boolean(unitId),
  });
}

/** Every case write can change list rows (status, next hearing, batta) and the client's case list. */
function useInvalidateCase(unitId?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: CASES_LIST_KEY });
    queryClient.invalidateQueries({ queryKey: ["clients", "detail"] });
    if (unitId) queryClient.invalidateQueries({ queryKey: caseDetailKey(unitId) });
  };
}

export function useCreateCase() {
  const invalidate = useInvalidateCase();
  return useMutation({
    mutationFn: (body: CreateCaseInput) => casesApi.createCase(body),
    onSuccess: invalidate,
  });
}

export function useUpdateCase(unitId: string) {
  const invalidate = useInvalidateCase(unitId);
  return useMutation({
    mutationFn: (body: UpdateCaseInput) => casesApi.updateCase(unitId, body),
    onSuccess: invalidate,
  });
}

export function useUpdateCaseStatus(unitId: string) {
  const invalidate = useInvalidateCase(unitId);
  return useMutation({
    mutationFn: (status: CaseStatus) => casesApi.updateCaseStatus(unitId, status),
    onSuccess: invalidate,
  });
}

export function useUpdateFilingChecklist(unitId: string) {
  const invalidate = useInvalidateCase(unitId);
  return useMutation({
    mutationFn: (body: {
      filingChecklist: FilingChecklistState;
      battaDue?: boolean;
      awaitingService?: boolean;
      promoteIfNumbered?: boolean;
    }) => casesApi.updateFilingChecklist(unitId, body),
    onSuccess: invalidate,
  });
}

export function useAddHearing(unitId: string) {
  const invalidate = useInvalidateCase(unitId);
  return useMutation({
    mutationFn: (body: AddHearingInput) => casesApi.addHearing(unitId, body),
    onSuccess: invalidate,
  });
}

export function useAdjournHearing(caseUnitId: string) {
  const invalidate = useInvalidateCase(caseUnitId);
  return useMutation({
    mutationFn: ({ hearingUnitId, body }: { hearingUnitId: string; body: AdjournHearingInput }) =>
      casesApi.adjournHearing(hearingUnitId, body),
    onSuccess: invalidate,
  });
}

export function useCourtMeta(
  level: CourtMetaLevel,
  params: { state?: string; district?: string; complex?: string; q?: string },
  enabled = true
) {
  return useQuery({
    queryKey: ["courts", "meta", level, params],
    queryFn: () => casesApi.getCourtMeta(level, params),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}
