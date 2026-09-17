export const PIN_LENGTH = 6;
export const OTP_LENGTH = 4;

/** Auth API paths — mirrors the backend's lib/auth/login-flow.ts AUTH_API map. */
export const AUTH_API = {
  checkMobile: "/api/auth/check-mobile",
  login: "/api/auth/login",
  sendOtp: "/api/auth/send-otp",
  verifyOtp: "/api/auth/verify-otp",
  setupPin: "/api/auth/setup-pin",
  forgotPinReset: "/api/auth/forgot-pin/reset",
  me: "/api/auth/me",
  logout: "/api/auth/logout",
} as const;

const WEAK_PINS = new Set([
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "123456",
  "654321",
  "112233",
  "121212",
  "012345",
  "987654",
]);

/** Ported verbatim from the backend's lib/auth/pin-rules.ts to keep client/server rules identical. */
export function isWeakPin(pin: string): boolean {
  if (!/^\d{6}$/.test(pin)) return true;
  if (WEAK_PINS.has(pin)) return true;

  let ascending = true;
  let descending = true;
  for (let i = 1; i < pin.length; i++) {
    if (Number(pin[i]) !== Number(pin[i - 1]) + 1) ascending = false;
    if (Number(pin[i]) !== Number(pin[i - 1]) - 1) descending = false;
  }
  return ascending || descending;
}
