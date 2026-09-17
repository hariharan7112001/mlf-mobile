import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as authApi from "./api";
import { useAuthStore } from "./store";
import type { OtpPurpose } from "./types";

export function useCheckMobile() {
  return useMutation({
    mutationFn: (mobile: string) => authApi.checkMobile(mobile),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ mobile, pin }: { mobile: string; pin: string }) =>
      authApi.login(mobile, pin),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ mobile, purpose }: { mobile: string; purpose: OtpPurpose }) =>
      authApi.sendOtp(mobile, purpose),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({
      mobile,
      otp,
      purpose,
    }: {
      mobile: string;
      otp: string;
      purpose: OtpPurpose;
    }) => authApi.verifyOtp(mobile, otp, purpose),
  });
}

export function useSetupPin() {
  return useMutation({
    mutationFn: ({
      pin,
      confirmPin,
      otpProofToken,
    }: {
      pin: string;
      confirmPin: string;
      otpProofToken: string;
    }) => authApi.setupPin(pin, confirmPin, otpProofToken),
  });
}

export function useForgotPinReset() {
  return useMutation({
    mutationFn: ({
      pin,
      confirmPin,
      otpProofToken,
    }: {
      pin: string;
      confirmPin: string;
      otpProofToken: string;
    }) => authApi.forgotPinReset(pin, confirmPin, otpProofToken),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout().catch(() => undefined),
    onSettled: () => {
      clearSession();
      queryClient.clear();
      router.replace("/login");
    },
  });
}
