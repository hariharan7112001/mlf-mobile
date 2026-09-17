export type LoginStep = "login" | "otp_setup" | "setup_pin";

export type CheckMobileStatus = "pin" | "otp_required" | "not_found";

export type OtpPurpose = "setup" | "forgot_pin";

/** Mirrors the backend's PublicUser contract exactly (lib/auth/session.ts). */
export type PublicUser = {
  unitId: string;
  mobile: string;
  roles: string[];
  name?: string;
  designation?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  clientUnitId?: string;
  permissions: string[];
};
