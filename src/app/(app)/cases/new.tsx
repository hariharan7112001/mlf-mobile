import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { ApiError } from "@/core/api/client";
import { CaseForm, emptyCaseForm } from "@/features/cases/components/case-form";
import { useCreateCase } from "@/features/cases/hooks";

export default function RegisterCaseScreen() {
  // Opened from a client's page → that client is pre-selected (web: ?clientUnitId=&new=1).
  const { clientUnitId, clientName } = useLocalSearchParams<{
    clientUnitId?: string;
    clientName?: string;
  }>();
  const [initial] = useState(() =>
    emptyCaseForm(clientUnitId ? { unitId: clientUnitId, name: clientName ?? clientUnitId } : null)
  );
  const createCase = useCreateCase();
  const [error, setError] = useState<string | undefined>();

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Register Case" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <CaseForm
          initial={initial}
          submitLabel="Save & create CSE id"
          submitting={createCase.isPending}
          error={error}
          onSubmit={async (input) => {
            setError(undefined);
            try {
              const { case: created } = await createCase.mutateAsync({ ...input, status: "enquiry" });
              Alert.alert("Case registered", `Saved ${created.unitId}. You can upload documents now.`);
              router.replace({ pathname: "/cases/[unitId]", params: { unitId: created.unitId } });
            } catch (err) {
              setError(err instanceof ApiError ? err.message : "Could not register the case.");
            }
          }}
        />
      </SafeAreaView>
    </View>
  );
}
