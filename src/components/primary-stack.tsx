import { Stack } from "expo-router";
import type { ComponentProps } from "react";

type PrimaryStackProps = ComponentProps<typeof Stack>;

/**
 * Shared Stack preset: primary-color header, white back icon + title.
 * Reused by leave/clients/appointments so their headers stay in sync.
 */
export function PrimaryStack({ screenOptions, ...props }: PrimaryStackProps) {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#162456" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { color: "#FFFFFF", fontWeight: "600" },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        ...screenOptions,
      }}
      {...props}
    />
  );
}
