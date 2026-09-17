import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { ApiError } from "@/core/api/client";
import { isWeakPin, PIN_LENGTH } from "@/features/auth/constants";
import { useCheckMobile, useLogin, useSendOtp, useSetupPin, useVerifyOtp } from "@/features/auth/hooks";
import { useResendCountdown } from "@/features/auth/hooks/use-resend-countdown";
import { useAuthStore } from "@/features/auth/store";
import type { LoginStep } from "@/features/auth/types";
import { CredentialsStep } from "./credentials-step";
import { OtpStep } from "./otp-step";
import { PinStep } from "./pin-step";

type ErrorDetails = { retryAfterSec?: number; attemptsRemaining?: number };

function errorDetails(error: unknown): ErrorDetails {
  if (error instanceof ApiError && error.details && typeof error.details === "object") {
    return error.details as ErrorDetails;
  }
  return {};
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Step-machine orchestrator — ports the web's login-form.tsx.
 * Login is a single screen (mobile + PIN together, submitted straight to
 * POST /api/auth/login) rather than a separate mobile-check step; a failed
 * login is only then disambiguated against check-mobile to detect a
 * first-time user (no PIN set yet) vs. a genuinely wrong PIN vs. an
 * unregistered number. "Forgot PIN?" lives on its own route/screen
 * (ForgotPinFlow) rather than as a step here. Kept as one component with
 * local state — not one route per step — since `otpProofToken` is
 * single-use and must not round-trip through router params or survive in
 * the back-stack.
 */
export function LoginFlow() {
  const setSession = useAuthStore((s) => s.setSession);
  const countdown = useResendCountdown(60);

  const checkMobile = useCheckMobile();
  const login = useLogin();
  const sendOtpMutation = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const setupPin = useSetupPin();

  const [step, setStep] = useState<LoginStep>("login");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [otpProofToken, setOtpProofToken] = useState("");
  const [error, setError] = useState("");
  const [pinLocked, setPinLocked] = useState(false);
  const [lockRemainingSec, setLockRemainingSec] = useState(0);

  const busy =
    checkMobile.isPending || login.isPending || sendOtpMutation.isPending || verifyOtp.isPending || setupPin.isPending;

  useEffect(() => {
    if (!pinLocked) return;
    const id = setInterval(() => {
      setLockRemainingSec((s) => {
        if (s <= 1) {
          setPinLocked(false);
          setError("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pinLocked]);

  function resetCodes() {
    setOtp("");
    setPin("");
    setConfirmPin("");
    setOtpProofToken("");
    setError("");
    setPinLocked(false);
    setLockRemainingSec(0);
  }

  function applyPinLock(err: unknown, fallbackSec = 15 * 60) {
    const sec = errorDetails(err).retryAfterSec ?? fallbackSec;
    setPinLocked(true);
    setLockRemainingSec(sec);
    setPin("");
    setError(errorMessage(err, `PIN locked. Use Forgot PIN, or try again in ${sec}s.`));
  }

  async function sendSetupOtp() {
    if (busy) return;
    setError("");
    try {
      await sendOtpMutation.mutateAsync({ mobile, purpose: "setup" });
      countdown.start();
      setOtp("");
      setStep("otp_setup");
    } catch (err) {
      setError(errorMessage(err, "Failed to send OTP"));
    }
  }

  async function handleVerifyOtp() {
    if (busy) return;
    setError("");
    try {
      const data = await verifyOtp.mutateAsync({ mobile, otp, purpose: "setup" });
      setOtpProofToken(data.otpProofToken);
      setPin("");
      setConfirmPin("");
      setStep("setup_pin");
    } catch (err) {
      setError(errorMessage(err, "Incorrect OTP"));
    }
  }

  async function handleLogin() {
    if (busy || pinLocked) return;
    setError("");

    if (mobile.length !== 10 || !/^[6-9]/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number (starts with 6–9)");
      return;
    }
    if (pin.length !== PIN_LENGTH) {
      setError("Enter your 6-digit PIN");
      return;
    }

    try {
      const data = await login.mutateAsync({ mobile, pin });
      setPinLocked(false);
      setLockRemainingSec(0);
      await setSession(data.user, data.accessToken);
      router.replace("/home");
      return;
    } catch (err) {
      const locked = err instanceof ApiError && (err.status === 423 || err.code === "PIN_LOCKED");
      if (locked) {
        applyPinLock(err);
        return;
      }

      // Invalid credentials could mean a wrong PIN, or a first-time user
      // who has no PIN set yet — disambiguate against check-mobile.
      if (err instanceof ApiError && err.code === "INVALID_CREDENTIALS") {
        try {
          const status = await checkMobile.mutateAsync(mobile);
          if (status.status === "otp_required") {
            setPin("");
            await sendSetupOtp();
            return;
          }
          if (status.status === "not_found") {
            setPin("");
            setError(status.message || "This number is not registered. Contact your admin for access.");
            return;
          }
        } catch {
          // Fall through to the original login error below.
        }
      }

      setError(errorMessage(err, "Invalid mobile or PIN"));
      setPin("");
    }
  }

  async function handleSetupPin() {
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
      const data = await setupPin.mutateAsync({ pin, confirmPin, otpProofToken });
      await setSession(data.user, data.accessToken);
      router.replace("/home");
    } catch (err) {
      setError(errorMessage(err, "Failed to set PIN"));
    }
  }

  const lockHint =
    pinLocked && lockRemainingSec > 0 ? `Try again in ${lockRemainingSec}s, or use Forgot PIN.` : undefined;

  const heading =
    step === "login"
      ? {
          title: pinLocked ? "PIN locked" : "Sign in",
          subtitle: pinLocked
            ? `+91 ${mobile}`
            : "Use the mobile number and PIN registered by your office. No public signup.",
        }
      : step === "otp_setup"
        ? { title: "Verify OTP", subtitle: `First-time sign-in — OTP sent to +91 ${mobile}` }
        : { title: "Create PIN", subtitle: "Choose a strong 6-digit PIN for future sign-ins" };

  return (
    <AuthLayout title={heading.title} subtitle={heading.subtitle}>
      {step === "login" ? (
        <CredentialsStep
          mobile={mobile}
          pin={pin}
          loading={busy}
          error={pinLocked ? lockHint : error}
          locked={pinLocked}
          onMobileChange={(value) => {
            setMobile(value);
            if (error && !pinLocked) setError("");
          }}
          onPinChange={(value) => {
            setPin(value);
            if (error && !pinLocked) setError("");
          }}
          onSubmit={handleLogin}
          onForgot={() => router.push("/forgot-pin")}
        />
      ) : null}

      {step === "otp_setup" ? (
        <OtpStep
          otp={otp}
          loading={busy}
          resendActive={countdown.active}
          remaining={countdown.remaining}
          error={error}
          onChange={setOtp}
          onSubmit={handleVerifyOtp}
          onResend={sendSetupOtp}
          onBack={() => {
            resetCodes();
            setStep("login");
          }}
        />
      ) : null}

      {step === "setup_pin" ? (
        <PinStep
          pin={pin}
          confirmPin={confirmPin}
          showConfirm
          loading={busy}
          error={error}
          onPinChange={setPin}
          onConfirmChange={setConfirmPin}
          onSubmit={handleSetupPin}
          onBack={() => {
            resetCodes();
            setStep("login");
          }}
        />
      ) : null}
    </AuthLayout>
  );
}
