import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { HearingSummary } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  caseUnitId: string;
  hearings: HearingSummary[];
  canEdit: boolean;
  /** Client-portal logins get hearing dates without internal notes. */
  clientPortal: boolean;
};

export function CaseHearingsPanel({ caseUnitId, hearings, canEdit, clientPortal }: Props) {
  return (
    <View className="mb-5 rounded-2xl border border-slate-100 bg-white p-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-[#162456]">Hearings</Text>
        {canEdit ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/cases/[unitId]/hearing", params: { unitId: caseUnitId } })
            }
            className="flex-row items-center rounded-full bg-[#162456] px-3 py-1.5 active:opacity-70"
          >
            <Ionicons name="add" size={15} color="#FFFFFF" />
            <Text className="ml-1 text-xs font-semibold text-white">Add hearing</Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="mb-2 text-xs text-slate-500">
        {clientPortal ? "Upcoming and past hearing dates" : "Diary dates, outcomes and SMS status"}
      </Text>

      {hearings.length === 0 ? (
        <Text className="py-4 text-center text-sm text-slate-400">No hearings recorded yet.</Text>
      ) : (
        hearings.map((h) => (
          <View key={h.unitId} className="border-b border-slate-100 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-900">{formatDate(h.hearingDate)}</Text>
              {h.isAdjourned ? (
                <Text className="text-xs font-semibold text-amber-700">Adjourned</Text>
              ) : canEdit ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/cases/[unitId]/adjourn",
                      params: { unitId: caseUnitId, hearingUnitId: h.unitId },
                    })
                  }
                  hitSlop={6}
                >
                  <Text className="text-xs font-semibold text-[#162456]">Adjourn</Text>
                </Pressable>
              ) : null}
            </View>
            {h.purpose ? <Text className="mt-0.5 text-sm text-slate-600">{h.purpose}</Text> : null}
            {h.outcome ? <Text className="mt-0.5 text-xs text-slate-500">Outcome: {h.outcome}</Text> : null}
            {h.notes ? <Text className="mt-0.5 text-xs text-slate-500">{h.notes}</Text> : null}
            {!clientPortal && h.smsSentAt ? (
              <Text className="mt-0.5 text-xs text-emerald-700">SMS sent to client</Text>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}
