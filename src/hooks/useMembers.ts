import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  fetchMembers,
  fetchMemberCount,
  type FetchMembersOpts,
} from "@/lib/memberQueries";
import { members as mockMembers } from "@/data/mockData";
import type { MemberView } from "@/types";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function filterMockMembers(opts: FetchMembersOpts): MemberView[] {
  let result = [...mockMembers];
  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }
  if (opts.status) {
    result = result.filter((m) => m.status === opts.status);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useMembers(opts: FetchMembersOpts = {}) {
  const { search, status } = opts;
  return useQuery<MemberView[]>({
    queryKey: ["members", { search, status }],
    queryFn: () => {
      if (!supabase) return filterMockMembers(opts);
      return fetchMembers(opts);
    },
  });
}

export function useMemberCount() {
  return useQuery<number>({
    queryKey: ["members", "count"],
    queryFn: () => {
      if (!supabase) return mockMembers.filter((m) => m.status === "active").length;
      return fetchMemberCount();
    },
  });
}
