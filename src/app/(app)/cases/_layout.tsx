import { Stack } from "expo-router";

export default function CasesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="[unitId]/index" />
      <Stack.Screen name="[unitId]/edit" />
      <Stack.Screen name="[unitId]/hearing" />
      <Stack.Screen name="[unitId]/adjourn" />
      <Stack.Screen name="[unitId]/upload" />
    </Stack>
  );
}
