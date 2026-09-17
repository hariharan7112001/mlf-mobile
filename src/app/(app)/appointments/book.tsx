import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { FormScrollView } from "@/components/form-scroll-view";
import { DateField } from "@/components/ui/date-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { PickerField } from "@/components/ui/picker-field";
import { PillSelect } from "@/components/ui/pill-select";
import { PrimaryButton } from "@/components/ui/primary-button";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import { ApiError } from "@/core/api/client";
import { useDebouncedValue } from "@/core/use-debounced-value";
import {
  APPOINTMENT_MODE_OPTIONS,
  DEFAULT_APPOINTMENT_DURATION_MIN,
} from "@/features/appointments/constants";
import { useAdvocates, useAvailability, useCreateAppointment } from "@/features/appointments/hooks";
import { createAppointmentSchema } from "@/features/appointments/schemas";
import type { AppointmentMode } from "@/features/appointments/types";
import { useClients } from "@/features/clients/hooks";

const DURATION_OPTIONS = [15, 30, 45, 60];

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function BookAppointmentScreen() {
  const [advocateMobile, setAdvocateMobile] = useState("");
  const [advocateLabel, setAdvocateLabel] = useState<string | null>(null);
  const [advocateSearch, setAdvocateSearch] = useState("");
  const debouncedAdvocateSearch = useDebouncedValue(advocateSearch);

  const [clientUnitId, setClientUnitId] = useState("");
  const [clientLabel, setClientLabel] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const debouncedClientSearch = useDebouncedValue(clientSearch);

  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState(DEFAULT_APPOINTMENT_DURATION_MIN);
  const [mode, setMode] = useState<AppointmentMode | "">("office");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();

  const advocates = useAdvocates(debouncedAdvocateSearch);
  const clients = useClients(debouncedClientSearch || undefined);

  const availabilityParams =
    date && advocateMobile ? { date: toYmd(date), advocateMobile, durationMin } : null;
  const availability = useAvailability(availabilityParams);

  const createAppointment = useCreateAppointment();

  const advocateOptions = (advocates.data ?? []).map((a) => ({
    value: a.mobile,
    label: a.displayName,
    sublabel: a.designation ?? undefined,
  }));

  const clientOptions = (clients.data ?? []).map((c) => ({
    value: c.unitId,
    label: c.name,
    sublabel: `+91 ${c.mobile}`,
  }));

  async function handleSubmit() {
    setError(undefined);

    if (!date || !slot) {
      setError("Pick a date and an available time slot.");
      return;
    }

    const [hours, minutes] = slot.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const parsed = createAppointmentSchema.safeParse({
      clientUnitId: clientUnitId || undefined,
      advocateMobile,
      title,
      scheduledAt: scheduledAt.toISOString(),
      durationMin,
      mode: mode || undefined,
      location,
      notes,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields entered.");
      return;
    }

    try {
      await createAppointment.mutateAsync(parsed.data);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not book appointment.");
    }
  }

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Book Appointment" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
      <FormScrollView>
        <ErrorMessage message={error} />

        <PickerField
          label="Advocate"
          selectedLabel={advocateLabel}
          options={advocateOptions}
          loading={advocates.isLoading}
          search={advocateSearch}
          onSearchChange={setAdvocateSearch}
          onSelect={(option) => {
            setAdvocateMobile(option.value);
            setAdvocateLabel(option.label);
            setSlot(null);
          }}
        />

        <PickerField
          label="Client (optional)"
          selectedLabel={clientLabel}
          options={clientOptions}
          loading={clients.isLoading}
          search={clientSearch}
          onSearchChange={setClientSearch}
          onSelect={(option) => {
            setClientUnitId(option.value);
            setClientLabel(option.label);
          }}
        />

        <DateField
          label="Date"
          value={date}
          onChange={(d) => {
            setDate(d);
            setSlot(null);
          }}
          minimumDate={new Date()}
        />

        {availabilityParams ? (
          <View className="mb-5">
            <Text className="mb-2 text-sm font-medium text-slate-600">Time</Text>
            {availability.isLoading ? (
              <Text className="text-sm text-slate-400">Checking availability…</Text>
            ) : availability.data?.onLeave ? (
              <Text className="text-sm text-red-600">Advocate is on leave that day.</Text>
            ) : (availability.data?.freeSlots.length ?? 0) === 0 ? (
              <Text className="text-sm text-red-600">No free slots that day.</Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {availability.data?.freeSlots.map((time) => {
                  const active = time === slot;
                  return (
                    <Pressable
                      key={time}
                      onPress={() => setSlot(time)}
                      className={`rounded-full border px-4 py-2 ${
                        active ? "border-[#162456] bg-[#162456]" : "border-slate-200 bg-white"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        <TextField
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="e.g. Case discussion"
        />

        <View className="mb-5">
          <Text className="mb-2 text-sm font-medium text-slate-600">Duration</Text>
          <View className="flex-row flex-wrap gap-2">
            {DURATION_OPTIONS.map((minutes) => {
              const active = minutes === durationMin;
              return (
                <Pressable
                  key={minutes}
                  onPress={() => {
                    setDurationMin(minutes);
                    setSlot(null);
                  }}
                  className={`rounded-full border px-4 py-2 ${
                    active ? "border-[#162456] bg-[#162456]" : "border-slate-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${active ? "text-white" : "text-slate-600"}`}
                  >
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
          value={mode}
          onChange={setMode}
        />
        <TextField label="Location (optional)" value={location} onChange={setLocation} />
        <TextArea label="Notes (optional)" value={notes} onChange={setNotes} maxLength={1000} />

        <View className="mt-2">
          <PrimaryButton
            label="Book Appointment"
            onPress={handleSubmit}
            loading={createAppointment.isPending}
          />
        </View>
      </FormScrollView>
      </SafeAreaView>
    </View>
  );
}
