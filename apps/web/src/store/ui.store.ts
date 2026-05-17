import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  theme: "dark" | "light";
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(newTheme);
      return { theme: newTheme };
    }),
}));
