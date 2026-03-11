import { useParams, useNavigate, Link } from "react-router-dom";
import { useMember, useToggleSuspension } from "@/hooks/useMembers";
import { useLoans } from "@/hooks/useLoans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/RoleGuard";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const MemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: member, isLoading, isError } = useMember(id);
  const { data: loans = [], isLoading: loansLoading } = useLoans({ memberId: id });
  const toggleSuspension = useToggleSuspension();
  const [suspendOpen, setSuspendOpen] = useState(false);

  const activeLoans = loans.filter((l) => l.status === "active" || l.status === "overdue");
  const overdueCount = loans.filter((l) => l.status === "overdue").length;

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto animate-fade-in space-y-6">
        <div className="h-4 w-16 bg-secondary rounded animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-secondary rounded animate-pulse w-1/3" />
          <div className="h-4 bg-secondary rounded animate-pulse w-1/4" />
        </div>
        <div className="h-40 bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <h1 className="text-2xl font-display font-bold text-foreground">Member Not Found</h1>
        <p className="text-muted-foreground font-body">The member you're looking for doesn't exist.</p>
        <Button variant="outline" onClick={() => navigate("/members")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Members
        </Button>
      </div>
    );
  }

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate("/members")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Members
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-body font-semibold text-secondary-foreground">
              {initials}
            </span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {member.name}
            </h1>
            <p className="text-sm font-body text-muted-foreground mt-0.5">{member.email}</p>
          </div>
        </div>

        <RoleGuard allow="admin">
          {member.status === "suspended" ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setSuspendOpen(true)}
            >
              <ShieldCheck className="w-4 h-4" /> Unsuspend Member
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setSuspendOpen(true)}
            >
              <ShieldAlert className="w-4 h-4" /> Suspend Member
            </Button>
          )}
        </RoleGuard>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Role">
          <Badge
            variant={member.role === "admin" ? "copper" : member.role === "librarian" ? "secondary" : "outline"}
            className="text-xs capitalize"
          >
            {member.role}
          </Badge>
        </InfoCard>
        <InfoCard label="Status">
          <Badge
            variant={member.status === "active" ? "available" : member.status === "suspended" ? "destructive" : "secondary"}
          >
            {member.status}
          </Badge>
        </InfoCard>
        <InfoCard label="Member Since">
          <span className="text-sm font-body text-foreground">{member.memberSince}</span>
        </InfoCard>
        <InfoCard label="Active Loans">
          <span className="text-sm font-body text-foreground">
            {activeLoans.length}
            {overdueCount > 0 && (
              <span className="ml-1.5 text-red-400 text-xs">({overdueCount} overdue)</span>
            )}
          </span>
        </InfoCard>
      </div>

      {/* Active Loans */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground px-1">
          Active Loans
        </h2>

        {loansLoading ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-4 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-sm font-body text-muted-foreground">No active loans.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Book</th>
                    <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Copy</th>
                    <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Borrowed</th>
                    <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Due</th>
                    <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.map((loan) => (
                    <tr key={loan.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-body font-medium text-foreground">
                        {loan.bookId ? (
                          <Link
                            to={`/book/${loan.bookId}`}
                            className="hover:underline hover:text-copper transition-colors"
                          >
                            {loan.bookTitle}
                          </Link>
                        ) : (
                          loan.bookTitle
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {loan.copyId ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono text-muted-foreground bg-secondary">
                            #{loan.copyId.slice(-4)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.borrowDate}</td>
                      <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.dueDate}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-medium ${
                          loan.status === "overdue" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                        }`}>
                          <Clock className="w-3 h-3" />
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Suspend/Unsuspend Dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {member.status === "suspended" ? "Unsuspend" : "Suspend"} Member
            </DialogTitle>
            <DialogDescription className="font-body">
              {member.status === "suspended" ? (
                <>
                  Are you sure you want to unsuspend{" "}
                  <span className="text-foreground font-medium">{member.name}</span>?
                  They will regain full access to the library.
                </>
              ) : (
                <>
                  Are you sure you want to suspend{" "}
                  <span className="text-foreground font-medium">{member.name}</span>?
                  They will not be able to borrow books or place reservations.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant={member.status === "suspended" ? "default" : "destructive"}
              className="gap-2"
              disabled={toggleSuspension.isPending}
              onClick={() => {
                toggleSuspension.mutate(
                  { id: member.id, suspend: member.status !== "suspended" },
                  { onSuccess: () => setSuspendOpen(false) },
                );
              }}
            >
              {toggleSuspension.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : member.status === "suspended" ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              {member.status === "suspended" ? "Unsuspend" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
    <p className="text-[11px] font-body uppercase tracking-wider text-muted-foreground">{label}</p>
    {children}
  </div>
);

export default MemberDetailPage;
