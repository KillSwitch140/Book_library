import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  fetchMembers,
  fetchMember,
  fetchMemberCount,
  toggleMemberSuspension,
  type FetchMembersOpts,
} from "@/lib/memberQueries";
import { members as mockMembers } from "@/data/mockData";
import type { MemberView } from "@/types";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function filterMockMembers(opts: FetchMembersOpts): MemberView[] {
  let result: MemberView[] = mockMembers.map((m) => ({
    ...m,
    role: "member" as const,
  }));
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

export function useMember(id: string | undefined) {
  return useQuery<MemberView | null>({
    queryKey: ["members", id],
    queryFn: () => {
      if (!id) return null;
      if (!supabase) {
        const mock = mockMembers.find((m) => m.id === id);
        return mock ? { ...mock, role: "member" as const } : null;
      }
      return fetchMember(id);
    },
    enabled: !!id,
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

export function useToggleSuspension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) =>
      toggleMemberSuspension(id, suspend),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
    },
  });
}
