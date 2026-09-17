/** Leave API paths — mirrors app/api/hrms/leave/**. */
export const LEAVE_API = {
  apply: "/api/hrms/leave",
  list: "/api/hrms/leave",
  cancel: (unitId: string) => `/api/hrms/leave/${unitId}/cancel`,
} as const;
