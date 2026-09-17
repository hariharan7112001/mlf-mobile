import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppHeaderProps = {
  title?: string;
  /** Shows a white back arrow on the left. Defaults to router.back(). */
  showBack?: boolean;
  onBack?: () => void;
  /** Custom content on the right, e.g. Home's notification + overflow-menu icons. */
  rightContent?: ReactNode;
};

/**
 * The one header component every screen uses — primary-color background,
 * white back icon, centered title. `showBack`/`onBack` covers every
 * back-navigable screen; `rightContent` covers Home's icon row. Replaces the
 * native Stack header entirely (leave/clients/appointments render this
 * directly with `headerShown: false`) so there's a single source of truth
 * instead of native-header styling plus a separate custom component.
 */
export function AppHeader({ title, showBack, onBack, rightContent }: AppHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#162456" }}>
      <View className="h-14 flex-row items-center px-2">
        <View className="w-10 items-start justify-center">
          {showBack ? (
            <Pressable
              onPress={onBack ?? (() => router.back())}
              className="h-10 w-10 items-center justify-center"
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>

        <View className="flex-1 items-center">
          {title ? (
            <Text numberOfLines={1} className="text-lg font-semibold text-white">
              {title}
            </Text>
          ) : null}
        </View>

        <View className="min-w-10 flex-row items-center justify-end">{rightContent}</View>
      </View>
    </SafeAreaView>
  );
}
