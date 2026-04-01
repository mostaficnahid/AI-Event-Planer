import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Tags,
  Plus,
  Bot,
  User as UserIcon,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useHealthCheck, useLogout } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: health } = useHealthCheck();
  const { user, clearAuth } = useAuth();
  const { theme, setTheme } = useTheme();
  const logoutMutation = useLogout();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/events", label: "All Events", icon: CalendarDays },
    { href: "/categories", label: "Categories", icon: Tags },
    { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  ];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearAuth();
        setLocation("/login");
      }
    });
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span>AI Events</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          <div className="mb-4">
            <Link href="/events/new">
              <Button className="w-full justify-start gap-2 shadow-sm" data-testid="button-new-event-sidebar">
                <Plus className="w-4 h-4" />
                New Event
              </Button>
            </Link>
          </div>
          
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Menu
          </div>
          
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  data-testid={`link-sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border mt-auto flex flex-col gap-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <Link href="/profile">
                <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors" data-testid="link-sidebar-profile">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate leading-tight">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate leading-tight capitalize">{user.role}</span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-2 px-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 shrink-0 text-muted-foreground"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  title="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
              <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  Toggle Theme
                </Button>
            </div>
          )}

          {health && (
            <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground" data-testid="status-health">
              <div className={cn("w-2 h-2 rounded-full", health.status === 'ok' ? 'bg-green-500' : 'bg-red-500')} />
              <span>System: {health.status}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card md:hidden shrink-0">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span>AI Events</span>
          </div>
          <Link href="/events/new">
            <Button size="sm" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
