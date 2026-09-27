import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { ApiError } from "@/core/api/client";
import { CaseForm, caseToFormState } from "@/features/cases/components/case-form";
import { useCase, useUpdateCase } from "@/features/cases/hooks";
import type { CaseDetailResponse } from "@/features/cases/types";

function EditCaseForm({ unitId, detail }: { unitId: string; detail: CaseDetailResponse }) {
  const updateCase = useUpdateCase(unitId);
  const [initial] = useState(() => caseToFormState(detail.case, detail.client?.name ?? null));
  const [error, setError] = useState<string | undefined>();

  return (
    <CaseForm
      initial={initial}
      clientLocked
      submitLabel="Save Changes"
      submitting={updateCase.isPending}
      error={error}
      onSubmit={async ({ clientUnitId: _client, status: _status, ...input }) => {
        setError(undefined);
        try {
          await updateCase.mutateAsync(input);
          router.back();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Could not save changes.");
        }
      }}
    />
  );
}

export default function EditCaseScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { data, isLoading } = useCase(unitId);

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Edit Case" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        {isLoading || !data ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#162456" />
          </View>
        ) : (
          <EditCaseForm key={unitId} unitId={unitId} detail={data} />
        )}
      </SafeAreaView>
    </View>
  );
}
