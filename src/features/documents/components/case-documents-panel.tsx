import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { ApiError } from "@/core/api/client";
import { useDeleteCaseDocument, useDownloadDocument } from "../hooks";
import type { DocumentSummary } from "../types";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string) {
  return mimeType === "application/pdf" ? "document-text-outline" : "image-outline";
}

type Props = {
  caseUnitId: string;
  documents: DocumentSummary[];
  canUpload: boolean;
  canDelete: boolean;
};

/**
 * Case documents with access gating from the user's permissions:
 * list/open needs cases.view (already required to see the case), upload needs cases.upload,
 * delete needs cases.upload and is never offered to client-portal logins. The server
 * re-checks all three (features/documents/server/access.ts).
 */
export function CaseDocumentsPanel({ caseUnitId, documents, canUpload, canDelete }: Props) {
  const download = useDownloadDocument();
  const remove = useDeleteCaseDocument(caseUnitId);

  async function open(doc: DocumentSummary) {
    try {
      await download.mutateAsync(doc);
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof Error ? err.message : "Could not open the file.";
      Alert.alert("Document", message);
    }
  }

  function confirmDelete(doc: DocumentSummary) {
    Alert.alert("Delete document?", `“${doc.title}” will be removed for everyone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await remove.mutateAsync(doc.unitId);
          } catch (err) {
            Alert.alert("Document", err instanceof ApiError ? err.message : "Could not delete.");
          }
        },
      },
    ]);
  }

  return (
    <View className="mb-5 rounded-2xl border border-slate-100 bg-white p-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-[#162456]">Documents</Text>
        {canUpload ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/cases/[unitId]/upload", params: { unitId: caseUnitId } })
            }
            className="flex-row items-center rounded-full bg-[#162456] px-3 py-1.5 active:opacity-70"
          >
            <Ionicons name="cloud-upload-outline" size={15} color="#FFFFFF" />
            <Text className="ml-1 text-xs font-semibold text-white">Upload</Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="mb-2 text-xs text-slate-500">
        Judgments, orders, pleadings, vakalatnama… Tap to open or share.
      </Text>

      {documents.length === 0 ? (
        <Text className="py-4 text-center text-sm text-slate-400">No documents uploaded yet.</Text>
      ) : (
        documents.map((doc) => {
          const busy = download.isPending && download.variables?.unitId === doc.unitId;
          return (
            <Pressable
              key={doc.unitId}
              onPress={() => open(doc)}
              disabled={download.isPending}
              className="flex-row items-center border-b border-slate-100 py-3 active:opacity-60"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#162456]/10">
                <Ionicons name={fileIcon(doc.mimeType)} size={20} color="#162456" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-slate-900" numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text className="text-xs text-slate-500" numberOfLines={1}>
                  {doc.docTypeLabel} · {formatSize(doc.size)} ·{" "}
                  {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                </Text>
              </View>
              {busy ? (
                <ActivityIndicator size="small" color="#162456" />
              ) : (
                <Ionicons name="share-outline" size={19} color="#64748b" />
              )}
              {canDelete ? (
                <Pressable
                  onPress={() => confirmDelete(doc)}
                  hitSlop={8}
                  className="ml-3 h-8 w-8 items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </Pressable>
              ) : null}
            </Pressable>
          );
        })
      )}
    </View>
  );
}
