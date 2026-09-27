import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { ApiError } from "@/core/api/client";
import { FILING_CHECKLIST_ITEMS, type FilingChecklistId } from "../constants";
import { useUpdateFilingChecklist } from "../hooks";
import type { CaseSummary, FilingChecklistState } from "../types";

function CheckRow({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className="flex-row items-center py-2.5 active:opacity-60"
    >
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
        size={22}
        color={checked ? "#162456" : "#94a3b8"}
      />
      <Text className="ml-3 flex-1 text-sm text-slate-800">{label}</Text>
    </Pressable>
  );
}

/** Registry steps until the matter is numbered — same PATCH rules as the web CaseFilingChecklist. */
export function CaseFilingChecklist({ item, canEdit }: { item: CaseSummary; canEdit: boolean }) {
  const mutation = useUpdateFilingChecklist(item.unitId);
  const checklist = item.filingChecklist ?? {};
  const [returnReason, setReturnReason] = useState(checklist.returnReason ?? "");
  const disabled = !canEdit || mutation.isPending;

  async function patch(payload: Parameters<typeof mutation.mutateAsync>[0]) {
    try {
      await mutation.mutateAsync(payload);
    } catch (err) {
      Alert.alert("Checklist", err instanceof ApiError ? err.message : "Failed to update checklist");
    }
  }

  function toggle(id: FilingChecklistId, checked: boolean) {
    const next: FilingChecklistState = { ...checklist, [id]: checked };
    void patch({
      filingChecklist: next,
      ...(id === "batta_due" ? { battaDue: checked } : {}),
      ...(id === "batta_done" && checked ? { battaDue: false } : {}),
      ...(id === "numbered" && checked ? { promoteIfNumbered: true } : {}),
    });
  }

  return (
    <View className="mb-5 rounded-2xl border border-slate-100 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-[#162456]">Filing checklist</Text>
        {mutation.isPending ? <ActivityIndicator size="small" color="#162456" /> : null}
      </View>
      <Text className="mb-2 mt-0.5 text-xs text-slate-500">
        Track registry steps until the matter is numbered
      </Text>

      {FILING_CHECKLIST_ITEMS.map((c) => {
        const checked = Boolean(checklist[c.id]);
        return (
          <CheckRow
            key={c.id}
            label={c.label}
            checked={checked}
            disabled={disabled}
            onToggle={() => toggle(c.id, !checked)}
          />
        );
      })}

      {checklist.returned ? (
        <View className="mt-2">
          <Text className="mb-2 text-sm font-medium text-slate-600">Return / defect reason</Text>
          <TextInput
            value={returnReason}
            onChangeText={setReturnReason}
            editable={!disabled}
            placeholder="e.g. Missing vakalat / court fee short"
            placeholderTextColor="#94a3b8"
            onEndEditing={() => {
              const v = returnReason.trim();
              if (v !== (checklist.returnReason ?? "")) {
                void patch({ filingChecklist: { ...checklist, returnReason: v } });
              }
            }}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900"
          />
        </View>
      ) : null}

      <View className="mt-3 border-t border-slate-100 pt-1">
        <CheckRow
          label="Batta / process due (flag)"
          checked={Boolean(item.battaDue)}
          disabled={disabled}
          onToggle={() => void patch({ filingChecklist: checklist, battaDue: !item.battaDue })}
        />
        <CheckRow
          label="Awaiting service"
          checked={Boolean(item.awaitingService)}
          disabled={disabled}
          onToggle={() =>
            void patch({ filingChecklist: checklist, awaitingService: !item.awaitingService })
          }
        />
      </View>
    </View>
  );
}
