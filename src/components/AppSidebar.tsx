import {
  Home,
  BookOpen,
  Library,
  CalendarClock,
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  BookMarked,
  BookCopy,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/RoleGuard";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
}

const browseItems: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Catalog", url: "/catalog", icon: BookOpen },
  { title: "My Books", url: "/my-books", icon: Library, requiresAuth: true },
  { title: "Reservations", url: "/reservations", icon: CalendarClock, requiresAuth: true },
];

const adminItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Manage Catalog", url: "/admin/catalog", icon: BookCopy },
  { title: "Members", url: "/members", icon: Users },
  { title: "Loans", url: "/loans", icon: ArrowLeftRight },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { session, profile, isConfigured, signOut } = useAuth();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const isAuthenticated = session !== null || !isConfigured;

  const visibleBrowseItems = browseItems.filter(
    (item) => !item.requiresAuth || isAuthenticated,
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-warm flex items-center justify-center shadow-glow">
            <BookMarked className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-foreground">Athenaeum</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-body">
            Browse
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleBrowseItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-foreground font-medium"
                    >
                      <item.icon className="w-4 h-4 mr-2.5" />
                      {!collapsed && <span className="font-body text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <RoleGuard allow={["librarian", "admin"]}>
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground/60 text-[11px] uppercase tracking-widest font-body">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                        to={item.url}
                        className="text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                        activeClassName="bg-sidebar-accent text-foreground font-medium"
                      >
                        <item.icon className="w-4 h-4 mr-2.5" />
                        {!collapsed && <span className="font-body text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </RoleGuard>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          session && profile ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-elevated">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-body font-semibold text-primary">
                  {profile.full_name?.charAt(0)?.toUpperCase() ||
                    profile.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-foreground truncate">
                  {profile.full_name || "User"}
                </p>
                <p className="text-xs font-body text-muted-foreground truncate">
                  {profile.email}
                </p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-3 p-2 rounded-lg bg-surface-elevated hover:bg-surface-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-body font-semibold text-secondary-foreground">?</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-foreground truncate">Sign In</p>
                <p className="text-xs font-body text-muted-foreground truncate">Log in to your account</p>
              </div>
            </NavLink>
          )
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
