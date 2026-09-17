import { Stack } from "expo-router";

export default function ClientsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#162456",
        headerTitleStyle: { color: "#0f172a", fontWeight: "600" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Clients" }} />
      <Stack.Screen name="new" options={{ title: "New Client" }} />
      <Stack.Screen name="[unitId]" options={{ title: "Client" }} />
    </Stack>
  );
}
