import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/app-header";
import { FormScrollView } from "@/components/form-scroll-view";
import { ErrorMessage } from "@/components/ui/error-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SelectField } from "@/components/ui/select-field";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import { ApiError } from "@/core/api/client";
import { useIsClientPortal, usePermission } from "@/features/auth/permissions";
import {
  CLIENT_UPLOAD_DOC_TYPES,
  DOCUMENT_TYPE_OPTIONS,
  UPLOAD_MAX_BYTES,
  UPLOAD_MIME_TYPES,
  type DocumentType,
} from "@/features/documents/constants";
import { useUploadCaseDocument } from "@/features/documents/hooks";
import type { PickedFile } from "@/features/documents/types";

export default function UploadCaseDocumentScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const canUpload = usePermission("cases", "upload");
  const clientPortal = useIsClientPortal();
  const upload = useUploadCaseDocument(unitId);

  const [file, setFile] = useState<PickedFile | null>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocumentType>("other");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | undefined>();

  const typeOptions = clientPortal
    ? DOCUMENT_TYPE_OPTIONS.filter((o) => CLIENT_UPLOAD_DOC_TYPES.includes(o.value))
    : DOCUMENT_TYPE_OPTIONS;

  async function pickFile() {
    setError(undefined);
    const result = await DocumentPicker.getDocumentAsync({
      type: UPLOAD_MIME_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    if (asset.size != null && asset.size > UPLOAD_MAX_BYTES) {
      setError("File too large (max 10 MB).");
      return;
    }
    setFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size ?? null,
    });
    if (!title.trim()) setTitle(asset.name.replace(/\.[^.]+$/, ""));
  }

  async function handleSubmit() {
    setError(undefined);
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      await upload.mutateAsync({ file, title: title.trim(), docType, notes: notes.trim() });
      router.back();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Try again.");
    }
  }

  if (!canUpload) {
    return (
      <View className="flex-1 bg-white">
        <AppHeader title="Upload Document" showBack />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="lock-closed-outline" size={28} color="#162456" />
          <Text className="mt-3 text-center text-sm text-slate-500">
            You don&apos;t have access to upload. Ask your admin to grant “Cases · Upload”.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <AppHeader title="Upload Document" showBack />
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <FormScrollView>
          <ErrorMessage message={error} />

          <Pressable
            onPress={pickFile}
            className="mb-5 items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 active:opacity-70"
          >
            <Ionicons
              name={file ? "document-attach-outline" : "cloud-upload-outline"}
              size={28}
              color="#162456"
            />
            <Text className="mt-2 text-center text-sm font-medium text-slate-900" numberOfLines={2}>
              {file ? file.name : "Choose a file"}
            </Text>
            <Text className="mt-1 text-xs text-slate-500">
              {file ? "Tap to change" : "PDF, JPG, PNG or WEBP — up to 10 MB"}
            </Text>
          </Pressable>

          <TextField label="Title *" value={title} onChange={setTitle} maxLength={160} />
          <SelectField
            label="Document type"
            value={docType}
            options={typeOptions}
            onChange={(v) => setDocType(v as DocumentType)}
          />
          <TextArea label="Notes" value={notes} onChange={setNotes} maxLength={500} />

          <View className="mt-2">
            <PrimaryButton label="Upload" onPress={handleSubmit} loading={upload.isPending} />
          </View>
        </FormScrollView>
      </SafeAreaView>
    </View>
  );
}
