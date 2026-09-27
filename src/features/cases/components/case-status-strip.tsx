import { Alert, Pressable, Text, View } from "react-native";
import { ApiError } from "@/core/api/client";
import {
  CASE_STATUS_LABEL,
  CASE_STATUS_TRANSITIONS,
  normalizeCaseStatus,
  type CaseStatus,
} from "../constants";
import { useUpdateCaseStatus } from "../hooks";
import type { CaseSummary } from "../types";
import { CaseStatusBadge } from "./case-status-badge";

/** Current pipeline status + the moves the server allows from it (canTransitionStatus). */
export function CaseStatusStrip({ item, canEdit }: { item: CaseSummary; canEdit: boolean }) {
  const mutation = useUpdateCaseStatus(item.unitId);
  const current = normalizeCaseStatus(item.status);
  const next = CASE_STATUS_TRANSITIONS[current];

  function confirmMove(to: CaseStatus) {
    Alert.alert(
      "Change status?",
      `${CASE_STATUS_LABEL[current]} → ${CASE_STATUS_LABEL[to]}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Change",
          onPress: async () => {
            try {
              await mutation.mutateAsync(to);
            } catch (err) {
              Alert.alert("Status", err instanceof ApiError ? err.message : "Could not change status.");
            }
          },
        },
      ]
    );
  }

  return (
    <View className="mb-5 rounded-2xl border border-slate-100 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-600">Office status</Text>
        <CaseStatusBadge status={item.status} />
      </View>
      {canEdit && next.length > 0 ? (
        <>
          <Text className="mb-2 mt-3 text-xs text-slate-500">Move to</Text>
          <View className="flex-row flex-wrap gap-2">
            {next.map((to) => (
              <Pressable
                key={to}
                disabled={mutation.isPending}
                onPress={() => confirmMove(to)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 active:opacity-60"
              >
                <Text className="text-sm font-medium text-[#162456]">{CASE_STATUS_LABEL[to]}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}
