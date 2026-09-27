import { useMemo, useState } from "react";
import { PickerField, type PickerOption } from "./picker-field";

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  /** Offer the typed search text as a value — the mobile take on the web's SelectOrOther. */
  allowCustom?: boolean;
  disabled?: boolean;
};

/** PickerField over a static option list, filtered locally. */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  allowCustom,
  disabled,
}: SelectFieldProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = q
      ? options.filter(
          (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
        )
      : [...options];
    const typed = search.trim();
    if (allowCustom && typed && !options.some((o) => o.value.toLowerCase() === typed.toLowerCase())) {
      matches.push({ value: typed, label: `Use “${typed}”`, sublabel: "Not in the list" });
    }
    return matches;
  }, [options, search, allowCustom]);

  const selectedLabel = value ? (options.find((o) => o.value === value)?.label ?? value) : null;

  return (
    <PickerField
      label={label}
      placeholder={placeholder}
      selectedLabel={selectedLabel}
      options={filtered}
      search={search}
      onSearchChange={setSearch}
      disabled={disabled}
      onSelect={(option) => {
        onChange(option.value);
        setSearch("");
      }}
    />
  );
}
