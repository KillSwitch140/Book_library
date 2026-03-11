import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes — library data isn't real-time
      gcTime: 10 * 60 * 1000, // 10 minutes — good for back-nav caching
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // never retry borrows/returns
    },
  },
});
