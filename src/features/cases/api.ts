import { apiGet, apiPatch, apiPost } from "@/core/api/client";
import { CASES_API, type CaseQuickFilter, type CaseStatus } from "./constants";
import type {
  AddHearingInput,
  AdjournHearingInput,
  CreateCaseInput,
  UpdateCaseInput,
} from "./schemas";
import type {
  CaseDetailResponse,
  CaseListItem,
  CaseSummary,
  CourtMetaLevel,
  CourtMetaResponse,
  FilingChecklistState,
  HearingSummary,
} from "./types";

export type CaseResponse = { case: CaseSummary };

export type CaseListParams = {
  q?: string;
  status?: CaseStatus;
  caseType?: string;
  clientUnitId?: string;
  quick?: CaseQuickFilter;
};

function applyQuickFilter(query: URLSearchParams, quick: CaseQuickFilter | undefined) {
  switch (quick) {
    case "today":
      query.set("hearing", "today");
      break;
    case "week":
      query.set("hearing", "week");
      break;
    case "missingNumber":
      query.set("missingCourtNumber", "1");
      break;
    case "battaDue":
      query.set("battaDue", "1");
      break;
    case "defect":
      query.set("status", "filing_defect");
      break;
  }
}

export function listCases(params: CaseListParams = {}) {
  const query = new URLSearchParams({ pageSize: "50" });
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.caseType) query.set("caseType", params.caseType);
  if (params.clientUnitId) query.set("clientUnitId", params.clientUnitId);
  applyQuickFilter(query, params.quick);
  return apiGet<CaseListItem[]>(`${CASES_API.list}?${query.toString()}`);
}

export function getCase(unitId: string) {
  return apiGet<CaseDetailResponse>(CASES_API.detail(unitId));
}

export function createCase(body: CreateCaseInput) {
  return apiPost<CaseResponse>(CASES_API.create, body);
}

export function updateCase(unitId: string, body: UpdateCaseInput) {
  return apiPatch<CaseResponse>(CASES_API.detail(unitId), body);
}

export function updateCaseStatus(unitId: string, status: CaseStatus) {
  return apiPatch<CaseResponse>(CASES_API.status(unitId), { status });
}

export function updateFilingChecklist(
  unitId: string,
  body: {
    filingChecklist: FilingChecklistState;
    battaDue?: boolean;
    awaitingService?: boolean;
    promoteIfNumbered?: boolean;
  }
) {
  return apiPatch<CaseResponse>(CASES_API.checklist(unitId), body);
}

export function addHearing(unitId: string, body: AddHearingInput) {
  return apiPost<{ hearing: HearingSummary }>(CASES_API.hearings(unitId), body);
}

export function adjournHearing(hearingUnitId: string, body: AdjournHearingInput) {
  return apiPost<{ hearing: HearingSummary }>(CASES_API.adjournHearing(hearingUnitId), body);
}

export function getCourtMeta(
  level: CourtMetaLevel,
  params: { state?: string; district?: string; complex?: string; q?: string }
) {
  const query = new URLSearchParams({ level, pageSize: "50" });
  if (params.state) query.set("state", params.state);
  if (params.district) query.set("district", params.district);
  if (params.complex) query.set("complex", params.complex);
  if (params.q) query.set("q", params.q);
  return apiGet<CourtMetaResponse>(`${CASES_API.courtsMeta}?${query.toString()}`);
}
