import { apiGet, apiPost } from "@/core/api/client";
import { AUTH_API } from "./constants";
import type { CheckMobileStatus, OtpPurpose, PublicUser } from "./types";

export type CheckMobileResponse = {
  status: CheckMobileStatus;
  message?: string;
};

export type LoginResponse = {
  message: string;
  user: PublicUser;
  accessToken: string;
};

export type SendOtpResponse = {
  message: string;
  expiresIn: number;
};

export type VerifyOtpResponse = {
  verified: boolean;
  otpProofToken: string;
  requiresPinSetup: boolean;
};

export type SetPinResponse = {
  message: string;
  user: PublicUser;
  accessToken: string;
};

export type MeResponse = { user: PublicUser };

export function checkMobile(mobile: string) {
  return apiPost<CheckMobileResponse>(AUTH_API.checkMobile, { mobile });
}

export function login(mobile: string, pin: string) {
  return apiPost<LoginResponse>(AUTH_API.login, { mobile, pin });
}

export function sendOtp(mobile: string, purpose: OtpPurpose) {
  return apiPost<SendOtpResponse>(AUTH_API.sendOtp, { mobile, purpose });
}

export function verifyOtp(mobile: string, otp: string, purpose: OtpPurpose) {
  return apiPost<VerifyOtpResponse>(AUTH_API.verifyOtp, { mobile, otp, purpose });
}

export function setupPin(pin: string, confirmPin: string, otpProofToken: string) {
  return apiPost<SetPinResponse>(AUTH_API.setupPin, { pin, confirmPin, otpProofToken });
}

export function forgotPinReset(pin: string, confirmPin: string, otpProofToken: string) {
  return apiPost<SetPinResponse>(AUTH_API.forgotPinReset, { pin, confirmPin, otpProofToken });
}

export function getMe() {
  return apiGet<MeResponse>(AUTH_API.me);
}

export function logout() {
  return apiPost<{ message: string }>(AUTH_API.logout);
}
