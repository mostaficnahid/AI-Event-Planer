import {
  useGetDashboardSummary,
  useGetAnalytics,
  useGetUpcomingEvents,
  useGetRecentActivity,
  useListUsers,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays, Users, Activity, ArrowRight,
  DollarSign, TrendingUp, MapPin, Plus, ShieldCheck,
  Bot, Tags, Ticket, Star, Sparkles, UserCheck,
  Zap, Settings, BarChart3, FileText,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

/* ── shared helpers ── */

const statusColor: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  draft: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const activityIcon: Record<string, { bg: string; label: string }> = {
  created: { bg: "bg-emerald-500/15 text-emerald-500", label: "+" },
  updated: { bg: "bg-blue-500/15 text-blue-500", label: "✎" },
  rsvp: { bg: "bg-violet-500/15 text-violet-500", label: "R" },
  cancelled: { bg: "bg-red-500/15 text-red-500", label: "✕" },
  completed: { bg: "bg-teal-500/15 text-teal-500", label: "✓" },
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    borderRadius: "10px",
    fontSize: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  itemStyle: { color: "hsl(var(--foreground))" },
};

interface StatCardProps {
  title: string;
  value?: number | string;
  loading: boolean;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
}

function StatCard({ title, value, loading, icon, accent, sub }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/60">
      <div className="absolute inset-0 opacity-[0.03]" style={{ background: accent }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <p className="text-3xl font-black tracking-tight leading-none" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
                {value ?? 0}
              </p>
            )}
            {sub && !loading && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + "22" }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════ */

function AdminDashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetAnalytics();
  const { data: users, isLoading: isLoadingUsers } = useListUsers();
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity();

  const roleColors: Record<string, string> = {
    admin: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    organizer: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    attendee: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  };

  const adminActions = [
    { href: "/events", icon: CalendarDays, label: "Manage Events", desc: "Oversee all events", color: "#f59e0b" },
    { href: "/categories", icon: Tags, label: "Manage Categories", desc: "Create & edit categories", color: "#ef4444" },
    { href: "/ai-assistant", icon: Bot, label: "AI Assistant", desc: "Plan with GPT-5", color: "#8b5cf6" },
    { href: "/events/new", icon: Plus, label: "Create Event", desc: "Add a new event", color: "#10b981" },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#f59e0b22" }}>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Admin Control Panel</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Platform Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Full platform control — users, events, categories &amp; analytics
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/categories">
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                <Tags className="w-3.5 h-3.5" /> Categories
              </Button>
            </Link>
            <Link href="/events/new">
              <Button size="sm" className="gap-1.5 h-9 font-semibold shadow-sm"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                <Plus className="w-3.5 h-3.5" /> New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Events" value={summary?.totalEvents} loading={isLoadingSummary}
            icon={<CalendarDays className="w-5 h-5" style={{ color: "#f59e0b" }} />} accent="#f59e0b" />
          <StatCard title="Registered Users" value={users?.length} loading={isLoadingUsers}
            icon={<Users className="w-5 h-5" style={{ color: "#ef4444" }} />} accent="#ef4444" />
          <StatCard title="Platform Budget" value={summary?.totalBudget ? `$${Number(summary.totalBudget).toLocaleString()}` : "$0"} loading={isLoadingSummary}
            icon={<DollarSign className="w-5 h-5" style={{ color: "#10b981" }} />} accent="#10b981" />
          <StatCard title="Total Attendees" value={summary?.totalAttendees} loading={isLoadingSummary}
            icon={<UserCheck className="w-5 h-5" style={{ color: "#06b6d4" }} />} accent="#06b6d4" />
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {adminActions.map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href}>
                <Card className="border-border/60 hover:border-amber-500/30 transition-all cursor-pointer hover:shadow-md group h-full">
                  <CardContent className="p-4 flex flex-col gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "22" }}>
                      <Icon className="w-4.5 h-4.5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-amber-500 transition-colors leading-snug">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Event Status Breakdown</CardTitle>
              <CardDescription className="text-xs">Distribution across all platform events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? <Skeleton className="h-[220px] w-full rounded-lg" /> : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics?.statusBreakdown || []} cx="50%" cy="46%"
                        innerRadius={55} outerRadius={85} paddingAngle={4}
                        dataKey="count" stroke="hsl(var(--card))" strokeWidth={3}>
                        {analytics?.statusBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <RechartsTooltip {...tooltipStyle} />
                      <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Category Distribution</CardTitle>
              <CardDescription className="text-xs">Events grouped by category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? <Skeleton className="h-[220px] w-full rounded-lg" /> : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={analytics?.categoryDistribution || []} margin={{ top: 5, right: 5, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={72} />
                      <RechartsTooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                      <Bar dataKey="count" name="Events" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User table + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Registered Users</CardTitle>
                <CardDescription className="text-xs mt-0.5">All users on the platform</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">{users?.length ?? 0} total</Badge>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingUsers ? (
                <div className="space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
              ) : !users?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
              ) : (
                <div className="space-y-1.5">
                  {users.slice(0, 8).map(u => (
                    <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))" }}>
                        {u.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${roleColors[u.role] ?? ""}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary)/0.1)" }}>
                  <Activity className="w-3.5 h-3.5 text-primary" />
                </div>
                <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingActivity ? (
                <div className="space-y-4">{[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-2.5 w-16" /></div>
                  </div>
                ))}</div>
              ) : !recentActivity?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="relative space-y-4 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {recentActivity.slice(0, 6).map(activity => {
                    const meta = activityIcon[activity.type] ?? { bg: "bg-muted text-muted-foreground", label: "•" };
                    return (
                      <div key={activity.id} className="flex items-start gap-3 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-black border-2 border-background ${meta.bg}`}>
                          {meta.label}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-xs leading-snug">
                            <span className="font-semibold">{activity.eventTitle}</span>
                            <span className="text-muted-foreground ml-1">{activity.description}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{formatDateTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
}

/* ══════════════════════════════════════════════════════════
   ORGANIZER DASHBOARD
══════════════════════════════════════════════════════════ */

function OrganizerDashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetAnalytics();
  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useGetUpcomingEvents({ limit: 6 });

  const aiTools = [
    { label: "Generate Description", icon: FileText, color: "#6366f1", desc: "AI-written event copy" },
    { label: "Schedule Optimizer", icon: CalendarDays, color: "#8b5cf6", desc: "Best time slots" },
    { label: "Budget Estimator", icon: DollarSign, color: "#10b981", desc: "Full cost breakdown" },
    { label: "Theme Suggester", icon: Sparkles, color: "#f59e0b", desc: "Creative concepts" },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#8b5cf622" }}>
                <Zap className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">Organizer Workspace</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Event Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create, manage, and grow your events with AI-powered tools
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/ai-assistant">
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                <Bot className="w-3.5 h-3.5" /> AI Assistant
              </Button>
            </Link>
            <Link href="/events/new">
              <Button size="sm" className="gap-1.5 h-9 font-semibold shadow-sm"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(262 83% 58%))" }}>
                <Plus className="w-3.5 h-3.5" /> New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Events" value={summary?.totalEvents} loading={isLoadingSummary}
            icon={<CalendarDays className="w-5 h-5" style={{ color: "#6366f1" }} />} accent="#6366f1" />
          <StatCard title="Total Attendees" value={summary?.totalAttendees} loading={isLoadingSummary}
            icon={<Users className="w-5 h-5" style={{ color: "#06b6d4" }} />} accent="#06b6d4" />
          <StatCard title="Budget Allocated" value={summary?.totalBudget ? `$${Number(summary.totalBudget).toLocaleString()}` : "$0"} loading={isLoadingSummary}
            icon={<DollarSign className="w-5 h-5" style={{ color: "#10b981" }} />} accent="#10b981" />
          <StatCard title="Budget Used" value={summary?.totalBudgetUsed ? `$${Number(summary.totalBudgetUsed).toLocaleString()}` : "$0"} loading={isLoadingSummary}
            icon={<TrendingUp className="w-5 h-5" style={{ color: "#f59e0b" }} />} accent="#f59e0b" />
        </div>

        {/* AI Planning Tools */}
        <Card className="border-border/60 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary)/0.04))" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#8b5cf622" }}>
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <CardTitle className="text-sm font-bold">AI Planning Tools</CardTitle>
                <Badge variant="outline" className="text-[10px] px-1.5 border-violet-500/30 text-violet-400 bg-violet-500/5">GPT-5</Badge>
              </div>
              <Link href="/ai-assistant">
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground px-2.5">
                  Open Chat <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {aiTools.map(({ label, icon: Icon, color, desc }) => (
                <Link key={label} href="/events/new">
                  <div className="p-3.5 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ background: color + "22" }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-xs font-semibold group-hover:text-primary transition-colors leading-snug">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Attendance Trends</CardTitle>
              <CardDescription className="text-xs">Monthly attendee numbers across events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? <Skeleton className="h-[220px] w-full rounded-lg" /> : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.attendanceByMonth || []} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <RechartsTooltip {...tooltipStyle} />
                      <Area type="monotone" dataKey="attendees" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAtt)" dot={false} activeDot={{ r: 5, fill: "#6366f1" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Budget vs Actual</CardTitle>
              <CardDescription className="text-xs">Top events by allocated budget</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? <Skeleton className="h-[220px] w-full rounded-lg" /> : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.budgetVsActual || []} margin={{ top: 5, right: 5, left: -14, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <RechartsTooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="budget" name="Allocated" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="actual" name="Used" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Upcoming Events</CardTitle>
              <CardDescription className="text-xs mt-0.5">Your next scheduled events</CardDescription>
            </div>
            <Link href="/events">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground px-2.5">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingUpcoming ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : !upcomingEvents?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No upcoming events</p>
                <Link href="/events/new" className="mt-3">
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                    <Plus className="w-3.5 h-3.5" /> Create event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingEvents.map(event => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 border border-border/60 text-center" style={{ background: "hsl(var(--primary)/0.08)" }}>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-primary/80 leading-none">
                          {new Date(event.startDate).toLocaleString("default", { month: "short" })}
                        </span>
                        <span className="text-base font-black text-primary leading-tight">
                          {new Date(event.startDate).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{event.attendeeCount}{event.maxAttendees ? ` / ${event.maxAttendees}` : ""}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize shrink-0 ${statusColor[event.status] ?? "bg-muted"}`}>
                        {event.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}

/* ══════════════════════════════════════════════════════════
   ATTENDEE DASHBOARD
══════════════════════════════════════════════════════════ */

function AttendeeDashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useGetUpcomingEvents({ limit: 9 });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const attendeeLinks = [
    { href: "/events", icon: CalendarDays, label: "Browse All Events", desc: "Discover & RSVP to events", color: "#06b6d4" },
    { href: "/profile", icon: Settings, label: "My Profile", desc: "Edit your information", color: "#8b5cf6" },
    { href: "/events", icon: Ticket, label: "My RSVPs", desc: "View your confirmed events", color: "#10b981" },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#06b6d422" }}>
                <Ticket className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Attendee Portal</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Discover upcoming events and manage your RSVPs
            </p>
          </div>
          <Link href="/profile">
            <Button variant="outline" size="sm" className="gap-1.5 h-9">
              <Settings className="w-3.5 h-3.5" /> My Profile
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Available Events" value={summary?.totalEvents} loading={isLoadingSummary}
            icon={<CalendarDays className="w-5 h-5" style={{ color: "#06b6d4" }} />} accent="#06b6d4" sub="On the platform" />
          <StatCard title="Upcoming" value={upcomingEvents?.length} loading={isLoadingUpcoming}
            icon={<Ticket className="w-5 h-5" style={{ color: "#10b981" }} />} accent="#10b981" sub="Events to discover" />
          <StatCard title="Community" value={summary?.totalAttendees} loading={isLoadingSummary}
            icon={<Users className="w-5 h-5" style={{ color: "#8b5cf6" }} />} accent="#8b5cf6" sub="Total attendees" />
          <StatCard title="Total Budget" value={summary?.totalBudget ? `$${Number(summary.totalBudget).toLocaleString()}` : "$0"} loading={isLoadingSummary}
            icon={<Star className="w-5 h-5" style={{ color: "#f59e0b" }} />} accent="#f59e0b" sub="Across all events" />
        </div>

        {/* Discover Events */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                <CardTitle className="text-base font-bold">Discover Upcoming Events</CardTitle>
              </div>
              <CardDescription className="text-xs">Browse and RSVP to events that interest you</CardDescription>
            </div>
            <Link href="/events">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground px-2.5">
                Browse all <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingUpcoming ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : !upcomingEvents?.length ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "hsl(var(--primary)/0.07)" }}>
                  <CalendarDays className="w-7 h-7 text-primary/40" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">No upcoming events yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Check back soon — new events are added regularly</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingEvents.map(event => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="p-4 rounded-xl border border-border/50 bg-muted/10 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all cursor-pointer group flex flex-col gap-3">

                      {/* Date + status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 border border-border/60 text-center" style={{ background: "hsl(180 80% 50% / 0.07)" }}>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-500/80 leading-none">
                              {new Date(event.startDate).toLocaleString("default", { month: "short" })}
                            </span>
                            <span className="text-sm font-black text-cyan-500 leading-tight">
                              {new Date(event.startDate).getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">{new Date(event.startDate).toLocaleDateString("default", { weekday: "short" })}</p>
                            <p className="text-[10px] font-medium text-muted-foreground">{new Date(event.startDate).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${statusColor[event.status] ?? "bg-muted"}`}>
                          {event.status}
                        </span>
                      </div>

                      {/* Title & location */}
                      <div>
                        <h3 className="text-sm font-semibold leading-snug group-hover:text-cyan-500 transition-colors line-clamp-2">{event.title}</h3>
                        {event.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{event.location}</span>
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendeeCount}{event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                        </span>
                        <span className="text-[10px] font-semibold text-cyan-500 group-hover:text-cyan-400 transition-colors flex items-center gap-0.5">
                          View &amp; RSVP <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">Quick Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {attendeeLinks.map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={label} href={href}>
                <Card className="border-border/60 hover:border-cyan-500/30 transition-all cursor-pointer hover:shadow-md group">
                  <CardContent className="p-4 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "22" }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-cyan-500 transition-colors">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN ENTRY — dispatches by role
══════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "organizer") return <OrganizerDashboard />;
  return <AttendeeDashboard />;
}
