import { View } from "react-native";
import { ForgotPinFlow } from "@/features/auth/components/forgot-pin-flow";

export default function ForgotPinScreen() {
  return (
    <View className="flex-1 bg-white">
      <ForgotPinFlow />
    </View>
  );
}
