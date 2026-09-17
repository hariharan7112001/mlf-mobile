import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const displayName = user?.name?.trim() || (user ? `+91 ${user.mobile}` : "");
  const primaryRole = user?.roles?.[0];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 justify-between px-6 py-8">
        <View>
          <Text className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back 👋</Text>
          <Text className="mt-2 text-base text-slate-500">We&apos;re glad to have you here, {displayName}.</Text>

          <View className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <View className="mb-3 flex-row justify-between">
              <Text className="text-sm text-slate-500">Unit ID</Text>
              <Text className="text-sm font-medium text-slate-900">{user?.unitId ?? "—"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-500">Role</Text>
              <Text className="text-sm font-medium text-slate-900">{primaryRole ?? "—"}</Text>
            </View>
          </View>
        </View>

        <PrimaryButton label="Log out" onPress={() => logout.mutate()} loading={logout.isPending} />
      </View>
    </SafeAreaView>
  );
}
