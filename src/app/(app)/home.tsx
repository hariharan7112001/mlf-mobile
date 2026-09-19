import { AppHeader } from "@/components/app-header";
import { OverflowMenu, type OverflowMenuItem } from "@/components/overflow-menu";
import { ErrorMessage } from "@/components/ui/error-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ApiError } from "@/core/api/client";
import { getApiBaseUrl } from "@/core/env";
import { useAttendanceHistory, useCheckIn, useCheckOut } from "@/features/attendance/hooks";
import { LocationError } from "@/features/attendance/lib/location";
import { useLogout } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AttendanceCard() {
  // Rows are date-desc, so [0] is the latest record. Mutations invalidate this query and stay
  // pending until it refetches, so the button label flips only once the new state is known.
  const { data: history, isLoading } = useAttendanceHistory();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const [error, setError] = useState<string | undefined>();

  const isPending = checkIn.isPending || checkOut.isPending;
  const latest = history?.[0];
  const checkedIn = Boolean(latest?.checkInAt) && !latest?.checkOutAt;

  async function handlePress() {
    const action = checkedIn ? "out" : "in";
    setError(undefined);
    try {
      const { attendance } =
        action === "in"
          ? await checkIn.mutateAsync(undefined)
          : await checkOut.mutateAsync(undefined);
      const recordedAt = action === "in" ? attendance.checkInAt : attendance.checkOutAt;
      Alert.alert(
        action === "in" ? "Checked in" : "Checked out",
        recordedAt ? `Recorded at ${formatTime(recordedAt)}.` : "Recorded."
      );
    } catch (err) {
      if (err instanceof LocationError || err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    }
  }

  return (
    <View className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
      <Text className="text-sm font-medium text-slate-600">Attendance</Text>
      <Text className="mb-4 mt-1 text-sm text-slate-500">
        Your current location is captured each time you check in or out.
      </Text>

      <ErrorMessage message={error} />

      <PrimaryButton
        label={checkedIn ? "Check Out" : "Check In"}
        onPress={handlePress}
        loading={isPending}
        disabled={isPending || isLoading}
      />
    </View>
  );
}

type QuickActionProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
};

function QuickAction({ icon, label, onPress }: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center rounded-2xl border border-slate-100 bg-white py-5 shadow-sm active:opacity-70"
    >
      <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-[#162456]/10">
        <Ionicons name={icon} size={23} color="#162456" />
      </View>
      <Text className="text-sm font-semibold text-slate-700">{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const displayName = user?.name?.trim() || (user ? `+91 ${user.mobile}` : "");
  const primaryRole = user?.roles?.[0];

  function confirmLogout() {
    Alert.alert("Log out?", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => logout.mutate() },
    ]);
  }

  const menuItems: OverflowMenuItem[] = [
    {
      key: "terms",
      label: "Terms and Conditions",
      icon: "document-text-outline",
      onPress: () => WebBrowser.openBrowserAsync(`${getApiBaseUrl()}/legal/terms`),
    },
    {
      key: "privacy",
      label: "Privacy Policy",
      icon: "shield-checkmark-outline",
      onPress: () => WebBrowser.openBrowserAsync(`${getApiBaseUrl()}/legal/privacy`),
    },
    {
      key: "logout",
      label: "Logout",
      icon: "log-out-outline",
      destructive: true,
      onPress: confirmLogout,
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <View
        style={{
          backgroundColor: "#162456",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <AppHeader
          rightContent={
            <>
              <Pressable
                onPress={() => router.push("/notifications" as Href)}
                className="mr-1 h-9 w-9 items-center justify-center"
                hitSlop={8}
              >
                <Ionicons name="notifications-outline" size={21} color="#FFFFFF" />
              </Pressable>
              <OverflowMenu items={menuItems} />
            </>
          }
        />

        <View className="px-6 pb-7 pt-1">
          <Text className="text-2xl font-semibold tracking-tight text-white">Welcome back 👋</Text>
          <Text className="mt-2 text-base text-white/80">
            We&apos;re glad to have you here, {displayName}.
          </Text>
        </View>
      </View>

      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1 px-6 pb-6 pt-5">
          <AttendanceCard />

          <View className="mt-5 flex-row gap-3">
            <QuickAction
              icon="calendar-outline"
              label="Leave"
              onPress={() => router.push("/leave" as Href)}
            />
            <QuickAction
              icon="people-outline"
              label="Clients"
              onPress={() => router.push("/clients" as Href)}
            />
            <QuickAction
              icon="time-outline"
              label="Appointments"
              onPress={() => router.push("/appointments" as Href)}
            />
          </View>

          {/* <View className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <View className="mb-3 flex-row justify-between">
              <Text className="text-sm text-slate-500">Unit ID</Text>
              <Text className="text-sm font-medium text-slate-900">{user?.unitId ?? "—"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-500">Role</Text>
              <Text className="text-sm font-medium text-slate-900">{primaryRole ?? "—"}</Text>
            </View>
          </View> */}
        </View>
      </SafeAreaView>
    </View>
  );
}
