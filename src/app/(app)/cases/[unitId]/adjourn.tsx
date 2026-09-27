import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { FormScrollView } from "@/components/form-scroll-view";
import { DateField } from "@/components/ui/date-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { TextArea } from "@/components/ui/text-area";
import { ApiError } from "@/core/api/client";
import { toYmd } from "@/features/cases/components/case-form";
import { ADJOURN_OUTCOME_OPTIONS } from "@/features/cases/constants";
import { useAdjournHearing } from "@/features/cases/hooks";
import { adjournHearingSchema } from "@/features/cases/schemas";

export default function AdjournHearingScreen() {
  const { unitId, hearingUnitId } = useLocalSearchParams<{ unitId: string; hearingUnitId: string }>();
  const adjourn = useAdjournHearing(unitId);

  const [date, setDate] = useState<Date | null>(null);
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  async function handleSubmit() {
    setError(undefined);
    const parsed = adjournHearingSchema.safeParse({
      nextHearingDate: date ? toYmd(date) : "",
      outcome,
      notes,
    });
    if (!parsed.success) {
      setError(date ? parsed.error.issues[0]?.message : "Pick the next hearing date.");
      return;
    }
    try {
      await adjourn.mutateAsync({ hearingUnitId, body: parsed.data });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not adjourn the hearing.");
    }
  }

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Adjourn Hearing" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <FormScrollView>
          <ErrorMessage message={error} />
          <DateField label="Next hearing date *" value={date} onChange={setDate} minimumDate={today} />
          <SelectField
            label="Outcome"
            value={outcome}
            options={ADJOURN_OUTCOME_OPTIONS}
            onChange={setOutcome}
            placeholder="Select outcome"
            allowCustom
          />
          <TextArea label="Notes" value={notes} onChange={setNotes} maxLength={1000} />
          <View className="mt-2">
            <PrimaryButton label="Adjourn" onPress={handleSubmit} loading={adjourn.isPending} />
          </View>
        </FormScrollView>
      </SafeAreaView>
    </View>
  );
}
