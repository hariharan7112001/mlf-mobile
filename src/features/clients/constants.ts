/** Client API paths — mirrors app/api/clients/**. */
export const CLIENTS_API = {
  list: "/api/clients",
  create: "/api/clients",
  detail: (unitId: string) => `/api/clients/${unitId}`,
} as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
] as const;
