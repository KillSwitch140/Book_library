import { useLoans } from "@/hooks/useLoans";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type StatusFilter = "all" | "active" | "overdue" | "returned";

const LoansPage = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: loans = [], isLoading, isError, refetch } = useLoans({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Loans</h1>
          <p className="text-muted-foreground font-body mt-1">
            Track all book loans{!isLoading && ` · ${loans.length} records`}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" /> Status
                {statusFilter !== "all" && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                    1
                  </span>
                )}
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {(["all", "active", "overdue", "returned"] as StatusFilter[]).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={statusFilter === s ? "text-primary font-medium" : ""}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
                <div className="h-2.5 bg-secondary rounded animate-pulse w-1/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-sm font-body text-muted-foreground">Failed to load loans.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && loans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm font-body text-muted-foreground">
            {statusFilter !== "all" ? `No ${statusFilter} loans found.` : "No loans recorded yet."}
          </p>
          {statusFilter !== "all" && (
            <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
              Show all
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && loans.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Book</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Member</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Borrowed</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Due</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Returned</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-body font-medium text-foreground">{loan.bookTitle}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.memberName}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.borrowDate}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.dueDate}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.returnDate || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-medium ${
                        loan.status === "active" ? "bg-emerald-500/15 text-emerald-400" :
                        loan.status === "overdue" ? "bg-red-500/15 text-red-400" :
                        "bg-muted text-muted-foreground"
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
    </div>
  );
};

export default LoansPage;
