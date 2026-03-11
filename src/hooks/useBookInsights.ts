import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  fetchBookInsights,
  generateBookInsights,
} from "@/lib/insightsQueries";
import { toast } from "sonner";
import type { BookInsightsView } from "@/types";

/** Read cached insights (passive — never triggers generation). */
export function useBookInsights(bookId: string | undefined) {
  return useQuery<BookInsightsView | null>({
    queryKey: ["bookInsights", bookId],
    queryFn: () => {
      if (!bookId) return null;
      return fetchBookInsights(bookId);
    },
    enabled: !!bookId,
    staleTime: Infinity,
  });
}

/** Mutation to trigger insight generation (explicit user action). */
export function useGenerateInsights() {
  const qc = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const token = session?.access_token;
      if (!token) throw new Error("You must be signed in to generate insights");
      return generateBookInsights(bookId, token);
    },
    onSuccess: (data, bookId) => {
      qc.invalidateQueries({ queryKey: ["bookInsights", bookId] });
      toast.success(
        data.cached ? "Insights loaded" : "Insights generated successfully",
      );
    },
    onError: (err: Error) => {
      toast.error(`Insights failed: ${err.message}`);
    },
  });
}
