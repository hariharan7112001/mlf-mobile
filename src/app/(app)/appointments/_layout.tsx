import { Stack } from "expo-router";

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#162456",
        headerTitleStyle: { color: "#0f172a", fontWeight: "600" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Appointments" }} />
      <Stack.Screen name="book" options={{ title: "Book Appointment" }} />
      <Stack.Screen name="[unitId]" options={{ title: "Appointment" }} />
    </Stack>
  );
}
