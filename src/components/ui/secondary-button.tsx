import { Pressable, Text } from "react-native";

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SecondaryButton({ label, onPress, disabled }: SecondaryButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} className="items-center justify-center py-3">
      <Text className={`text-sm font-medium ${disabled ? "text-slate-300" : "text-[#208AEF]"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
