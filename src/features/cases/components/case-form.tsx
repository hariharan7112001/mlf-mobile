import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { FormScrollView } from "@/components/form-scroll-view";
import { DateField } from "@/components/ui/date-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { PickerField } from "@/components/ui/picker-field";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import { useDebouncedValue } from "@/core/use-debounced-value";
import { useAdvocates } from "@/features/appointments/hooks";
import { useClients } from "@/features/clients/hooks";
import {
  CASE_TYPE_OPTIONS,
  caseYearOptions,
  normalizeCnr,
  OUR_SIDE_OPTIONS,
  UNDER_ACTS_OPTIONS,
} from "../constants";
import { createCaseSchema, type CreateCaseInput } from "../schemas";
import { getStageOptionsForCaseType, isKnownStageForCaseType } from "../stages";
import type { CaseSummary } from "../types";
import { CourtCascade, type CourtLocation } from "./court-cascade";

export type CaseFormState = CourtLocation & {
  clientUnitId: string;
  clientLabel: string | null;
  caseType: string;
  stage: string;
  caseNumber: string;
  filingNumber: string;
  caseYear: string;
  cnr: string;
  ourSide: string;
  opposingParty: string;
  underActs: string;
  policeStation: string;
  firNumber: string;
  primaryAdvocateMobile: string;
  primaryAdvocateLabel: string | null;
  filingDate: Date | null;
  nextHearingAt: Date | null;
  agreedFee: string;
  notes: string;
};

export function emptyCaseForm(client?: { unitId: string; name: string } | null): CaseFormState {
  return {
    state: "Tamil Nadu",
    district: "",
    city: "",
    courtName: "",
    clientUnitId: client?.unitId ?? "",
    clientLabel: client ? `${client.name} (${client.unitId})` : null,
    caseType: "",
    stage: "",
    caseNumber: "",
    filingNumber: "",
    caseYear: "",
    cnr: "",
    ourSide: "",
    opposingParty: "",
    underActs: "",
    policeStation: "",
    firNumber: "",
    primaryAdvocateMobile: "",
    primaryAdvocateLabel: null,
    filingDate: null,
    nextHearingAt: null,
    agreedFee: "",
    notes: "",
  };
}

export function caseToFormState(item: CaseSummary, clientName: string | null): CaseFormState {
  return {
    state: item.state ?? "Tamil Nadu",
    district: item.district ?? "",
    city: item.city ?? "",
    courtName: item.courtName ?? "",
    clientUnitId: item.clientUnitId,
    clientLabel: `${clientName ?? "Client"} (${item.clientUnitId})`,
    caseType: item.caseType ?? "",
    stage: item.stage ?? "",
    caseNumber: item.caseNumber ?? "",
    filingNumber: item.filingNumber ?? "",
    caseYear: item.caseYear != null ? String(item.caseYear) : "",
    cnr: item.cnr ?? "",
    ourSide: item.ourSide ?? "",
    opposingParty: item.opposingParty ?? "",
    underActs: item.underActs ?? "",
    policeStation: item.policeStation ?? "",
    firNumber: item.firNumber ?? "",
    primaryAdvocateMobile: item.primaryAdvocateMobile ?? "",
    primaryAdvocateLabel: item.primaryAdvocateMobile
      ? `Advocate · ${item.primaryAdvocateMobile}`
      : null,
    filingDate: item.filingDate ? new Date(item.filingDate) : null,
    nextHearingAt: item.nextHearingAt ? new Date(item.nextHearingAt) : null,
    agreedFee: item.agreedFee != null ? String(item.agreedFee) : "",
    notes: item.notes ?? "",
  };
}

