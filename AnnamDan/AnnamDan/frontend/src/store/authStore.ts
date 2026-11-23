import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "donor" | "ngo" | "volunteer" | "admin";

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  verified?: boolean;
  organization?: string;
  district?: string;
  pincode?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (u: AuthUser | null) => void;
  setToken: (t: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) localStorage.setItem("ad_token", token);
        else localStorage.removeItem("ad_token");
        set({ token });
      },
      signOut: () => {
        localStorage.removeItem("ad_token");
        set({ user: null, token: null });
      },
    }),
    { name: "annam-daan-auth" }
  )
);
