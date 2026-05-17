import type { AuthResponse, LoginInput, RegisterInput, UserResponse } from "@lexguard/types";
import axios from "axios";
import { create } from "zustand";
import { env } from "../env";

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshTokenValue: string | null;
  isLoggedIn: boolean;
  isBootstrapping: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  bootstrapSession: () => Promise<void>;
  loadMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshTokenValue: null,
  isLoggedIn: false,
  isBootstrapping: true,

  login: async (credentials) => {
    const { data } = await axios.post<AuthResponse>(`${env.VITE_API_URL}/auth/login`, credentials, {
      withCredentials: true,
    });
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshTokenValue: data.refreshToken,
      isLoggedIn: true,
      isBootstrapping: false,
    });
  },

  register: async (input) => {
    const { data } = await axios.post<AuthResponse>(`${env.VITE_API_URL}/auth/register`, input, {
      withCredentials: true,
    });
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshTokenValue: data.refreshToken,
      isLoggedIn: true,
      isBootstrapping: false,
    });
  },

  logout: async () => {
    try {
      await axios.post(`${env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // Logout is best-effort; local session must still clear.
    } finally {
      set({
        user: null,
        accessToken: null,
        refreshTokenValue: null,
        isLoggedIn: false,
        isBootstrapping: false,
      });
    }
  },

  refreshToken: async () => {
    try {
      const { data } = await axios.post<AuthResponse>(
        `${env.VITE_API_URL}/auth/refresh`,
        {},
        { timeout: 2000, withCredentials: true },
      );
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshTokenValue: data.refreshToken,
        isLoggedIn: true,
        isBootstrapping: false,
      });
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        refreshTokenValue: null,
        isLoggedIn: false,
        isBootstrapping: false,
      });
      throw error;
    }
  },

  bootstrapSession: async () => {
    set({ isBootstrapping: true });
    try {
      await Promise.race([
        useAuthStore.getState().refreshToken(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session bootstrap timed out")), 1500),
        ),
      ]);
    } catch {
      set({
        user: null,
        accessToken: null,
        refreshTokenValue: null,
        isLoggedIn: false,
        isBootstrapping: false,
      });
    }
  },

  loadMe: async () => {
    const { data } = await axios.get<{ user: UserResponse }>(`${env.VITE_API_URL}/auth/me`, {
      withCredentials: true,
      headers: useAuthStore.getState().accessToken
        ? { Authorization: `Bearer ${useAuthStore.getState().accessToken}` }
        : undefined,
    });
    set({ user: data.user, isLoggedIn: true, isBootstrapping: false });
  },
}));
