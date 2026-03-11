import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  requiredRole?: UserRole | UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { isConfigured, isLoading, session, role } = useAuth();
  const location = useLocation();

  // Graceful degradation — no Supabase means no gating
  if (!isConfigured) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!role || !allowed.includes(role)) {
      return (
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="text-center space-y-4 max-w-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Access Denied
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              You don't have permission to view this page. Contact a librarian
              or administrator if you believe this is an error.
            </p>
            <a
              href="/"
              className="inline-block text-sm font-body text-copper hover:underline"
            >
              Go to Home
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
