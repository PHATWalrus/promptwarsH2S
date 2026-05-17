import type { AuthResponse, LoginInput, RegisterInput, UserResponse } from "@lexguard/types";
import axios from "axios";
import { create } from "zustand";
import { env } from "../env";

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshTokenValue: string | null;
  isLoggedIn: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  loadMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshTokenValue: null,
  isLoggedIn: false,

  login: async (credentials) => {
    const { data } = await axios.post<AuthResponse>(`${env.VITE_API_URL}/auth/login`, credentials, {
      withCredentials: true,
    });
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshTokenValue: data.refreshToken,
      isLoggedIn: true,
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
    });
  },

  logout: async () => {
    try {
      await axios.post(`${env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // Logout is best-effort; local session must still clear.
    } finally {
      set({ user: null, accessToken: null, refreshTokenValue: null, isLoggedIn: false });
    }
  },

  refreshToken: async () => {
    try {
      const { data } = await axios.post<AuthResponse>(
        `${env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshTokenValue: data.refreshToken,
        isLoggedIn: true,
      });
    } catch (error) {
      set({ user: null, accessToken: null, refreshTokenValue: null, isLoggedIn: false });
      throw error;
    }
  },

  loadMe: async () => {
    const { data } = await axios.get<{ user: UserResponse }>(`${env.VITE_API_URL}/auth/me`, {
      withCredentials: true,
      headers: useAuthStore.getState().accessToken
        ? { Authorization: `Bearer ${useAuthStore.getState().accessToken}` }
        : undefined,
    });
    set({ user: data.user, isLoggedIn: true });
  },
}));
