import { supabase } from "@/lib/supabase";
import type { MemberView } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FetchMembersOpts {
  search?: string;
  status?: "active" | "suspended";
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchMembers(opts: FetchMembersOpts = {}): Promise<MemberView[]> {
  if (!supabase) throw new Error("Supabase not configured");

  // 1. Fetch all profiles
  let profileQuery = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts.status === "suspended") {
    profileQuery = profileQuery.eq("is_suspended", true);
  } else if (opts.status === "active") {
    profileQuery = profileQuery.eq("is_suspended", false);
  }

  if (opts.search) {
    profileQuery = profileQuery.or(
      `full_name.ilike.%${opts.search}%,email.ilike.%${opts.search}%`,
    );
  }

  const { data: profiles, error: profileErr } = await profileQuery;
  if (profileErr) throw profileErr;
  if (!profiles || profiles.length === 0) return [];

  // 2. Fetch active loan counts in a single aggregated query
  const { data: loanCounts, error: loanErr } = await supabase
    .from("loans")
    .select("member_id")
    .in("status", ["active", "overdue"]);

  if (loanErr) throw loanErr;

  // Build a map: member_id → count
  const countMap = new Map<string, number>();
  for (const row of loanCounts ?? []) {
    countMap.set(row.member_id, (countMap.get(row.member_id) ?? 0) + 1);
  }

  // 3. Merge into MemberView
  return profiles.map((p) => ({
    id: p.id,
    name: p.full_name,
    email: p.email,
    role: p.role as "member" | "librarian" | "admin",
    memberSince: p.created_at.slice(0, 10),
    activeLoans: countMap.get(p.id) ?? 0,
    status: p.is_suspended ? ("suspended" as const) : ("active" as const),
  }));
}

export async function fetchMember(id: string): Promise<MemberView | null> {
  if (!supabase) throw new Error("Supabase not configured");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!profile) return null;

  // Fetch active loan count for this member
  const { data: loans, error: loanErr } = await supabase
    .from("loans")
    .select("id")
    .eq("member_id", id)
    .in("status", ["active", "overdue"]);

  if (loanErr) throw loanErr;

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role as "member" | "librarian" | "admin",
    memberSince: profile.created_at.slice(0, 10),
    activeLoans: loans?.length ?? 0,
    status: profile.is_suspended ? "suspended" : "active",
  };
}

export async function toggleMemberSuspension(
  id: string,
  suspend: boolean,
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", id);

  if (error) throw error;
}

export async function fetchMemberCount(): Promise<number> {
  if (!supabase) throw new Error("Supabase not configured");

  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_suspended", false);

  if (error) throw error;
  return count ?? 0;
}
