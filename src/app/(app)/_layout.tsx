import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/features/auth/store";

export default function AppLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  if (isHydrated && !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#208AEF",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: "Cases",
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
