import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CasesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-[#162456]/10">
          <Ionicons name="briefcase-outline" size={28} color="#162456" />
        </View>
        <Text className="text-xl font-semibold text-slate-900">Coming soon</Text>
        <Text className="mt-2 text-center text-sm leading-relaxed text-slate-500">
          Your case list will show up here once this section is connected.
        </Text>
      </View>
    </SafeAreaView>
  );
}
