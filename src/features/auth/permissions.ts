import { useAuthStore } from "./store";

/**
 * Permission keys are "<module>.<action>" (e.g. "cases.upload") — mirrors the backend's
 * lib/rbac permKey. UI gating only; the server re-checks every request.
 */
export function hasPermission(permissions: string[] | undefined, module: string, action: string) {
  return Boolean(permissions?.includes(`${module}.${action}`));
}

export function usePermission(module: string, action: string): boolean {
  return useAuthStore((s) => hasPermission(s.user?.permissions, module, action));
}

/** Client-portal logins see a reduced case view (no fee, no internal notes). */
export function useIsClientPortal(): boolean {
  return useAuthStore((s) => {
    const roles = s.user?.roles ?? [];
    return roles.length > 0 && roles.every((r) => r === "client");
  });
}
