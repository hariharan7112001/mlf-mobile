import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";

export type PickerOption = { value: string; label: string; sublabel?: string };

type PickerFieldProps = {
  label: string;
  placeholder?: string;
  selectedLabel: string | null;
  options: PickerOption[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (option: PickerOption) => void;
};

/** Text-field-styled trigger that opens a full-screen searchable list — used for advocate/client selection. */
export function PickerField({
  label,
  placeholder = "Select",
  selectedLabel,
  options,
  loading,
  search,
  onSearchChange,
  onSelect,
}: PickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-medium text-slate-600">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-14 flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4"
      >
        <Text
          className={`flex-1 text-base ${selectedLabel ? "text-slate-900" : "text-slate-400"}`}
          numberOfLines={1}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#94a3b8" />
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-white pt-16">
          <View className="flex-row items-center justify-between px-5 pb-4">
            <Text className="text-lg font-semibold text-slate-900">{label}</Text>
            <Pressable onPress={() => setOpen(false)}>
              <Text className="text-base font-medium text-[#162456]">Close</Text>
            </Pressable>
          </View>
          <View className="mx-5 mb-3 h-12 flex-row items-center rounded-xl border border-slate-200 px-3">
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search"
              placeholderTextColor="#94a3b8"
              autoFocus
              className="ml-2 flex-1 text-base text-slate-900"
            />
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            ListEmptyComponent={
              <Text className="mt-6 text-center text-sm text-slate-400">
                {loading ? "Loading…" : "No results"}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="border-b border-slate-100 py-3"
              >
                <Text className="text-base text-slate-900">{item.label}</Text>
                {item.sublabel ? (
                  <Text className="text-sm text-slate-500">{item.sublabel}</Text>
                ) : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
