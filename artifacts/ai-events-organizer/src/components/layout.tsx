import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CalendarDays,
  Tags,
  Plus,
  Bot,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Home,
  ShieldCheck,
  Zap,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHealthCheck, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

const roleMeta = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    navItems: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/events", label: "Events", icon: CalendarDays },
      { href: "/categories", label: "Categories", icon: Tags },
      { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
    ],
  },
  organizer: {
    label: "Organizer",
    icon: Zap,
    badge: "bg-violet-500/10 text-violet-500 border-violet-500/30",
    navItems: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/events", label: "Events", icon: CalendarDays },
      { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
    ],
  },
  attendee: {
    label: "Attendee",
    icon: Ticket,
    badge: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    navItems: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/events", label: "Browse Events", icon: CalendarDays },
    ],
  },
};

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: health } = useHealthCheck();
  const { user, clearAuth } = useAuth();
  const { theme, setTheme } = useTheme();
  const logoutMutation = useLogout();

  const role = (user?.role ?? "attendee") as keyof typeof roleMeta;
  const meta = roleMeta[role] ?? roleMeta.attendee;
  const navItems = meta.navItems;
  const isAttendee = role === "attendee";
  const RoleIcon = meta.icon;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearAuth();
        setLocation("/login");
      },
    });
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 border-r border-border flex flex-col hidden md:flex" style={{ background: "hsl(var(--card))" }}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 transition-opacity group-hover:opacity-80" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 58%))" }}>
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[15px] tracking-tight group-hover:text-primary transition-colors">AI Events</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-4 pb-2 overflow-y-auto">
          {/* New Event — hidden for attendees */}
          {!isAttendee && (
            <Link href="/events/new">
              <Button
                className="w-full justify-center gap-2 mb-3 h-9 text-sm font-semibold shadow-sm"
                data-testid="button-new-event-sidebar"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 58%))" }}
              >
                <Plus className="w-4 h-4" />
                New Event
              </Button>
            </Link>
          )}

          {/* Back to Landing Page */}
          <Link href="/">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 mb-3 h-9 text-sm font-medium"
              data-testid="button-home-sidebar"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          {/* Role indicator */}
          <div className="flex items-center gap-2 px-2 py-2 mb-1.5 rounded-lg" style={{ background: "hsl(var(--muted)/0.4)" }}>
            <RoleIcon className="w-3.5 h-3.5 shrink-0" style={{ color: role === "admin" ? "#f59e0b" : role === "organizer" ? "#8b5cf6" : "#06b6d4" }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 flex-1">{meta.label} Panel</span>
            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-semibold capitalize border", meta.badge)}>
              {meta.label}
            </Badge>
          </div>

          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  data-testid={`link-sidebar-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-primary/50 shrink-0" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + controls */}
        <div className="px-3 pb-4 pt-2 border-t border-border shrink-0 space-y-2">
          {user ? (
            <>
              <Link href="/profile">
                <div
                  className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
                  data-testid="link-sidebar-profile"
                >
                  <Avatar className="w-8 h-8 shrink-0 ring-1 ring-border">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="text-[11px] font-bold" style={{ background: "hsl(var(--primary)/0.15)", color: "hsl(var(--primary))" }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-[13px] font-semibold truncate leading-snug">{user.name}</span>
                    <span className={cn("text-[10px] font-semibold capitalize leading-snug px-1.5 py-0 rounded w-fit border mt-0.5", meta.badge)}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 px-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 font-medium"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 shrink-0 text-muted-foreground hover:text-foreground rounded-lg"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                Sign In
              </Button>
            </Link>
          )}

          {health && (
            <div
              className="flex items-center gap-1.5 px-2 pt-1 text-[11px] text-muted-foreground/50"
              data-testid="status-health"
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  health.status === "ok" ? "bg-emerald-500" : "bg-red-500"
                )}
              />
              System {health.status === "ok" ? "operational" : "degraded"}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0 md:hidden" style={{ background: "hsl(var(--card))" }}>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 58%))" }}>
                <CalendarDays className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">AI Events</span>
            </div>
          </Link>
          {!isAttendee && (
            <Link href="/events/new">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
