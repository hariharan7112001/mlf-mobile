import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormScrollView } from "@/components/form-scroll-view";
import { ErrorMessage } from "@/components/ui/error-message";
import { PillSelect } from "@/components/ui/pill-select";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import { ApiError } from "@/core/api/client";
import { GENDER_OPTIONS } from "@/features/clients/constants";
import { useClient, useUpdateClient } from "@/features/clients/hooks";
import { updateClientSchema } from "@/features/clients/schemas";
import type { ClientDetailResponse } from "@/features/clients/api";
import type { ClientSummary } from "@/features/clients/types";

type FormState = {
  name: string;
  mobile: string;
  altMobile: string;
  email: string;
  gender: "male" | "female" | "other" | "prefer_not" | "";
  occupation: string;
  fatherOrSpouse: string;
  address: string;
  city: string;
  district: string;
  state: string;
  aadhaarLast4: string;
  referredBy: string;
  matterBrief: string;
  notes: string;
};

function toFormState(client: ClientSummary): FormState {
  return {
    name: client.name,
    mobile: client.mobile,
    altMobile: client.altMobile ?? "",
    email: client.email ?? "",
    gender: (client.gender as FormState["gender"]) ?? "",
    occupation: client.occupation ?? "",
    fatherOrSpouse: client.fatherOrSpouse ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    district: client.district ?? "",
    state: client.state ?? "",
    aadhaarLast4: client.aadhaarLast4 ?? "",
    referredBy: client.referredBy ?? "",
    matterBrief: client.matterBrief ?? "",
    notes: client.notes ?? "",
  };
}

function ClientEditForm({ unitId, detail }: { unitId: string; detail: ClientDetailResponse }) {
  const updateClient = useUpdateClient(unitId);
  const [form, setForm] = useState<FormState>(() => toFormState(detail.client));
  const [error, setError] = useState<string | undefined>();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(undefined);

    const parsed = updateClientSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields entered.");
      return;
    }

    try {
      await updateClient.mutateAsync(parsed.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save changes.");
    }
  }

  return (
    <FormScrollView>
      <ErrorMessage message={error} />

      {detail.cases.length > 0 ? (
        <View className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <Text className="mb-2 text-sm font-medium text-slate-600">
            Cases ({detail.cases.length})
          </Text>
          {detail.cases.map((c) => (
            <View key={c.unitId} className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm text-slate-900">{c.caseNumber ?? c.unitId}</Text>
              <StatusBadge status={c.status} />
            </View>
          ))}
        </View>
      ) : null}

      <TextField label="Full name" value={form.name} onChange={(v) => set("name", v)} />
      <TextField
        label="Mobile"
        value={form.mobile}
        onChange={(v) => set("mobile", v.replace(/\D/g, "").slice(0, 10))}
        keyboardType="number-pad"
        maxLength={10}
      />
      <TextField
        label="Alternate mobile"
        value={form.altMobile}
        onChange={(v) => set("altMobile", v.replace(/\D/g, "").slice(0, 15))}
        keyboardType="number-pad"
        maxLength={15}
      />
      <TextField
        label="Email"
        value={form.email}
        onChange={(v) => set("email", v)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <PillSelect
        label="Gender"
        options={GENDER_OPTIONS}
        value={form.gender}
        onChange={(v) => set("gender", v)}
      />
      <TextField label="Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} />
      <TextField
        label="Father / Spouse name"
        value={form.fatherOrSpouse}
        onChange={(v) => set("fatherOrSpouse", v)}
      />
      <TextArea label="Address" value={form.address} onChange={(v) => set("address", v)} maxLength={500} />
      <TextField label="City" value={form.city} onChange={(v) => set("city", v)} />
      <TextField label="District" value={form.district} onChange={(v) => set("district", v)} />
      <TextField label="State" value={form.state} onChange={(v) => set("state", v)} />
      <TextField
        label="Aadhaar last 4 digits"
        value={form.aadhaarLast4}
        onChange={(v) => set("aadhaarLast4", v.replace(/\D/g, "").slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
      />
      <TextField label="Referred by" value={form.referredBy} onChange={(v) => set("referredBy", v)} />
      <TextArea
        label="Matter brief"
        value={form.matterBrief}
        onChange={(v) => set("matterBrief", v)}
        maxLength={2000}
      />
      <TextArea label="Notes" value={form.notes} onChange={(v) => set("notes", v)} maxLength={1000} />

      <View className="mt-2">
        <PrimaryButton label="Save Changes" onPress={handleSave} loading={updateClient.isPending} />
      </View>
    </FormScrollView>
  );
}

export default function ClientDetailScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { data, isLoading } = useClient(unitId);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      {isLoading || !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#162456" />
        </View>
      ) : (
        <ClientEditForm key={unitId} unitId={unitId} detail={data} />
      )}
    </SafeAreaView>
  );
}
