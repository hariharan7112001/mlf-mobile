import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormScrollView } from "@/components/form-scroll-view";
import { ErrorMessage } from "@/components/ui/error-message";
import { PillSelect } from "@/components/ui/pill-select";
import { PrimaryButton } from "@/components/ui/primary-button";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import { ApiError } from "@/core/api/client";
import { GENDER_OPTIONS } from "@/features/clients/constants";
import { useCreateClient } from "@/features/clients/hooks";
import { createClientSchema } from "@/features/clients/schemas";

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

const INITIAL_STATE: FormState = {
  name: "",
  mobile: "",
  altMobile: "",
  email: "",
  gender: "",
  occupation: "",
  fatherOrSpouse: "",
  address: "",
  city: "",
  district: "",
  state: "",
  aadhaarLast4: "",
  referredBy: "",
  matterBrief: "",
  notes: "",
};

export default function NewClientScreen() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | undefined>();
  const createClient = useCreateClient();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError(undefined);
    const parsed = createClientSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields entered.");
      return;
    }

    try {
      await createClient.mutateAsync(parsed.data);
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create client.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <FormScrollView>
        <ErrorMessage message={error} />

        <TextField
          label="Full name"
          value={form.name}
          onChange={(v) => set("name", v)}
          placeholder="Client's full name"
        />
        <TextField
          label="Mobile"
          value={form.mobile}
          onChange={(v) => set("mobile", v.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile number"
          keyboardType="number-pad"
          maxLength={10}
        />
        <TextField
          label="Alternate mobile (optional)"
          value={form.altMobile}
          onChange={(v) => set("altMobile", v.replace(/\D/g, "").slice(0, 15))}
          keyboardType="number-pad"
          maxLength={15}
        />
        <TextField
          label="Email (optional)"
          value={form.email}
          onChange={(v) => set("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PillSelect
          label="Gender (optional)"
          options={GENDER_OPTIONS}
          value={form.gender}
          onChange={(v) => set("gender", v)}
        />
        <TextField
          label="Occupation (optional)"
          value={form.occupation}
          onChange={(v) => set("occupation", v)}
        />
        <TextField
          label="Father / Spouse name (optional)"
          value={form.fatherOrSpouse}
          onChange={(v) => set("fatherOrSpouse", v)}
        />
        <TextArea
          label="Address (optional)"
          value={form.address}
          onChange={(v) => set("address", v)}
          maxLength={500}
        />
        <TextField label="City (optional)" value={form.city} onChange={(v) => set("city", v)} />
        <TextField
          label="District (optional)"
          value={form.district}
          onChange={(v) => set("district", v)}
        />
        <TextField label="State (optional)" value={form.state} onChange={(v) => set("state", v)} />
        <TextField
          label="Aadhaar last 4 digits (optional)"
          value={form.aadhaarLast4}
          onChange={(v) => set("aadhaarLast4", v.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          maxLength={4}
        />
        <TextField
          label="Referred by (optional)"
          value={form.referredBy}
          onChange={(v) => set("referredBy", v)}
        />
        <TextArea
          label="Matter brief (optional)"
          value={form.matterBrief}
          onChange={(v) => set("matterBrief", v)}
          maxLength={2000}
        />
        <TextArea
          label="Notes (optional)"
          value={form.notes}
          onChange={(v) => set("notes", v)}
          maxLength={1000}
        />

        <View className="mt-2">
          <PrimaryButton
            label="Create Client"
            onPress={handleSubmit}
            loading={createClient.isPending}
          />
        </View>
      </FormScrollView>
    </SafeAreaView>
  );
}
