import { Text, TextInput, View } from "react-native";

type TextAreaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

export function TextArea({ label, value, onChange, placeholder, maxLength }: TextAreaProps) {
  return (
    <View className="mb-5">
      {label ? <Text className="mb-2 text-sm font-medium text-slate-600">{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        maxLength={maxLength}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        className="min-h-[100px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900"
      />
    </View>
  );
}
