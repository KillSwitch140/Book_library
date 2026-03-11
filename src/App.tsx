import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import HomePage from "@/pages/HomePage";
import CatalogPage from "@/pages/CatalogPage";
import MyBooksPage from "@/pages/MyBooksPage";
import ReservationsPage from "@/pages/ReservationsPage";
import AdminPage from "@/pages/AdminPage";
import CatalogManagementPage from "@/pages/CatalogManagementPage";
import MembersPage from "@/pages/MembersPage";
import MemberDetailPage from "@/pages/MemberDetailPage";
import LoansPage from "@/pages/LoansPage";
import BookDetailPage from "@/pages/BookDetailPage";
import NotFound from "@/pages/NotFound";
import { queryClient } from "@/lib/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth pages — outside AppLayout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* App pages — inside AppLayout */}
            <Route element={<AppLayout />}>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/book/:id" element={<BookDetailPage />} />

              {/* Auth required */}
              <Route path="/my-books" element={<ProtectedRoute><MyBooksPage /></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />

              {/* Staff only */}
              <Route path="/admin" element={<ProtectedRoute requiredRole={["librarian", "admin"]}><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/catalog" element={<ProtectedRoute requiredRole={["librarian", "admin"]}><CatalogManagementPage /></ProtectedRoute>} />
              <Route path="/members" element={<ProtectedRoute requiredRole={["librarian", "admin"]}><MembersPage /></ProtectedRoute>} />
              <Route path="/members/:id" element={<ProtectedRoute requiredRole={["librarian", "admin"]}><MemberDetailPage /></ProtectedRoute>} />
              <Route path="/loans" element={<ProtectedRoute requiredRole={["librarian", "admin"]}><LoansPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
