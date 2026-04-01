import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Tags,
  Plus,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useHealthCheck } from "@workspace/api-client-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/events", label: "All Events", icon: CalendarDays },
    { href: "/categories", label: "Categories", icon: Tags },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span>AI Events</span>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          <div className="mb-4">
            <Link href="/events/new">
              <Button className="w-full justify-start gap-2" data-testid="button-new-event-sidebar">
                <Plus className="w-4 h-4" />
                New Event
              </Button>
            </Link>
          </div>
          
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
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
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

        {health && (
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="status-health">
              <div className={cn("w-2 h-2 rounded-full", health.status === 'ok' ? 'bg-green-500' : 'bg-red-500')} />
              <span>System: {health.status}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
