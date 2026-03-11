import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useBooks } from "@/hooks/useBooks";
import { useLoans } from "@/hooks/useLoans";
import { useMemberCount } from "@/hooks/useMembers";
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, TrendingUp, Clock, Flame } from "lucide-react";

const AdminPage = () => {
  const { data: allBooks = [], isLoading: booksLoading } = useBooks();
  const { data: activeLoansData = [], isLoading: activeLoading } = useLoans({ status: "active" });
  const { data: overdueLoansData = [], isLoading: overdueLoading } = useLoans({ status: "overdue" });
  const { data: recentLoans = [], isLoading: recentLoading } = useLoans({ limit: 5 });
  const { data: allLoansForPopularity = [], isLoading: popularityLoading } = useLoans({ limit: 100 });
  const { data: activeMembers = 0, isLoading: membersLoading } = useMemberCount();

  const statsLoading = booksLoading || activeLoading || overdueLoading || membersLoading;

  const stats = [
    { label: "Total Books", value: allBooks.length.toString(), icon: BookOpen, color: "text-primary" },
    { label: "Active Members", value: activeMembers.toString(), icon: Users, color: "text-emerald-400" },
    { label: "Active Loans", value: activeLoansData.length.toString(), icon: ArrowLeftRight, color: "text-blue-400" },
    { label: "Overdue", value: overdueLoansData.length.toString(), icon: AlertTriangle, color: "text-red-400" },
  ];

  const popularBooks = useMemo(() => {
    const counts = new Map<string, { bookId: string; title: string; count: number }>();
    for (const loan of allLoansForPopularity) {
      if (!loan.bookId) continue;
      const existing = counts.get(loan.bookId);
      if (existing) {
        existing.count++;
      } else {
        counts.set(loan.bookId, { bookId: loan.bookId, title: loan.bookTitle, count: 1 });
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [allLoansForPopularity]);

  const lowAvailability = useMemo(() => {
    return allBooks
      .filter((b) => b.copies > 1 && b.availableCopies <= 1)
      .sort((a, b) => a.availableCopies - b.availableCopies)
      .slice(0, 5);
  }, [allBooks]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground font-body mt-1">Library overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">
              {statsLoading ? (
                <span className="inline-block h-8 w-12 bg-secondary rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
            <p className="text-xs font-body text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Loans */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent Loans</h2>
        </div>
        {recentLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-3 bg-secondary rounded animate-pulse w-1/4" />
                <div className="h-3 bg-secondary rounded animate-pulse w-1/6" />
                <div className="h-3 bg-secondary rounded animate-pulse w-1/6" />
              </div>
            ))}
          </div>
        ) : recentLoans.length === 0 ? (
          <div className="p-5">
            <p className="text-sm font-body text-muted-foreground">No loans recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Book</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Member</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Borrowed</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Due</th>
                  <th className="text-left text-xs font-body font-medium text-muted-foreground px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-body text-foreground">
                      {loan.bookId ? (
                        <Link to={`/book/${loan.bookId}`} className="hover:underline hover:text-copper transition-colors">
                          {loan.bookTitle}
                        </Link>
                      ) : (
                        loan.bookTitle
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.memberName}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.borrowDate}</td>
                    <td className="px-5 py-3 text-sm font-body text-muted-foreground">{loan.dueDate}</td>
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
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Books */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Popular Books</h2>
          </div>
          {popularityLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-3 bg-secondary rounded animate-pulse" />
              ))}
            </div>
          ) : popularBooks.length === 0 ? (
            <div className="p-5">
              <p className="text-sm font-body text-muted-foreground">Not enough loan data yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {popularBooks.map((book, i) => (
                <div key={book.bookId} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-elevated/50 transition-colors">
                  <span className="text-xs font-body font-semibold text-muted-foreground w-5 text-right">{i + 1}</span>
                  <Link
                    to={`/book/${book.bookId}`}
                    className="text-sm font-body font-medium text-foreground hover:underline hover:text-copper transition-colors flex-1 truncate"
                  >
                    {book.title}
                  </Link>
                  <span className="text-xs font-body text-muted-foreground whitespace-nowrap">
                    {book.count} {book.count === 1 ? "loan" : "loans"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Availability */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="font-display text-lg font-semibold text-foreground">Low Availability</h2>
          </div>
          {booksLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-3 bg-secondary rounded animate-pulse" />
              ))}
            </div>
          ) : lowAvailability.length === 0 ? (
            <div className="p-5">
              <p className="text-sm font-body text-muted-foreground">All books have healthy stock.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {lowAvailability.map((book) => (
                <div key={book.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-elevated/50 transition-colors">
                  <Link
                    to={`/book/${book.id}`}
                    className="text-sm font-body font-medium text-foreground hover:underline hover:text-copper transition-colors flex-1 truncate"
                  >
                    {book.title}
                  </Link>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-body font-medium ${
                    book.availableCopies === 0
                      ? "bg-red-500/15 text-red-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {book.availableCopies} of {book.copies} available
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
