import { Text, TextInput, View } from "react-native";

type MobileInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
};

export function MobileInput({ value, onChange, autoFocus, editable = true }: MobileInputProps) {
  return (
    <View className="mb-5 h-14 flex-row items-center rounded-xl border border-slate-200 bg-white px-4">
      <Text className="mr-2 text-base font-medium text-slate-500">+91</Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, 10))}
        keyboardType="number-pad"
        maxLength={10}
        autoFocus={autoFocus}
        editable={editable}
        placeholder="10-digit mobile number"
        placeholderTextColor="#94a3b8"
        className="h-full flex-1 text-base text-slate-900"
      />
    </View>
  );
}
