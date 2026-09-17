import { Text, View } from "react-native";
import { CodeInput } from "@/components/ui/code-input";
import { ErrorMessage } from "@/components/ui/error-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { PIN_LENGTH } from "@/features/auth/constants";

type PinStepProps = {
  pin: string;
  confirmPin?: string;
  /** Adds a second "confirm PIN" box — used for set/reset PIN. */
  showConfirm?: boolean;
  loading: boolean;
  error?: string;
  submitLabel?: string;
  onPinChange: (value: string) => void;
  onConfirmChange?: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

/** Shared PIN entry — reused for set PIN and reset PIN. */
export function PinStep({
  pin,
  confirmPin = "",
  showConfirm,
  loading,
  error,
  submitLabel = "Continue",
  onPinChange,
  onConfirmChange,
  onSubmit,
  onBack,
}: PinStepProps) {
  const canSubmit =
    !loading && pin.length === PIN_LENGTH && (!showConfirm || confirmPin.length === PIN_LENGTH);

  return (
    <View>
      <ErrorMessage message={error} />

      <View>
        {showConfirm ? <Text className="mb-2 text-xs font-medium text-slate-500">New PIN</Text> : null}
        <CodeInput length={PIN_LENGTH} value={pin} onChange={onPinChange} secure autoFocus error={Boolean(error)} />
      </View>

      {showConfirm ? (
        <View className="mt-5">
          <Text className="mb-2 text-xs font-medium text-slate-500">Confirm PIN</Text>
          <CodeInput
            length={PIN_LENGTH}
            value={confirmPin}
            onChange={onConfirmChange ?? (() => {})}
            secure
          />
        </View>
      ) : null}

      <View className="mt-6">
        <PrimaryButton label={submitLabel} onPress={onSubmit} loading={loading} disabled={!canSubmit} />
      </View>

      <SecondaryButton label="Back" onPress={onBack} disabled={loading} />
    </View>
  );
}
