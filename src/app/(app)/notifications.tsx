import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";

export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Notifications" showBack onBack={() => router.replace("/home")} />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-[#162456]/10">
            <Ionicons name="notifications-outline" size={28} color="#162456" />
          </View>
          <Text className="text-xl font-semibold text-slate-900">Coming soon</Text>
          <Text className="mt-2 text-center text-sm leading-relaxed text-slate-500">
            Notifications will show up here once this section is connected.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
