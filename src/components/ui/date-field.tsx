import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

type DateFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode?: "date" | "time";
  minimumDate?: Date;
  placeholder?: string;
};

/**
 * Native date/time picker behind a text-field-styled trigger.
 * Android shows its own dialog on demand; iOS needs an explicit sheet + Done
 * button since its inline spinner has no built-in dismiss action.
 */
export function DateField({
  label,
  value,
  onChange,
  mode = "date",
  minimumDate,
  placeholder = "Select",
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setOpen(false);
    if (event.type === "dismissed" || !selected) return;
    onChange(selected);
  }

  const displayText = value
    ? mode === "time"
      ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : value.toLocaleDateString()
    : placeholder;

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-medium text-slate-600">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-14 flex-row items-center rounded-xl border border-slate-200 bg-white px-4"
      >
        <Text className={`text-base ${value ? "text-slate-900" : "text-slate-400"}`}>
          {displayText}
        </Text>
      </Pressable>

      {open && Platform.OS === "android" ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          display="default"
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable className="flex-1 justify-end bg-black/30" onPress={() => setOpen(false)}>
            <Pressable className="rounded-t-2xl bg-white pb-6 pt-2">
              <View className="flex-row justify-end px-4 py-2">
                <Pressable onPress={() => setOpen(false)}>
                  <Text className="text-base font-semibold text-[#162456]">Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={value ?? new Date()}
                mode={mode}
                display="spinner"
                minimumDate={minimumDate}
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
