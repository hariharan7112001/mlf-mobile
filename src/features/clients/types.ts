/** Mirrors the backend's ClientSummary contract (features/clients/server/serialize.ts). */
export type ClientSummary = {
  unitId: string;
  name: string;
  fatherOrSpouse: string | null;
  occupation: string | null;
  gender: string | null;
  mobile: string;
  altMobile: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  aadhaarLast4: string | null;
  referredBy: string | null;
  matterBrief: string | null;
  notes: string | null;
  smsConsent: boolean;
  createdAt: string;
};

export type ClientCaseSummary = {
  unitId: string;
  caseNumber: string | null;
  courtName: string | null;
  status: string;
  nextHearingAt: string | null;
  agreedFee: number | null;
};
