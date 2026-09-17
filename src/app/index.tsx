import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "@/features/auth/store";

export default function Index() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#208AEF" />
      </View>
    );
  }

  return <Redirect href={user ? "/home" : "/login"} />;
}
