import type { ClientSummary } from "@/features/clients/types";
import type { DocumentSummary } from "@/features/documents/types";
import type { FilingChecklistId } from "./constants";

export type FilingChecklistState = Partial<Record<FilingChecklistId, boolean>> & {
  returnReason?: string;
};

/**
 * Mirrors the backend's CaseSummary (features/cases/server/serialize.ts).
 * Client-portal logins get the same shape minus fee/notes/checklist fields.
 */
export type CaseSummary = {
  unitId: string;
  clientUnitId: string;
  caseNumber: string | null;
  filingNumber: string | null;
  caseYear: number | null;
  cnr: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  courtName: string | null;
  advocateMobiles: string[];
  primaryAdvocateMobile: string | null;
  opposingParty: string | null;
  ourSide: string | null;
  underActs: string | null;
  policeStation: string | null;
  firNumber: string | null;
  stage: string | null;
  caseType: string | null;
  status: string;
  filingDate: string | null;
  nextHearingAt: string | null;
  agreedFee?: number | null;
  notes?: string | null;
  filingChecklist?: FilingChecklistState;
  battaDue?: boolean;
  awaitingService?: boolean;
  createdAt: string;
};

export type CaseListItem = CaseSummary & { clientName: string | null };

/** Mirrors HearingSummary (features/cases/server/serialize.ts). */
export type HearingSummary = {
  unitId: string;
  caseUnitId: string;
  hearingDate: string;
  purpose: string | null;
  notes: string | null;
  outcome: string | null;
  isAdjourned: boolean;
  smsSentAt: string | null;
  createdAt: string;
};

export type CaseDetailResponse = {
  case: CaseSummary;
  client: Pick<ClientSummary, "unitId" | "name" | "mobile"> | null;
  hearings: HearingSummary[];
  documents: DocumentSummary[];
};

export type CourtMetaLevel = "states" | "districts" | "complexes" | "courts";

export type CourtMetaOption = { code: string; name: string };

export type CourtMetaResponse = {
  options: CourtMetaOption[];
  total: number;
};
