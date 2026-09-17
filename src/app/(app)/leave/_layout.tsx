import { router, Stack } from "expo-router";
import { HeaderBackButton } from "@/components/header-back-button";
import { PrimaryStack } from "@/components/primary-stack";

export default function LeaveLayout() {
  return (
    <PrimaryStack>
      <Stack.Screen
        name="index"
        options={{
          title: "Leave",
          headerLeft: () => <HeaderBackButton onPress={() => router.replace("/home")} />,
        }}
      />
      <Stack.Screen name="apply" options={{ title: "Apply for Leave" }} />
    </PrimaryStack>
  );
}
