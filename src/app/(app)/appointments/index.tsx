import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAppointments } from "@/features/appointments/hooks";
import type { AppointmentStatus, AppointmentSummary } from "@/features/appointments/types";

const FILTERS: { value: AppointmentStatus | undefined; label: string }[] = [
  { value: "scheduled", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatScheduledAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AppointmentRow({ item }: { item: AppointmentSummary }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/appointments/[unitId]", params: { unitId: item.unitId } })
      }
      className="mb-3 rounded-2xl border border-slate-100 bg-white p-4"
    >
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="flex-1 pr-3 text-base font-semibold text-slate-900">{item.title}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text className="text-sm text-slate-500">{formatScheduledAt(item.scheduledAt)}</Text>
      {item.clientName ? (
        <Text className="mt-1 text-sm text-slate-500">Client: {item.clientName}</Text>
      ) : null}
      {item.advocateName ? (
        <Text className="mt-1 text-sm text-slate-500">Advocate: {item.advocateName}</Text>
      ) : null}
    </Pressable>
  );
}

export default function AppointmentsListScreen() {
  const [status, setStatus] = useState<AppointmentStatus | undefined>("scheduled");
  const { data, isLoading, isFetching, refetch } = useAppointments(status);

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Appointments" showBack onBack={() => router.replace("/home")} />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
      <View className="flex-row gap-2 px-5 pt-4">
        {FILTERS.map((filter) => {
          const active = filter.value === status;
          return (
            <Pressable
              key={filter.label}
              onPress={() => setStatus(filter.value)}
              className={`rounded-full border px-4 py-2 ${
                active ? "border-[#162456] bg-[#162456]" : "border-slate-200 bg-white"
              }`}
            >
              <Text className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1 px-5 pt-4">
        {isLoading ? (
          <ActivityIndicator className="mt-10" color="#162456" />
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.unitId}
            renderItem={({ item }) => <AppointmentRow item={item} />}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
            ListEmptyComponent={
              <View className="mt-16 items-center px-6">
                <Ionicons name="calendar-outline" size={28} color="#162456" />
                <Text className="mt-3 text-center text-sm text-slate-500">
                  No appointments here yet.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <View className="px-5 pb-4 pt-2">
        <PrimaryButton label="Book Appointment" onPress={() => router.push("/appointments/book")} />
      </View>
      </SafeAreaView>
    </View>
  );
}
