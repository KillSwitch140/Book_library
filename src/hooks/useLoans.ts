import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  fetchLoans,
  fetchBookLoanHistory,
  fetchMyLoans,
  type FetchLoansOpts,
  type MyLoanView,
} from "@/lib/loanQueries";
import { loans as mockLoans } from "@/data/mockData";
import type { LoanView } from "@/types";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function filterMockLoans(opts: FetchLoansOpts): LoanView[] {
  let result = [...mockLoans];
  if (opts.status) result = result.filter((l) => l.status === opts.status);
  if (opts.limit) result = result.slice(0, opts.limit);
  return result;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useLoans(opts: FetchLoansOpts = {}) {
  const { memberId, bookId, status, limit } = opts;
  return useQuery<LoanView[]>({
    queryKey: ["loans", { memberId, bookId, status, limit }],
    queryFn: () => {
      if (!supabase) return filterMockLoans(opts);
      return fetchLoans(opts);
    },
  });
}

export function useBookLoanHistory(bookId: string | undefined) {
  return useQuery<LoanView[]>({
    queryKey: ["loans", "bookHistory", bookId],
    queryFn: () => {
      if (!bookId) return [];
      if (!supabase) return []; // no meaningful mock for per-book history
      return fetchBookLoanHistory(bookId);
    },
    enabled: !!bookId,
  });
}

export function useMyLoans(memberId: string | undefined) {
  return useQuery<MyLoanView[]>({
    queryKey: ["loans", "my", memberId],
    queryFn: () => {
      if (!memberId) return [];
      if (!supabase) return []; // no meaningful mock fallback for member loans
      return fetchMyLoans(memberId);
    },
    enabled: !!memberId,
  });
}
