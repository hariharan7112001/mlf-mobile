import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as clientsApi from "./api";
import type { CreateClientInput, UpdateClientInput } from "./schemas";

const CLIENTS_LIST_KEY = ["clients", "list"];
const clientDetailKey = (unitId: string) => ["clients", "detail", unitId];

export function useClients(q?: string) {
  return useQuery({
    queryKey: [...CLIENTS_LIST_KEY, q ?? ""],
    queryFn: () => clientsApi.listClients({ q }),
  });
}

export function useClient(unitId: string) {
  return useQuery({
    queryKey: clientDetailKey(unitId),
    queryFn: () => clientsApi.getClient(unitId),
    enabled: Boolean(unitId),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateClientInput) => clientsApi.createClient(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENTS_LIST_KEY }),
  });
}

export function useUpdateClient(unitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateClientInput) => clientsApi.updateClient(unitId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: clientDetailKey(unitId) });
    },
  });
}
