import { Stack } from "expo-router";

export default function LeaveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#162456",
        headerTitleStyle: { color: "#0f172a", fontWeight: "600" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Leave" }} />
      <Stack.Screen name="apply" options={{ title: "Apply for Leave" }} />
    </Stack>
  );
}
