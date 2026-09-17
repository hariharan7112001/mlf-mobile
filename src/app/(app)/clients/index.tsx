import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useDebouncedValue } from "@/core/use-debounced-value";
import { useClients } from "@/features/clients/hooks";
import type { ClientSummary } from "@/features/clients/types";

function ClientRow({ item }: { item: ClientSummary }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/clients/[unitId]", params: { unitId: item.unitId } })}
      className="mb-3 rounded-2xl border border-slate-100 bg-white p-4"
    >
      <Text className="text-base font-semibold text-slate-900">{item.name}</Text>
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-sm text-slate-500">+91 {item.mobile}</Text>
        <Text className="text-xs text-slate-400">{item.unitId}</Text>
      </View>
    </Pressable>
  );
}

export default function ClientsListScreen() {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());

  const { data, isLoading, isFetching, refetch } = useClients(debounced || undefined);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      <View className="px-5 pt-4">
        <View className="mb-4 h-12 flex-row items-center rounded-xl border border-slate-200 bg-white px-3">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, mobile, or ID"
            placeholderTextColor="#94a3b8"
            className="ml-2 flex-1 text-base text-slate-900"
          />
        </View>
      </View>

      <View className="flex-1 px-5">
        {isLoading ? (
          <ActivityIndicator className="mt-10" color="#162456" />
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.unitId}
            renderItem={({ item }) => <ClientRow item={item} />}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
            ListEmptyComponent={
              <View className="mt-16 items-center px-6">
                <Ionicons name="people-outline" size={28} color="#162456" />
                <Text className="mt-3 text-center text-sm text-slate-500">
                  {debounced ? "No clients match your search." : "No clients yet."}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <View className="px-5 pb-4 pt-2">
        <PrimaryButton label="New Client" onPress={() => router.push("/clients/new")} />
      </View>
    </SafeAreaView>
  );
}
