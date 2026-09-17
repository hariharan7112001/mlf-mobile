import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

type FormScrollViewProps = {
  children: ReactNode;
};

/** Top-aligned keyboard-avoiding scroll container for longer CRUD forms (leave/clients/appointments) — unlike KeyboardAwareScrollView, content isn't vertically centered. */
export function FormScrollView({ children }: FormScrollViewProps) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
});
