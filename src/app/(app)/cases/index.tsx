import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppHeader } from "@/components/app-header";
import { ErrorMessage } from "@/components/ui/error-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ApiError } from "@/core/api/client";
import { useDebouncedValue } from "@/core/use-debounced-value";
import { usePermission } from "@/features/auth/permissions";
import { CaseStatusBadge } from "@/features/cases/components/case-status-badge";
import { CASE_QUICK_FILTERS, type CaseQuickFilter } from "@/features/cases/constants";
import { useCases } from "@/features/cases/hooks";
import type { CaseListItem } from "@/features/cases/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function CaseRow({ item }: { item: CaseListItem }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/cases/[unitId]", params: { unitId: item.unitId } })}
      className="mb-3 rounded-2xl border border-slate-100 bg-white p-4 active:opacity-70"
    >
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
            {item.caseNumber || item.filingNumber || item.unitId}
          </Text>
          <Text className="mt-0.5 text-sm text-slate-500" numberOfLines={1}>
            {item.clientName ?? item.clientUnitId}
            {item.opposingParty ? ` vs ${item.opposingParty}` : ""}
          </Text>
        </View>
        <CaseStatusBadge status={item.status} />
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-1">
        {item.caseType ? (
          <Text className="text-xs font-medium text-slate-600">{item.caseType}</Text>
        ) : null}
        {item.courtName ? (
          <Text className="flex-shrink text-xs text-slate-500" numberOfLines={1}>
            {item.courtName}
          </Text>
        ) : null}
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-slate-500">
          {item.nextHearingAt ? `Next hearing: ${formatDate(item.nextHearingAt)}` : "No hearing date"}
        </Text>
        <View className="flex-row items-center gap-2">
          {item.battaDue ? (
            <Text className="text-xs font-semibold text-amber-700">Batta due</Text>
          ) : null}
          <Text className="text-xs text-slate-400">{item.unitId}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function CasesListScreen() {
  const [search, setSearch] = useState("");
  const [quick, setQuick] = useState<CaseQuickFilter>("all");
  const debounced = useDebouncedValue(search.trim());
  const canView = usePermission("cases", "view");
  const canCreate = usePermission("cases", "create");

  const { data, isLoading, isFetching, refetch, error } = useCases({
    q: debounced || undefined,
    quick,
  });

  if (!canView) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title="Cases" />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="lock-closed-outline" size={28} color="#162456" />
          <Text className="mt-3 text-center text-sm text-slate-500">
            You don&apos;t have access to cases. Ask your admin to grant “Cases · View”.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Cases" />
      <View className="flex-1">
        <View className="px-5 pt-4">
          <View className="mb-3 h-12 flex-row items-center rounded-xl border border-slate-200 bg-white px-3">
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Case no., CSE id, client id, court, party"
              placeholderTextColor="#94a3b8"
              className="ml-2 flex-1 text-base text-slate-900"
            />
          </View>
        </View>

        <View className="mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {CASE_QUICK_FILTERS.map((f) => {
              const active = f.value === quick;
              return (
                <Pressable
                  key={f.value}
                  onPress={() => setQuick(f.value)}
                  className={`rounded-full border px-4 py-2 ${
                    active ? "border-[#162456] bg-[#162456]" : "border-slate-200 bg-white"
                  }`}
                >
                  <Text className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1 px-5">
          <ErrorMessage message={error instanceof ApiError ? error.message : undefined} />
          {isLoading ? (
            <ActivityIndicator className="mt-10" color="#162456" />
          ) : (
            <FlatList
              data={data ?? []}
              keyExtractor={(item) => item.unitId}
              renderItem={({ item }) => <CaseRow item={item} />}
              refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
              ListEmptyComponent={
                <View className="mt-16 items-center px-6">
                  <Ionicons name="briefcase-outline" size={28} color="#162456" />
                  <Text className="mt-3 text-center text-sm text-slate-500">
                    {debounced || quick !== "all" ? "No cases match these filters." : "No cases yet."}
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {canCreate ? (
          <View className="px-5 pb-4 pt-2">
            <PrimaryButton label="Register Case" onPress={() => router.push("/cases/new")} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
