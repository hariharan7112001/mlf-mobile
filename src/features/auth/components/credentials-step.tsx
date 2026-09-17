import { Text, View } from "react-native";
import { CodeInput } from "@/components/ui/code-input";
import { ErrorMessage } from "@/components/ui/error-message";
import { MobileInput } from "@/components/ui/mobile-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { PIN_LENGTH } from "@/features/auth/constants";

type CredentialsStepProps = {
  mobile: string;
  pin: string;
  loading: boolean;
  error?: string;
  locked?: boolean;
  onMobileChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onSubmit: () => void;
  onForgot: () => void;
};

/** Login screen: mobile number + 6-digit PIN together, posts straight to POST /api/auth/login. */
export function CredentialsStep({
  mobile,
  pin,
  loading,
  error,
  locked,
  onMobileChange,
  onPinChange,
  onSubmit,
  onForgot,
}: CredentialsStepProps) {
  const canSubmit =
    !loading && !locked && mobile.length === 10 && /^[6-9]/.test(mobile) && pin.length === PIN_LENGTH;

  return (
    <View>
      <ErrorMessage message={error} />

      <MobileInput value={mobile} onChange={onMobileChange} autoFocus editable={!locked} />

      <Text className="mb-2 text-xs font-medium text-slate-500">PIN</Text>
      <CodeInput length={PIN_LENGTH} value={pin} onChange={onPinChange} secure error={Boolean(error)} />

      <View className="mt-2">
        <SecondaryButton label="Forgot PIN?" onPress={onForgot} disabled={loading} />
      </View>

      <View className="mt-4">
        <PrimaryButton label="Login" onPress={onSubmit} loading={loading} disabled={!canSubmit} />
      </View>
    </View>
  );
}
