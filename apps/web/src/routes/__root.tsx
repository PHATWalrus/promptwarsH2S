import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { MobileNav } from "../components/layout/MobileNav";
import { Sidebar } from "../components/layout/Sidebar";

interface RouterContext {
  queryClient: QueryClient;
  auth: any; // We'll refine this later
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isPublicRoute = ["/", "/login", "/signup"].includes(pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text selection:bg-primary/30 font-sans">
      {!isPublicRoute && <Sidebar />}

      <main className={`flex-1 relative overflow-y-auto ${!isPublicRoute ? "pb-16 md:pb-0" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isPublicRoute && <MobileNav />}
    </div>
  );
}
