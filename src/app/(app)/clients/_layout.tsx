import { router, Stack } from "expo-router";
import { HeaderBackButton } from "@/components/header-back-button";
import { PrimaryStack } from "@/components/primary-stack";

export default function ClientsLayout() {
  return (
    <PrimaryStack>
      <Stack.Screen
        name="index"
        options={{
          title: "Clients",
          headerLeft: () => <HeaderBackButton onPress={() => router.replace("/home")} />,
        }}
      />
      <Stack.Screen name="new" options={{ title: "New Client" }} />
      <Stack.Screen name="[unitId]" options={{ title: "Client" }} />
    </PrimaryStack>
  );
}
