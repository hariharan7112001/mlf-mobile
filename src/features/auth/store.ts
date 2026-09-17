import { create } from "zustand";
import { deleteToken, getToken, setToken } from "@/core/storage/secure-store";
import { getMe } from "./api";
import type { PublicUser } from "./types";

type AuthState = {
  user: PublicUser | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (user: PublicUser, accessToken: string) => Promise<void>;
  clearSession: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,

  setSession: async (user, accessToken) => {
    await setToken(accessToken);
    set({ user, accessToken });
  },

  clearSession: () => {
    set({ user: null, accessToken: null });
    deleteToken().catch(() => {});
  },

  hydrate: async () => {
    const token = await getToken();
    if (!token) {
      set({ isHydrated: true });
      return;
    }

    try {
      const { user } = await getMe();
      set({ user, accessToken: token, isHydrated: true });
    } catch {
      await deleteToken().catch(() => {});
      set({ user: null, accessToken: null, isHydrated: true });
    }
  },
}));
