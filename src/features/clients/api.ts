import { apiGet, apiPatch, apiPost } from "@/core/api/client";
import { CLIENTS_API } from "./constants";
import type { CreateClientInput, UpdateClientInput } from "./schemas";
import type { ClientCaseSummary, ClientSummary } from "./types";

export type ClientResponse = { client: ClientSummary };

export type ClientDetailResponse = {
  client: ClientSummary;
  cases: ClientCaseSummary[];
  payments: unknown[];
  documents: unknown[];
  fee: unknown | null;
  portal: unknown;
};

export function listClients(params?: { q?: string }) {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  const qs = query.toString();
  return apiGet<ClientSummary[]>(`${CLIENTS_API.list}${qs ? `?${qs}` : ""}`);
}

export function createClient(body: CreateClientInput) {
  return apiPost<ClientResponse>(CLIENTS_API.create, body);
}

export function getClient(unitId: string) {
  return apiGet<ClientDetailResponse>(CLIENTS_API.detail(unitId));
}

export function updateClient(unitId: string, body: UpdateClientInput) {
  return apiPatch<ClientResponse>(CLIENTS_API.detail(unitId), body);
}
