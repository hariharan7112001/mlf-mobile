import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type CodeInputProps = {
  length: number;
  value: string;
  onChange: (value: string) => void;
  /** Masks entered digits behind dots with a show/hide toggle — used for PIN, not OTP. */
  secure?: boolean;
  autoFocus?: boolean;
  error?: boolean;
};

/**
 * Shared boxed-digit input. Configured by `length`/`secure` so the same
 * component serves OTP(4) and PIN(6) entry instead of near-duplicate ones.
 */
export function CodeInput({ length, value, onChange, secure, autoFocus, error }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [revealed, setRevealed] = useState(!secure);
  const [focused, setFocused] = useState(false);

  const digits = value.split("");

  return (
    <View>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="flex-row items-center justify-center gap-2"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index];
          const isActive = focused && index === digits.length;
          return (
            <View
              key={index}
              className={`h-14 w-11 items-center justify-center rounded-xl border-2 ${
                error
                  ? "border-red-400 bg-red-50"
                  : isActive
                    ? "border-[#162456] bg-white"
                    : "border-slate-200 bg-white"
              }`}
            >
              <Text className="text-xl font-semibold text-slate-900">
                {digit ? (revealed ? digit : "•") : ""}
              </Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        textContentType={secure ? undefined : "oneTimeCode"}
        className="absolute h-px w-px opacity-0"
      />

      {secure ? (
        <Pressable
          onPress={() => setRevealed((v) => !v)}
          className="mt-3 flex-row items-center justify-center gap-1.5 self-center"
        >
          <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={16} color="#64748b" />
          <Text className="text-xs font-medium text-slate-500">{revealed ? "Hide" : "Show"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
