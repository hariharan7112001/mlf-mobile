/** Case API paths — mirrors app/api/cases/**, app/api/hearings/**, app/api/courts/meta. */
export const CASES_API = {
  list: "/api/cases",
  create: "/api/cases",
  detail: (unitId: string) => `/api/cases/${unitId}`,
  status: (unitId: string) => `/api/cases/${unitId}/status`,
  checklist: (unitId: string) => `/api/cases/${unitId}/checklist`,
  hearings: (unitId: string) => `/api/cases/${unitId}/hearings`,
  adjournHearing: (hearingUnitId: string) => `/api/hearings/${hearingUnitId}/adjourn`,
  courtsMeta: "/api/courts/meta",
} as const;

/** Office pipeline status — mirrors config/company/case-pipeline.ts. */
export const CASE_PIPELINE_STATUSES = [
  "enquiry",
  "engaged",
  "pre_filing",
  "under_filing",
  "filing_defect",
  "active",
  "reserved",
  "disposed",
  "withdrawn",
  "transferred",
  "archived",
] as const;

export type CaseStatus = (typeof CASE_PIPELINE_STATUSES)[number];

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  enquiry: "Enquiry",
  engaged: "Engaged",
  pre_filing: "Pre-filing",
  under_filing: "Filing",
  filing_defect: "Defect",
  active: "Active",
  reserved: "Reserved",
  disposed: "Disposed",
  withdrawn: "Withdrawn",
  transferred: "Transferred",
  archived: "Archived",
};

export const CASE_STATUS_STYLE: Record<CaseStatus, { bg: string; text: string }> = {
  enquiry: { bg: "bg-slate-100", text: "text-slate-600" },
  engaged: { bg: "bg-amber-50", text: "text-amber-700" },
  pre_filing: { bg: "bg-orange-50", text: "text-orange-700" },
  under_filing: { bg: "bg-sky-50", text: "text-sky-700" },
  filing_defect: { bg: "bg-red-50", text: "text-red-700" },
  active: { bg: "bg-indigo-50", text: "text-indigo-700" },
  reserved: { bg: "bg-amber-50", text: "text-amber-700" },
  disposed: { bg: "bg-emerald-50", text: "text-emerald-700" },
  withdrawn: { bg: "bg-slate-100", text: "text-slate-500" },
  transferred: { bg: "bg-slate-100", text: "text-slate-500" },
  archived: { bg: "bg-slate-100", text: "text-slate-500" },
};

/** Allowed moves — the server enforces the same table (canTransitionStatus). */
export const CASE_STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  enquiry: ["engaged", "withdrawn"],
  engaged: ["pre_filing", "enquiry", "withdrawn"],
  pre_filing: ["under_filing", "engaged", "withdrawn"],
  under_filing: ["filing_defect", "active", "pre_filing", "withdrawn"],
  filing_defect: ["under_filing", "active", "withdrawn"],
  active: ["reserved", "disposed", "filing_defect", "withdrawn", "transferred"],
  reserved: ["disposed", "active", "withdrawn", "transferred"],
  disposed: ["archived", "active"],
  withdrawn: ["archived", "enquiry"],
  transferred: ["archived"],
  archived: ["active"],
};

/** Statuses that still need office filing work — filing checklist is shown for these. */
export const PRE_NUMBER_STATUSES: CaseStatus[] = [
  "enquiry",
  "engaged",
  "pre_filing",
  "under_filing",
  "filing_defect",
];

export function normalizeCaseStatus(raw: string): CaseStatus {
  if (raw === "pending") return "pre_filing";
  if (raw === "listed") return "active";
  return (CASE_PIPELINE_STATUSES as readonly string[]).includes(raw)
    ? (raw as CaseStatus)
    : "pre_filing";
}

export const FILING_CHECKLIST_ITEMS = [
  { id: "conflict_check", label: "Conflict check done" },
  { id: "vakalatnama", label: "Vakalatnama ready / filed" },
  { id: "petition_ready", label: "Petition / plaint ready" },
  { id: "court_fee", label: "Court fee / stamp paid" },
  { id: "postal_dak", label: "Postal / dak entry" },
  { id: "presented", label: "Presented at registry" },
  { id: "returned", label: "Returned (defect)" },
  { id: "re_presented", label: "Re-presented" },
  { id: "numbered", label: "Numbered (case no. / CNR)" },
  { id: "batta_due", label: "Batta / process due" },
  { id: "batta_done", label: "Batta / process done" },
  { id: "certified_copy", label: "Certified copy applied" },
] as const;

