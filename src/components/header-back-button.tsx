import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";

type HeaderBackButtonProps = {
  onPress?: () => void;
};

/**
 * Forces a visible back button in a Stack header's headerLeft slot — used on
 * the root screen of leave/clients/appointments, where React Navigation
 * wouldn't otherwise show one since there's no push history within that
 * screen's own stack (it's reached by switching to a hidden tab, not by
 * pushing onto it).
 */
export function HeaderBackButton({ onPress }: HeaderBackButtonProps) {
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      className="h-10 w-10 items-center justify-center"
      hitSlop={8}
    >
      <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
    </Pressable>
  );
}
