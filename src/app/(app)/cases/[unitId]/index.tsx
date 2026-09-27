import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { ErrorMessage } from "@/components/ui/error-message";
import { ApiError } from "@/core/api/client";
import { useIsClientPortal, usePermission } from "@/features/auth/permissions";
import { CaseFilingChecklist } from "@/features/cases/components/case-filing-checklist";
import { CaseHearingsPanel } from "@/features/cases/components/case-hearings-panel";
import { CaseStatusStrip } from "@/features/cases/components/case-status-strip";
import { CaseStatusBadge } from "@/features/cases/components/case-status-badge";
import {
  normalizeCaseStatus,
  OUR_SIDE_OPTIONS,
  PRE_NUMBER_STATUSES,
} from "@/features/cases/constants";
import { useCase } from "@/features/cases/hooks";
import type { CaseDetailResponse } from "@/features/cases/types";
import { CaseDocumentsPanel } from "@/features/documents/components/case-documents-panel";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function rupee(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between border-b border-slate-100 py-2.5">
      <Text className="mr-4 text-sm text-slate-500">{label}</Text>
      <Text className="flex-1 text-right text-sm font-medium text-slate-900">{value}</Text>
    </View>
  );
}

function CaseDetail({ detail }: { detail: CaseDetailResponse }) {
  const item = detail.case;
  const clientPortal = useIsClientPortal();
  const canEdit = usePermission("cases", "edit") && !clientPortal;
  const canUpload = usePermission("cases", "upload");
  const showChecklist =
    !clientPortal && PRE_NUMBER_STATUSES.includes(normalizeCaseStatus(item.status));
  const ourSide = OUR_SIDE_OPTIONS.find((o) => o.value === item.ourSide)?.label ?? item.ourSide;

  return (
    <>
      <View className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <View className="flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text className="text-lg font-semibold text-slate-900">
              {item.caseNumber || item.filingNumber || item.unitId}
            </Text>
            {detail.client ? (
              <Text className="mt-0.5 text-sm text-slate-500">
                {detail.client.name} · +91 {detail.client.mobile}
              </Text>
            ) : null}
          </View>
          {canEdit ? (
            <Pressable
              onPress={() =>
                router.push({ pathname: "/cases/[unitId]/edit", params: { unitId: item.unitId } })
              }
              className="flex-row items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 active:opacity-70"
            >
              <Ionicons name="create-outline" size={15} color="#162456" />
              <Text className="ml-1 text-xs font-semibold text-[#162456]">Edit</Text>
            </Pressable>
          ) : null}
        </View>
        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <View className="rounded-full bg-white px-3 py-1">
            <Text className="text-xs font-semibold text-slate-600">{item.unitId}</Text>
          </View>
          {item.caseType ? (
            <View className="rounded-full bg-white px-3 py-1">
              <Text className="text-xs font-semibold text-slate-600">{item.caseType}</Text>
            </View>
          ) : null}
          {item.stage ? (
            <View className="rounded-full bg-[#162456] px-3 py-1">
              <Text className="text-xs font-semibold text-white">{item.stage}</Text>
            </View>
          ) : null}
          {clientPortal ? <CaseStatusBadge status={item.status} /> : null}
        </View>
      </View>

      {!clientPortal ? <CaseStatusStrip item={item} canEdit={canEdit} /> : null}
      {showChecklist ? <CaseFilingChecklist item={item} canEdit={canEdit} /> : null}

      <View className="mb-5 rounded-2xl border border-slate-100 bg-white px-4 py-2">
        <InfoRow
          label="Court"
          value={
            [item.courtName, [item.city, item.district, item.state].filter(Boolean).join(", ")]
              .filter(Boolean)
              .join("\n") || null
          }
        />
        <InfoRow label="Next hearing" value={formatDate(item.nextHearingAt)} />
        <InfoRow label="Court case no." value={item.caseNumber ?? "Not allotted yet"} />
        <InfoRow label="Filing no." value={item.filingNumber} />
        <InfoRow label="Year" value={item.caseYear != null ? String(item.caseYear) : null} />
        <InfoRow label="CNR" value={item.cnr} />
        <InfoRow label="Filing date" value={item.filingDate ? formatDate(item.filingDate) : null} />
        <InfoRow label="Our client appears as" value={ourSide} />
        <InfoRow label="Opposite party" value={item.opposingParty} />
        <InfoRow label="Under acts" value={item.underActs} />
        <InfoRow label="Police station" value={item.policeStation} />
        <InfoRow label="FIR / Crime no." value={item.firNumber} />
        <InfoRow
          label="Primary advocate"
          value={item.primaryAdvocateMobile ? `+91 ${item.primaryAdvocateMobile}` : null}
        />
        {!clientPortal ? (
          <InfoRow label="Case fee" value={item.agreedFee != null ? rupee(item.agreedFee) : null} />
        ) : null}
        {!clientPortal ? <InfoRow label="Notes" value={item.notes} /> : null}
      </View>

      {/* Documents first — judgments/orders are the office's primary need (same order as web). */}
      <CaseDocumentsPanel
        caseUnitId={item.unitId}
        documents={detail.documents}
        canUpload={canUpload}
        canDelete={canUpload && !clientPortal}
      />

      <CaseHearingsPanel
        caseUnitId={item.unitId}
        hearings={detail.hearings}
        canEdit={canEdit}
        clientPortal={clientPortal}
      />
    </>
  );
}

export default function CaseDetailScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { data, isLoading, isFetching, refetch, error } = useCase(unitId);

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Case" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#162456" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          >
            <ErrorMessage
              message={error instanceof ApiError ? error.message : error ? "Could not load the case." : undefined}
            />
            {data ? <CaseDetail detail={data} /> : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
