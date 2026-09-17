import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormScrollView } from "@/components/form-scroll-view";
import { DateField } from "@/components/ui/date-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { PillSelect } from "@/components/ui/pill-select";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import { ApiError } from "@/core/api/client";
import { APPOINTMENT_MODE_OPTIONS } from "@/features/appointments/constants";
import {
  useAppointment,
  useConfirmAppointment,
  useUpdateAppointment,
} from "@/features/appointments/hooks";
import { updateAppointmentSchema } from "@/features/appointments/schemas";
import type { AppointmentMode, AppointmentSummary } from "@/features/appointments/types";

const DURATION_OPTIONS = [15, 30, 45, 60];

type FormState = {
  title: string;
  date: Date;
  time: Date;
  durationMin: number;
  mode: AppointmentMode | "";
  location: string;
  notes: string;
};

function toFormState(appointment: AppointmentSummary): FormState {
  const scheduled = new Date(appointment.scheduledAt);
  return {
    title: appointment.title,
    date: scheduled,
    time: scheduled,
    durationMin: appointment.durationMin,
    mode: appointment.mode,
    location: appointment.location ?? "",
    notes: appointment.notes ?? "",
  };
}

function AppointmentEditForm({
  unitId,
  appointment,
}: {
  unitId: string;
  appointment: AppointmentSummary;
}) {
  const updateAppointment = useUpdateAppointment(unitId);
  const confirmAppointment = useConfirmAppointment(unitId);

  const [form, setForm] = useState<FormState>(() => toFormState(appointment));
  const [error, setError] = useState<string | undefined>();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(undefined);

    const scheduledAt = new Date(form.date);
    scheduledAt.setHours(form.time.getHours(), form.time.getMinutes(), 0, 0);

    const parsed = updateAppointmentSchema.safeParse({
      title: form.title,
      scheduledAt: scheduledAt.toISOString(),
      durationMin: form.durationMin,
      mode: form.mode || undefined,
      location: form.location,
      notes: form.notes,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields entered.");
      return;
    }

    try {
      await updateAppointment.mutateAsync(parsed.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save changes.");
    }
  }

  function handleCancel() {
    Alert.alert("Cancel appointment?", "This cannot be undone.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel appointment",
        style: "destructive",
        onPress: async () => {
          setError(undefined);
          try {
            await updateAppointment.mutateAsync({ status: "cancelled" });
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Could not cancel appointment.");
          }
        },
      },
    ]);
  }

  async function handleComplete() {
    setError(undefined);
    try {
      await updateAppointment.mutateAsync({ status: "completed" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update appointment.");
    }
  }

  async function handleConfirm() {
    setError(undefined);
    try {
      await confirmAppointment.mutateAsync();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not confirm appointment.");
    }
  }

  const isScheduled = appointment.status === "scheduled";

  return (
    <FormScrollView>
      <ErrorMessage message={error} />

      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-slate-500">
            {appointment.clientName ?? "No client linked"}
          </Text>
          <Text className="text-sm text-slate-500">
            {appointment.advocateName ?? appointment.advocateMobile ?? "No advocate"}
          </Text>
        </View>
        <StatusBadge status={appointment.status} />
      </View>

      <TextField
        label="Title"
        value={form.title}
        onChange={(v) => set("title", v)}
        editable={isScheduled}
      />
      <DateField label="Date" value={form.date} onChange={(d) => set("date", d)} />
      <DateField label="Time" mode="time" value={form.time} onChange={(t) => set("time", t)} />

      <View className="mb-5">
        <Text className="mb-2 text-sm font-medium text-slate-600">Duration</Text>
        <View className="flex-row flex-wrap gap-2">
          {DURATION_OPTIONS.map((minutes) => {
            const active = minutes === form.durationMin;
            return (
              <Pressable
                key={minutes}
                onPress={() => set("durationMin", minutes)}
                className={`rounded-full border px-4 py-2 ${
                  active ? "border-[#162456] bg-[#162456]" : "border-slate-200 bg-white"
                }`}
              >
                <Text className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}>
                  {minutes} min
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PillSelect
        label="Mode"
        options={APPOINTMENT_MODE_OPTIONS}
        value={form.mode}
        onChange={(v) => set("mode", v)}
      />
      <TextField label="Location" value={form.location} onChange={(v) => set("location", v)} />
      <TextArea label="Notes" value={form.notes} onChange={(v) => set("notes", v)} maxLength={1000} />

      {isScheduled ? (
        <View className="mt-2 gap-3">
          <PrimaryButton
            label="Save Changes"
            onPress={handleSave}
            loading={updateAppointment.isPending}
          />
          {appointment.canConfirm && !appointment.confirmedAt ? (
            <PrimaryButton
              label="Confirm Coming"
              onPress={handleConfirm}
              loading={confirmAppointment.isPending}
            />
          ) : null}
          <SecondaryButton
            label="Mark Completed"
            onPress={handleComplete}
            disabled={updateAppointment.isPending}
          />
          <SecondaryButton
            label="Cancel Appointment"
            onPress={handleCancel}
            disabled={updateAppointment.isPending}
          />
        </View>
      ) : null}
    </FormScrollView>
  );
}

export default function AppointmentDetailScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { data, isLoading } = useAppointment(unitId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      {isLoading || !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#162456" />
        </View>
      ) : (
        <AppointmentEditForm key={unitId} unitId={unitId} appointment={data.appointment} />
      )}
    </SafeAreaView>
  );
}
