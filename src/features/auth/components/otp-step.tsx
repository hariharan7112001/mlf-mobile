import { Text, View } from "react-native";
import { CodeInput } from "@/components/ui/code-input";
import { ErrorMessage } from "@/components/ui/error-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { OTP_LENGTH } from "@/features/auth/constants";

type OtpStepProps = {
  otp: string;
  loading: boolean;
  error?: string;
  resendActive: boolean;
  remaining: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
};

/** Shared OTP entry — reused for first-time setup and forgot-PIN. */
export function OtpStep({
  otp,
  loading,
  error,
  resendActive,
  remaining,
  onChange,
  onSubmit,
  onResend,
  onBack,
}: OtpStepProps) {
  const canSubmit = !loading && otp.length === OTP_LENGTH;

  return (
    <View>
      <ErrorMessage message={error} />

      <CodeInput length={OTP_LENGTH} value={otp} onChange={onChange} autoFocus error={Boolean(error)} />

      <View className="mb-2 mt-4 items-center">
        {resendActive ? (
          <Text className="py-3 text-sm text-slate-400">Resend OTP in {remaining}s</Text>
        ) : (
          <SecondaryButton label="Resend OTP" onPress={onResend} disabled={loading} />
        )}
      </View>

      <View className="mt-4">
        <PrimaryButton label="Verify" onPress={onSubmit} loading={loading} disabled={!canSubmit} />
      </View>

      <SecondaryButton label="Back" onPress={onBack} disabled={loading} />
    </View>
  );
}
