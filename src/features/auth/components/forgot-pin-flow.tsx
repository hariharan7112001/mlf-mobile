import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { AuthLayout } from "@/components/auth-layout";
import { ErrorMessage } from "@/components/ui/error-message";
import { MobileInput } from "@/components/ui/mobile-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { ApiError } from "@/core/api/client";
import { isWeakPin } from "@/features/auth/constants";
import { useForgotPinReset, useSendOtp, useVerifyOtp } from "@/features/auth/hooks";
import { useResendCountdown } from "@/features/auth/hooks/use-resend-countdown";
import { useAuthStore } from "@/features/auth/store";
import { OtpStep } from "./otp-step";
import { PinStep } from "./pin-step";

type ForgotPinStep = "mobile" | "otp" | "reset_pin";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Standalone "Forgot PIN?" screen: mobile → OTP → new PIN. Kept as one
 * component with local state — not one route per step — since
 * `otpProofToken` is single-use and must not round-trip through router
 * params or survive in the back-stack.
 */
export function ForgotPinFlow() {
  const setSession = useAuthStore((s) => s.setSession);
  const countdown = useResendCountdown(60);

  const sendOtpMutation = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const forgotPinReset = useForgotPinReset();

  const [step, setStep] = useState<ForgotPinStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [otpProofToken, setOtpProofToken] = useState("");
  const [error, setError] = useState("");

  const busy = sendOtpMutation.isPending || verifyOtp.isPending || forgotPinReset.isPending;
  const canSendOtp = mobile.length === 10 && /^[6-9]/.test(mobile) && !busy;

  async function handleSendOtp() {
    if (busy) return;
    setError("");
    if (mobile.length !== 10 || !/^[6-9]/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number (starts with 6–9)");
      return;
    }

    try {
      await sendOtpMutation.mutateAsync({ mobile, purpose: "forgot_pin" });
      countdown.start();
      setOtp("");
      setStep("otp");
    } catch (err) {
      setError(errorMessage(err, "Failed to send OTP"));
    }
  }

  async function handleVerifyOtp() {
    if (busy) return;
    setError("");
    try {
      const data = await verifyOtp.mutateAsync({ mobile, otp, purpose: "forgot_pin" });
      setOtpProofToken(data.otpProofToken);
      setPin("");
      setConfirmPin("");
      setStep("reset_pin");
    } catch (err) {
      setError(errorMessage(err, "Incorrect OTP"));
    }
  }

  async function handleResetPin() {
    if (busy) return;
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    if (isWeakPin(pin)) {
      setError("Choose a stronger 6-digit PIN. Avoid sequences like 123456 or repeated digits.");
      return;
    }

    setError("");
    try {
      const data = await forgotPinReset.mutateAsync({ pin, confirmPin, otpProofToken });
      await setSession(data.user, data.accessToken);
      router.replace("/home");
    } catch (err) {
      setError(errorMessage(err, "Failed to reset PIN"));
    }
  }

  const heading =
    step === "mobile"
      ? { title: "Reset PIN", subtitle: "Enter your registered mobile number to get an OTP." }
      : step === "otp"
        ? { title: "Reset PIN", subtitle: `OTP sent to +91 ${mobile}` }
        : { title: "New PIN", subtitle: "Choose a new 6-digit PIN" };

  return (
    <AuthLayout title={heading.title} subtitle={heading.subtitle}>
      {step === "mobile" ? (
        <View>
          <ErrorMessage message={error} />
          <MobileInput
            value={mobile}
            onChange={(value) => {
              setMobile(value);
              if (error) setError("");
            }}
            autoFocus
          />
          <PrimaryButton label="Send OTP" onPress={handleSendOtp} loading={busy} disabled={!canSendOtp} />
          <SecondaryButton label="Back to login" onPress={() => router.back()} disabled={busy} />
        </View>
      ) : null}

      {step === "otp" ? (
        <OtpStep
          otp={otp}
          loading={busy}
          resendActive={countdown.active}
          remaining={countdown.remaining}
          error={error}
          onChange={setOtp}
          onSubmit={handleVerifyOtp}
          onResend={handleSendOtp}
          onBack={() => {
            setError("");
            setOtp("");
            setStep("mobile");
          }}
        />
      ) : null}

      {step === "reset_pin" ? (
        <PinStep
          pin={pin}
          confirmPin={confirmPin}
          showConfirm
          loading={busy}
          error={error}
          submitLabel="Save new PIN"
          onPinChange={setPin}
          onConfirmChange={setConfirmPin}
          onSubmit={handleResetPin}
          onBack={() => {
            setError("");
            setPin("");
            setConfirmPin("");
            setStep("mobile");
          }}
        />
      ) : null}
    </AuthLayout>
  );
}
