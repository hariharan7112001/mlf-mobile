import type { KeyboardTypeOptions } from "react-native";
import { Text, TextInput, View } from "react-native";

type TextFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  editable?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  maxLength,
  editable = true,
}: TextFieldProps) {
  return (
    <View className="mb-5">
      {label ? <Text className="mb-2 text-sm font-medium text-slate-600">{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        editable={editable}
        className={`h-14 rounded-xl border border-slate-200 px-4 text-base text-slate-900 ${
          editable ? "bg-white" : "bg-slate-50"
        }`}
      />
    </View>
  );
}