export function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Accepts "9876543210", "+91 98765 43210", "919876543210" → 10 digits (same as the web form). */
function toMobile10(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

function toPayload(form: CaseFormState) {
  const mobile = toMobile10(form.primaryAdvocateMobile);
  const fee = form.agreedFee.trim() === "" ? Number.NaN : Number(form.agreedFee);
  return {
    clientUnitId: form.clientUnitId,
    caseNumber: form.caseNumber.trim() || undefined,
    filingNumber: form.filingNumber.trim() || undefined,
    caseYear: form.caseYear ? Number(form.caseYear) : undefined,
    cnr: form.cnr ? normalizeCnr(form.cnr) : undefined,
    state: form.state,
    district: form.district,
    city: form.city,
    courtName: form.courtName,
    primaryAdvocateMobile: mobile,
    advocateMobiles: mobile ? [mobile] : [],
    opposingParty: form.opposingParty.trim() || undefined,
    ourSide: form.ourSide || undefined,
    underActs: form.underActs.trim() || undefined,
    policeStation: form.policeStation.trim() || undefined,
    firNumber: form.firNumber.trim() || undefined,
    stage: form.stage || undefined,
    caseType: form.caseType,
    filingDate: form.filingDate ? toYmd(form.filingDate) : undefined,
    nextHearingAt: form.nextHearingAt ? toYmd(form.nextHearingAt) : undefined,
    agreedFee: Number.isFinite(fee) ? fee : undefined,
    notes: form.notes.trim() || undefined,
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <View className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <Text className="text-sm font-semibold text-[#162456]">{title}</Text>
      {description ? <Text className="mb-3 mt-0.5 text-xs text-slate-500">{description}</Text> : null}
      <View className={description ? "" : "mt-3"}>{children}</View>
    </View>
  );
}

type CaseFormProps = {
  initial: CaseFormState;
  /** Edit mode shows the client read-only (the API does not allow re-linking a case). */
  clientLocked?: boolean;
  submitLabel: string;
  submitting: boolean;
  error?: string;
  onSubmit: (input: CreateCaseInput) => void;
};

export function CaseForm({ initial, clientLocked, submitLabel, submitting, error, onSubmit }: CaseFormProps) {
  const [form, setForm] = useState<CaseFormState>(initial);
  const [localError, setLocalError] = useState<string | undefined>();

  const [clientSearch, setClientSearch] = useState("");
  const clients = useClients(useDebouncedValue(clientSearch.trim()) || undefined);
  const [advocateSearch, setAdvocateSearch] = useState("");
  const advocates = useAdvocates(useDebouncedValue(advocateSearch));

  const stageOptions = useMemo(() => getStageOptionsForCaseType(form.caseType || null), [form.caseType]);
  const yearOptions = useMemo(() => caseYearOptions(), []);

  function set<K extends keyof CaseFormState>(key: K, value: CaseFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** Same rule as the web form: drop a catalog stage that doesn't belong to the new type's track. */
  function handleCaseTypeChange(nextType: string) {
    setForm((prev) => {
      const keep =
        !prev.stage ||
        isKnownStageForCaseType(prev.stage, nextType) ||
        !isKnownStageForCaseType(prev.stage, prev.caseType || null);
      return { ...prev, caseType: nextType, stage: keep ? prev.stage : "" };
    });
  }

  function handleSubmit() {
    setLocalError(undefined);
    const parsed = createCaseSchema.safeParse(toPayload(form));
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? "Check the fields entered.");
      return;
    }
    onSubmit(parsed.data);
  }

  return (
    <FormScrollView>
      <ErrorMessage message={localError ?? error} />

      <Section title="1. Court location" description="State → District → City / town → Court">
        <CourtCascade
          value={form}
          onChange={(loc) => setForm((prev) => ({ ...prev, ...loc }))}
        />
      </Section>

      <Section title="2. Our client" description="Who this office represents">
        {clientLocked ? (
          <View className="h-14 justify-center rounded-xl border border-slate-200 bg-white px-4">
            <Text className="text-base text-slate-900">{form.clientLabel}</Text>
          </View>
        ) : (
          <>
            <PickerField
              label="Client *"
              placeholder="Search client"
              selectedLabel={form.clientLabel}
              options={(clients.data ?? []).map((c) => ({
                value: c.unitId,
                label: c.name,
                sublabel: `+91 ${c.mobile} · ${c.unitId}`,
              }))}
              loading={clients.isLoading}
              search={clientSearch}
              onSearchChange={setClientSearch}
              onSelect={(o) =>
                setForm((prev) => ({ ...prev, clientUnitId: o.value, clientLabel: `${o.label} (${o.value})` }))
              }
            />
            <Pressable
              onPress={() => router.push("/clients/new")}
              className="-mt-2 flex-row items-center self-start py-1"
            >
              <Ionicons name="add-circle-outline" size={16} color="#162456" />
              <Text className="ml-1 text-sm font-medium text-[#162456]">New client</Text>
            </Pressable>
          </>
        )}
      </Section>

      <Section title="3. Case type & stage" description="Stage list follows the case type">
        <SelectField
          label="Case type *"
          value={form.caseType}
          options={CASE_TYPE_OPTIONS}
          onChange={handleCaseTypeChange}
          placeholder="Select type"
        />
        <SelectField
          label="Court stage"
          value={form.stage}
          options={stageOptions}
          onChange={(v) => set("stage", v)}
          placeholder={form.caseType ? "Select stage" : "Select case type first"}
          allowCustom
          disabled={!form.caseType}
        />
      </Section>

      <Section title="4. Case numbers" description="Fill when the court allots — all optional for now">
        <TextField
          label="Court case number"
          value={form.caseNumber}
          onChange={(v) => set("caseNumber", v)}
          placeholder="OS/123/2024"
          autoCapitalize="characters"
        />
        <TextField
          label="Filing number"
          value={form.filingNumber}
          onChange={(v) => set("filingNumber", v)}
          placeholder="Before registration"
        />
        <SelectField
          label="Year"
          value={form.caseYear}
          options={yearOptions}
          onChange={(v) => set("caseYear", v.replace(/\D/g, "").slice(0, 4))}
          placeholder="Select year"
          allowCustom
        />
        <TextField
          label="CNR (eCourts)"
          value={form.cnr}
          onChange={(v) => set("cnr", v.toUpperCase())}
          placeholder="16 chars, e.g. TNCH012345678901"
          autoCapitalize="characters"
          maxLength={20}
        />
      </Section>

      <Section title="5. Parties & advocate" description="Our side, opposite party, acts, advocate">
        <SelectField
          label="Our client appears as"
          value={form.ourSide}
          options={OUR_SIDE_OPTIONS}
          onChange={(v) => set("ourSide", v)}
          placeholder="Petitioner / accused…"
        />
        <TextField
          label="Opposite party"
          value={form.opposingParty}
          onChange={(v) => set("opposingParty", v)}
          placeholder="Respondent / accused"
        />
        <SelectField
          label="Under acts / sections"
          value={form.underActs}
          options={UNDER_ACTS_OPTIONS}
          onChange={(v) => set("underActs", v)}
          placeholder="Select act / statute"
          allowCustom
        />
        <TextField
          label="Police station"
          value={form.policeStation}
          onChange={(v) => set("policeStation", v)}
          placeholder="Criminal matters"
        />
        <TextField
          label="FIR / Crime number"
          value={form.firNumber}
          onChange={(v) => set("firNumber", v)}
          placeholder="Optional"
        />
        <PickerField
          label="Primary advocate *"
          placeholder="Select advocate"
          selectedLabel={form.primaryAdvocateLabel}
          options={(advocates.data ?? []).map((a) => ({
            value: a.mobile,
            label: a.displayName,
            sublabel: a.designation ?? undefined,
          }))}
          loading={advocates.isLoading}
          search={advocateSearch}
          onSearchChange={setAdvocateSearch}
          onSelect={(o) => {
            const advocate = advocates.data?.find((a) => a.mobile === o.value);
            const primaryCourt = advocate?.defaultCourts?.[0];
            setForm((prev) => {
              const courtEmpty = !prev.district && !prev.city && !prev.courtName;
              return {
                ...prev,
                primaryAdvocateMobile: toMobile10(o.value),
                primaryAdvocateLabel: `${o.label} · ${toMobile10(o.value)}`,
                // Web parity: pre-fill the court from the advocate's default court when blank.
                ...(courtEmpty && primaryCourt
                  ? {
                      state: primaryCourt.state || "Tamil Nadu",
                      district: primaryCourt.district,
                      city: primaryCourt.city,
                      courtName: primaryCourt.courtName,
                    }
                  : {}),
              };
            });
          }}
        />
        <TextField
          label="Or type advocate mobile"
          value={form.primaryAdvocateMobile}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              primaryAdvocateMobile: v.replace(/\D/g, "").slice(0, 12),
              primaryAdvocateLabel: null,
            }))
          }
          placeholder="10-digit mobile"
          keyboardType="number-pad"
          maxLength={12}
        />
      </Section>

      <Section title="6. Dates & fee" description="Case fee is required">
        <DateField
          label="Filing date"
          value={form.filingDate}
          onChange={(d) => set("filingDate", d)}
        />
        <DateField
          label="Next hearing"
          value={form.nextHearingAt}
          onChange={(d) => set("nextHearingAt", d)}
        />
        <TextField
          label="Case fee (₹) *"
          value={form.agreedFee}
          onChange={(v) => set("agreedFee", v.replace(/[^\d.]/g, ""))}
          placeholder="Total agreed fee"
          keyboardType="decimal-pad"
        />
        <TextArea
          label="Notes"
          value={form.notes}
          onChange={(v) => set("notes", v)}
          placeholder="Brief facts"
          maxLength={2000}
        />
        <Text className="text-xs leading-relaxed text-slate-500">
          Documents (vakalatnama, petition, judgment…) are uploaded from the case page after
          saving — PDF / JPG / PNG up to 10 MB.
        </Text>
      </Section>

      <PrimaryButton label={submitLabel} onPress={handleSubmit} loading={submitting} />
    </FormScrollView>
  );
}
