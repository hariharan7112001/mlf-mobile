import { Stack } from "expo-router";

export default function LeaveLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="apply" />
    </Stack>
  );
}
