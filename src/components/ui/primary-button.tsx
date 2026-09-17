import { ActivityIndicator, Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, loading, disabled }: PrimaryButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`h-14 items-center justify-center rounded-xl ${
        isDisabled ? "bg-slate-300" : "bg-[#208AEF]"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-base font-semibold text-white">{label}</Text>
      )}
    </Pressable>
  );
}
