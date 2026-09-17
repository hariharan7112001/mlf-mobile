import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCancelLeave, useMyLeave } from "@/features/leave/hooks";
import type { LeaveSummary } from "@/features/leave/types";

function formatRange(from: string, to: string) {
  return from === to ? from : `${from} → ${to}`;
}

function LeaveRow({ item }: { item: LeaveSummary }) {
  const cancelLeave = useCancelLeave();
  const canCancel = item.status === "pending" || item.status === "approved";

  return (
    <View className="mb-3 rounded-2xl border border-slate-100 bg-white p-4">
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="flex-1 pr-3 text-base font-semibold text-slate-900">
          {formatRange(item.fromDate, item.toDate)}
        </Text>
        <StatusBadge status={item.status} />
      </View>
      {item.reason ? <Text className="mb-3 text-sm text-slate-500">{item.reason}</Text> : null}
      {item.status === "rejected" && item.rejectReason ? (
        <Text className="mb-3 text-sm text-red-600">Reason: {item.rejectReason}</Text>
      ) : null}
      {canCancel ? (
        <Pressable
          onPress={() => cancelLeave.mutate(item.unitId)}
          disabled={cancelLeave.isPending}
          className="self-start"
        >
          <Text className="text-sm font-medium text-red-600">
            {cancelLeave.isPending ? "Cancelling…" : "Cancel"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function LeaveListScreen() {
  const { data, isLoading, isFetching, refetch } = useMyLeave();

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Leave" showBack onBack={() => router.replace("/home")} />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1 px-5 pt-4">
          {isLoading ? (
            <ActivityIndicator className="mt-10" color="#162456" />
          ) : (
            <FlatList
              data={data ?? []}
              keyExtractor={(item) => item.unitId}
              renderItem={({ item }) => <LeaveRow item={item} />}
              refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
              ListEmptyComponent={
                <View className="mt-16 items-center px-6">
                  <Ionicons name="calendar-outline" size={28} color="#162456" />
                  <Text className="mt-3 text-center text-sm text-slate-500">
                    No leave requests yet.
                  </Text>
                </View>
              }
            />
          )}
        </View>
        <View className="px-5 pb-4">
          <PrimaryButton label="Apply for Leave" onPress={() => router.push("/leave/apply")} />
        </View>
      </SafeAreaView>
    </View>
  );
}
