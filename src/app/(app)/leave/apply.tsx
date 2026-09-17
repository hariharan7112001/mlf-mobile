import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { FormScrollView } from "@/components/form-scroll-view";
import { DateField } from "@/components/ui/date-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { TextArea } from "@/components/ui/text-area";
import { ApiError } from "@/core/api/client";
import { useApplyLeave } from "@/features/leave/hooks";
import { applyLeaveSchema } from "@/features/leave/schemas";

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ApplyLeaveScreen() {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | undefined>();

  const applyLeave = useApplyLeave();

  async function handleSubmit() {
    setError(undefined);
    if (!fromDate || !toDate) {
      setError("Pick both a from and to date.");
      return;
    }

    const parsed = applyLeaveSchema.safeParse({
      fromDate: toYmd(fromDate),
      toDate: toYmd(toDate),
      reason,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the dates entered.");
      return;
    }

    try {
      await applyLeave.mutateAsync(parsed.data);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit leave request.");
    }
  }

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Apply for Leave" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <FormScrollView>
          <ErrorMessage message={error} />
          <DateField label="From" value={fromDate} onChange={setFromDate} minimumDate={new Date()} />
          <DateField
            label="To"
            value={toDate}
            onChange={setToDate}
            minimumDate={fromDate ?? new Date()}
          />
          <TextArea
            label="Reason (optional)"
            value={reason}
            onChange={setReason}
            placeholder="Why are you taking leave?"
            maxLength={500}
          />
          <View className="mt-2">
            <PrimaryButton label="Submit" onPress={handleSubmit} loading={applyLeave.isPending} />
          </View>
        </FormScrollView>
      </SafeAreaView>
    </View>
  );
}
