import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CasesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-semibold text-slate-900">Cases</Text>
        <Text className="mt-2 text-center text-sm text-slate-500">
          Your case list will show up here once this section is connected.
        </Text>
      </View>
    </SafeAreaView>
  );
}
