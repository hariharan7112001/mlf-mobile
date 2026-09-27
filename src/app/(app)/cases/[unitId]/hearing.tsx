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
import { useAddHearing, useCase } from "@/features/cases/hooks";
import { addHearingSchema } from "@/features/cases/schemas";
import { getStageOptionsForCaseType } from "@/features/cases/stages";

export default function AddHearingScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { data } = useCase(unitId);
  const addHearing = useAddHearing(unitId);

  const [date, setDate] = useState<Date | null>(null);
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();

  // Purposes use the case type's stage catalog; picking one also syncs the case stage server-side.
  const purposeOptions = useMemo(
    () => getStageOptionsForCaseType(data?.case.caseType ?? null),
    [data?.case.caseType]
  );
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  async function handleSubmit() {
    setError(undefined);
    const parsed = addHearingSchema.safeParse({
      hearingDate: date ? toYmd(date) : "",
      purpose,
      notes,
    });
    if (!parsed.success) {
      setError(date ? parsed.error.issues[0]?.message : "Pick the hearing date.");
      return;
    }
    try {
      await addHearing.mutateAsync(parsed.data);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add the hearing.");
    }
  }

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Add Hearing" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <FormScrollView>
          <ErrorMessage message={error} />
          <DateField label="Hearing date *" value={date} onChange={setDate} minimumDate={today} />
          <SelectField
            label="Purpose / stage"
            value={purpose}
            options={purposeOptions}
            onChange={setPurpose}
            placeholder="Select purpose"
            allowCustom
          />
          <TextArea label="Notes" value={notes} onChange={setNotes} maxLength={1000} />
          <View className="mt-2">
            <PrimaryButton label="Add Hearing" onPress={handleSubmit} loading={addHearing.isPending} />
          </View>
        </FormScrollView>
      </SafeAreaView>
    </View>
  );
}
