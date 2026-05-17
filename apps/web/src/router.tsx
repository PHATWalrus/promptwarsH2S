import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined, // Will be injected in RouterProvider
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
