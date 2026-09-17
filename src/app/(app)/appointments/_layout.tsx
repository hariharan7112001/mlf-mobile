import { router, Stack } from "expo-router";
import { HeaderBackButton } from "@/components/header-back-button";
import { PrimaryStack } from "@/components/primary-stack";

export default function AppointmentsLayout() {
  return (
    <PrimaryStack>
      <Stack.Screen
        name="index"
        options={{
          title: "Appointments",
          headerLeft: () => <HeaderBackButton onPress={() => router.replace("/home")} />,
        }}
      />
      <Stack.Screen name="book" options={{ title: "Book Appointment" }} />
      <Stack.Screen name="[unitId]" options={{ title: "Appointment" }} />
    </PrimaryStack>
  );
}
