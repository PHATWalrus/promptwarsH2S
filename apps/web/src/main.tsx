import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { queryClient, router } from "./router";
import { useAuthStore } from "./store/auth.store";
import { useUiStore } from "./store/ui.store";
import "./styles/globals.css";

function App() {
  const auth = useAuthStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const theme = useUiStore((state) => state.theme);
  const didAttemptRefresh = React.useRef(false);

  // Set the theme class on HTML element
  React.useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  }, [theme]);

  React.useEffect(() => {
    if (!isLoggedIn && !didAttemptRefresh.current) {
      didAttemptRefresh.current = true;
      refreshToken().catch(() => {
        // Anonymous sessions are expected on public routes.
      });
    }
  }, [isLoggedIn, refreshToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth }} />
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element was not found");
}
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
