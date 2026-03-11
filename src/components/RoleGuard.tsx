import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  allow: UserRole | UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({ allow, fallback = null, children }: RoleGuardProps) {
  const { role, isConfigured } = useAuth();

  // Graceful degradation — no Supabase means show everything
  if (!isConfigured) return <>{children}</>;

  const allowed = Array.isArray(allow) ? allow : [allow];
  if (role && allowed.includes(role)) return <>{children}</>;

  return <>{fallback}</>;
}
