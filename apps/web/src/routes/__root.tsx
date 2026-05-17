import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Navigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { AppTopBar } from "../components/layout/AppTopBar";
import { MobileNav } from "../components/layout/MobileNav";
import { ShellFooter } from "../components/layout/ShellFooter";
import { Sidebar } from "../components/layout/Sidebar";
import { getLoginRedirect, isProtectedPath } from "../lib/authGuards";
import { type AuthState, useAuthStore } from "../store/auth.store";

interface RouterContext {
  queryClient: QueryClient;
  auth: AuthState | undefined;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const auth = useAuthStore();
  const isPublicRoute = ["/", "/login", "/signup"].includes(pathname);

  if (isProtectedPath(pathname) && auth?.isBootstrapping) {
    return <div className="grid min-h-screen place-items-center bg-bg text-text">Loading...</div>;
  }

  if (isProtectedPath(pathname) && !auth?.isLoggedIn) {
    return <Navigate to={getLoginRedirect(pathname)} replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text selection:bg-primary-container/30 font-sans">
      {!isPublicRoute && <Sidebar />}

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {!isPublicRoute && <AppTopBar />}
        <main
          className={`relative flex-1 overflow-y-auto ${!isPublicRoute ? "pb-20 md:pb-0" : ""}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          {!isPublicRoute && <ShellFooter />}
        </main>
      </div>

      {!isPublicRoute && <MobileNav />}
    </div>
  );
}
