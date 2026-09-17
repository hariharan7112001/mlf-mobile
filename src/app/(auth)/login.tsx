import { View } from "react-native";
import { LoginFlow } from "@/features/auth/components/login-flow";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-white">
      <LoginFlow />
    </View>
  );
}
