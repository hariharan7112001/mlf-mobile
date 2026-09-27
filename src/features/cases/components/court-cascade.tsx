import { useState } from "react";
import { Text, View } from "react-native";
import { PickerField, type PickerOption } from "@/components/ui/picker-field";
import { useDebouncedValue } from "@/core/use-debounced-value";
import { useCourtMeta } from "../hooks";
import type { CourtMetaLevel } from "../types";

export type CourtLocation = {
  state: string;
  district: string;
  city: string;
  courtName: string;
};

type Props = {
  value: CourtLocation;
  onChange: (next: CourtLocation) => void;
};

type LevelFieldProps = {
  label: string;
  level: CourtMetaLevel;
  value: string;
  params: { state?: string; district?: string; complex?: string };
  enabled: boolean;
  placeholder: string;
  onSelect: (option: { name: string }) => void;
};

/** One server-searched level of the court hierarchy. Typed text can always be used as-is ("Other"). */
function LevelField({ label, level, value, params, enabled, placeholder, onSelect }: LevelFieldProps) {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim());
  const meta = useCourtMeta(level, { ...params, q: q || undefined }, enabled);

  const options: PickerOption[] = (meta.data?.options ?? []).map((o) => ({
    value: o.name,
    label: o.name,
  }));
  const typed = search.trim();
  if (typed && !options.some((o) => o.label.toLowerCase() === typed.toLowerCase())) {
    options.push({ value: typed, label: `Use “${typed}”`, sublabel: "Not in the list" });
  }

  return (
    <PickerField
      label={label}
      placeholder={enabled ? placeholder : "Select the level above first"}
      selectedLabel={value || null}
      options={options}
      loading={meta.isLoading}
      search={search}
      onSearchChange={setSearch}
      disabled={!enabled}
      onSelect={(option) => {
        onSelect({ name: option.value });
        setSearch("");
      }}
    />
  );
}

/**
 * State → District → City / complex → Court, backed by GET /api/courts/meta (the same
 * all-India catalog as the web CourtCascade; it resolves states by name or code).
 * Changing a level clears the ones below.
 */
export function CourtCascade({ value, onChange }: Props) {
  return (
    <View>
      <Text className="mb-3 text-xs leading-relaxed text-slate-500">
        Search each level, or type a name that isn&apos;t listed and pick “Use …”.
      </Text>
      <LevelField
        label="State *"
        level="states"
        value={value.state}
        params={{}}
        enabled
        placeholder="Select state"
        onSelect={({ name }) => onChange({ state: name, district: "", city: "", courtName: "" })}
      />
      <LevelField
        label="District *"
        level="districts"
        value={value.district}
        params={{ state: value.state }}
        enabled={Boolean(value.state)}
        placeholder="Select district"
        onSelect={({ name }) => onChange({ ...value, district: name, city: "", courtName: "" })}
      />
      <LevelField
        label="City / court complex *"
        level="complexes"
        value={value.city}
        params={{ state: value.state, district: value.district }}
        enabled={Boolean(value.district)}
        placeholder="Select city / complex"
        onSelect={({ name }) => onChange({ ...value, city: name, courtName: "" })}
      />
      <LevelField
        label="Court *"
        level="courts"
        value={value.courtName}
        params={{ state: value.state, district: value.district, complex: value.city }}
        enabled={Boolean(value.city)}
        placeholder="Select court"
        onSelect={({ name }) => onChange({ ...value, courtName: name })}
      />
    </View>
  );
}
