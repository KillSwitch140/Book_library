import { useMembers } from "@/hooks/useMembers";
import type { FetchMembersOpts } from "@/lib/memberQueries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter, ChevronDown, AlertCircle } from "lucide-react";
import { useState } from "react";

type StatusFilter = "all" | "active" | "suspended";

const MembersPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const opts: FetchMembersOpts = {
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: members = [], isLoading, isError, refetch } = useMembers(opts);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground font-body mt-1">
            Manage library members{!isLoading && ` · ${members.length} members`}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
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
            {(["all", "active", "suspended"] as StatusFilter[]).map((s) => (
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

      {/* Loading */}
      {isLoading && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-secondary animate-pulse flex-shrink-0" />
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
          <p className="text-sm font-body text-muted-foreground">Failed to load members.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm font-body text-muted-foreground">
            {search || statusFilter !== "all"
              ? "No members match your filters."
              : "No members registered yet."}
          </p>
          {(search || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && members.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Name</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Email</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Member Since</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Active Loans</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-body font-semibold text-secondary-foreground">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span className="text-sm font-body font-medium text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{member.email}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{member.memberSince}</td>
                    <td className="px-5 py-3 text-sm font-body text-foreground">{member.activeLoans}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={member.status === "active" ? "available" : member.status === "suspended" ? "destructive" : "secondary"}
                      >
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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

export default MembersPage;