export type FilingChecklistId = (typeof FILING_CHECKLIST_ITEMS)[number]["id"];

export const CASE_TYPE_GROUPS = [
  {
    group: "Civil",
    types: [
      { value: "OS", label: "OS — Original Suit" },
      { value: "CS", label: "CS — Civil Suit" },
      { value: "CIBIL", label: "CIBIL — Credit / recovery suit" },
      { value: "WP", label: "WP — Writ Petition" },
      { value: "WA", label: "WA — Writ Appeal" },
      { value: "AS", label: "AS — Appeal Suit" },
      { value: "CMA", label: "CMA — Civil Misc. Appeal" },
      { value: "CRP", label: "CRP — Civil Revision Petition" },
      { value: "EP", label: "EP — Execution Petition" },
      { value: "IA", label: "IA — Interlocutory Application" },
      { value: "OP", label: "OP — Original Petition" },
    ],
  },
  {
    group: "Criminal",
    types: [
      { value: "CC", label: "CC — Calendar Case" },
      { value: "STC", label: "STC — Summary Trial Case" },
      { value: "SC", label: "SC — Sessions Case" },
      { value: "CRL.A", label: "CRL.A — Criminal Appeal" },
      { value: "CRL.RC", label: "CRL.RC — Criminal Revision" },
      { value: "CRL.OP", label: "CRL.OP — Criminal O.P." },
      { value: "Bail", label: "Bail Application" },
      { value: "NBW", label: "NBW / Warrant related" },
    ],
  },
  {
    group: "Family / others",
    types: [
      { value: "HMOP", label: "HMOP — Hindu Marriage O.P." },
      { value: "MC", label: "MC — Matrimonial Case" },
      { value: "MACT", label: "MACT — Motor Accident Claim" },
      { value: "Consumer", label: "Consumer Complaint" },
      { value: "Labour", label: "Labour / Industrial" },
      { value: "Other", label: "Other" },
    ],
  },
] as const;

export const CASE_TYPE_OPTIONS = CASE_TYPE_GROUPS.flatMap((g) =>
  g.types.map((t) => ({ value: t.value as string, label: t.label as string, sublabel: g.group }))
);

export const OUR_SIDE_OPTIONS = [
  { value: "petitioner", label: "Petitioner / Plaintiff" },
  { value: "respondent", label: "Respondent / Defendant" },
  { value: "complainant", label: "Complainant" },
  { value: "accused", label: "Accused" },
  { value: "appellant", label: "Appellant" },
  { value: "other", label: "Other" },
] as const;

export type OurSide = (typeof OUR_SIDE_OPTIONS)[number]["value"];

export const UNDER_ACTS_OPTIONS = [
  "IPC",
  "BNS 2023",
  "CrPC / BNSS",
  "NI Act — Sec 138",
  "Domestic Violence Act",
  "Hindu Marriage Act",
  "CPC",
  "Motor Vehicles Act",
  "Labour / Industrial",
  "Consumer Protection Act",
  "POCSO",
  "SC/ST Act",
].map((v) => ({ value: v, label: v }));

export const ADJOURN_OUTCOME_OPTIONS = [
  "Adjourned — counsel request",
  "Adjourned — party request",
  "Adjourned — court busy",
  "Adjourned — for evidence",
  "Adjourned — for arguments",
  "Adjourned — for judgment",
  "Part-heard",
  "Not reached",
].map((v) => ({ value: v, label: v }));

export function caseYearOptions(span = 15) {
  const y = new Date().getFullYear();
  return Array.from({ length: span }, (_, i) => ({ value: String(y - i), label: String(y - i) }));
}

/** Normalize CNR: strip spaces/dashes, uppercase — mirrors config/company/case-types.ts. */
export function normalizeCnr(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

export function isValidCnr(input: string): boolean {
  const n = normalizeCnr(input);
  return !n || /^[A-Z0-9]{16}$/.test(n);
}

export type CaseQuickFilter = "all" | "today" | "week" | "missingNumber" | "battaDue" | "defect";

export const CASE_QUICK_FILTERS: { value: CaseQuickFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Hearing today" },
  { value: "week", label: "This week" },
  { value: "missingNumber", label: "No case no." },
  { value: "battaDue", label: "Batta due" },
  { value: "defect", label: "Defects" },
];
