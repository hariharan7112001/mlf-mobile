import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type KeyboardAwareScrollViewProps = {
  children: ReactNode;
};

/**
 * Keeps the focused field visible above the keyboard on both platforms:
 * KeyboardAvoidingView shrinks the available space, the ScrollView lets the
 * user scroll the rest into view. Reused by every auth screen via AuthLayout.
 */
export function KeyboardAwareScrollView({ children }: KeyboardAwareScrollViewProps) {
  return (
    <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
});
