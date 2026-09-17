import { Pressable, Text, View } from "react-native";

type PillOption<T extends string> = { value: T; label: string };

type PillSelectProps<T extends string> = {
  label?: string;
  options: readonly PillOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
};

/** Row of selectable pills — used for small enums like gender and appointment mode. */
export function PillSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: PillSelectProps<T>) {
  return (
    <View className="mb-5">
      {label ? <Text className="mb-2 text-sm font-medium text-slate-600">{label}</Text> : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className={`rounded-full border px-4 py-2 ${
                active ? "border-[#162456] bg-[#162456]" : "border-slate-200 bg-white"
              }`}
            >
              <Text className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
