/** Attendance API paths — mirrors app/api/hrms/attendance/**. */
export const ATTENDANCE_API = {
  checkIn: "/api/hrms/attendance/check-in",
  checkOut: "/api/hrms/attendance/check-out",
  list: "/api/hrms/attendance",
} as const;
