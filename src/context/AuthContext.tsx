import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { DbProfile, UserRole } from "@/types";

interface AuthContextValue {
  session: Session | null;
  profile: DbProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signInWithMagicLink: (
    email: string,
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = supabase !== null;

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setProfile(null);
    }
  }, []);

  // 1. Restore session on mount (synchronous from storage)
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(
      ({ data: { session: initial } }) => {
        setSession(initial);
        setIsLoading(false);
      },
      (err) => {
        console.error("Failed to restore session:", err);
        setIsLoading(false);
      },
    );

    // 2. Listen for auth changes (sign-in, sign-out, token refresh)
    //    Keep this callback lightweight — no async work here.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Fetch profile whenever the user changes (decoupled from auth callback)
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    fetchProfile(userId);
  }, [userId, fetchProfile]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Supabase is not configured" };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) return { error: "Supabase is not configured" };
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: "Supabase is not configured" };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabase) return { error: "Supabase is not configured" };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const role: UserRole | null = profile?.role ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      role,
      isLoading,
      isConfigured,
      signInWithPassword,
      signInWithMagicLink,
      signInWithGoogle,
      signUp,
      signOut: handleSignOut,
    }),
    [
      session,
      profile,
      role,
      isLoading,
      isConfigured,
      signInWithPassword,
      signInWithMagicLink,
      signInWithGoogle,
      signUp,
      handleSignOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
