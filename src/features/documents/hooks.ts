import { useMutation, useQueryClient } from "@tanstack/react-query";
import { caseDetailKey } from "@/features/cases/hooks";
import * as documentsApi from "./api";
import type { UploadDocumentInput } from "./api";

/**
 * Case documents are read from the case detail response (GET /api/cases/:id), so writes
 * invalidate that query rather than a separate documents list.
 */
export function useUploadCaseDocument(caseUnitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<UploadDocumentInput, "caseUnitId">) =>
      documentsApi.uploadDocument({ ...input, caseUnitId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: caseDetailKey(caseUnitId) }),
  });
}

export function useDeleteCaseDocument(caseUnitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentUnitId: string) => documentsApi.deleteDocument(documentUnitId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: caseDetailKey(caseUnitId) }),
  });
}

export function useDownloadDocument() {
  return useMutation({ mutationFn: documentsApi.downloadAndShareDocument });
}
