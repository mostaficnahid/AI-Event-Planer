import {
  useGetDashboardSummary,
  useGetAnalytics,
  useGetUpcomingEvents,
  useGetRecentActivity,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays, Users, Activity, ArrowRight,
  DollarSign, TrendingUp, MapPin, Plus,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

/* ── helpers ── */

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

/* ── stat card ── */

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
              <p
                className="text-3xl font-black tracking-tight leading-none"
                data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {value ?? 0}
              </p>
            )}
            {sub && !loading && (
              <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + "22" }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── tooltip style shared ── */
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

/* ── main page ── */

export default function Dashboard() {
  const { user } = useAuth();
  const isAttendee = user?.role === "attendee";
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetAnalytics();
  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useGetUpcomingEvents({ limit: 5 });
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout>
      <div className="flex flex-col gap-7">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-0.5">
              {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </p>
            <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          </div>
          {!isAttendee && (
            <Link href="/events/new">
              <Button data-testid="button-create-event-dash" size="sm" className="gap-1.5 h-9 shadow-sm font-semibold">
                <Plus className="w-3.5 h-3.5" />
                New Event
              </Button>
            </Link>
          )}
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Events"
            value={summary?.totalEvents}
            loading={isLoadingSummary}
            icon={<CalendarDays className="w-5 h-5" style={{ color: "#6366f1" }} />}
            accent="#6366f1"
          />
          <StatCard
            title="Total Attendees"
            value={summary?.totalAttendees}
            loading={isLoadingSummary}
            icon={<Users className="w-5 h-5" style={{ color: "#06b6d4" }} />}
            accent="#06b6d4"
          />
          <StatCard
            title="Total Budget"
            value={summary?.totalBudget ? `$${Number(summary.totalBudget).toLocaleString()}` : "$0"}
            loading={isLoadingSummary}
            icon={<DollarSign className="w-5 h-5" style={{ color: "#10b981" }} />}
            accent="#10b981"
          />
          <StatCard
            title="Budget Used"
            value={summary?.totalBudgetUsed ? `$${Number(summary.totalBudgetUsed).toLocaleString()}` : "$0"}
            loading={isLoadingSummary}
            icon={<TrendingUp className="w-5 h-5" style={{ color: "#f59e0b" }} />}
            accent="#f59e0b"
          />
        </div>

        {/* ── Charts 2×2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Attendance Trends */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Attendance Trends</CardTitle>
              <CardDescription className="text-xs">Monthly attendee numbers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[240px] w-full rounded-lg" />
              ) : (
                <div className="h-[240px]">
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

          {/* Status Breakdown */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Event Status</CardTitle>
              <CardDescription className="text-xs">Breakdown of all events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[240px] w-full rounded-lg" />
              ) : (
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.statusBreakdown || []}
                        cx="50%" cy="48%"
                        innerRadius={58} outerRadius={90}
                        paddingAngle={4}
                        dataKey="count"
                        stroke="hsl(var(--card))"
                        strokeWidth={3}
                      >
                        {analytics?.statusBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip {...tooltipStyle} />
                      <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Budget vs Actual</CardTitle>
              <CardDescription className="text-xs">Top events by allocated budget</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[240px] w-full rounded-lg" />
              ) : (
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.budgetVsActual || []} margin={{ top: 5, right: 5, left: -14, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <RechartsTooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="budget" name="Allocated" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="actual" name="Used" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Category Distribution</CardTitle>
              <CardDescription className="text-xs">Events grouped by category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[240px] w-full rounded-lg" />
              ) : (
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={analytics?.categoryDistribution || []} margin={{ top: 5, right: 5, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={72} />
                      <RechartsTooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                      <Bar dataKey="count" name="Events" fill="#06b6d4" radius={[0, 4, 4, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Upcoming + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Upcoming Events */}
          <Card className="lg:col-span-2 border-border/60">
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
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[72px] w-full rounded-lg" />)}
                </div>
              ) : !upcomingEvents?.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
                    <CalendarDays className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No upcoming events</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Create your first event to get started</p>
                  {!isAttendee && (
                    <Link href="/events/new" className="mt-4">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                        <Plus className="w-3.5 h-3.5" /> Create event
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div
                        className="flex items-center gap-4 p-3.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group"
                        data-testid={`card-upcoming-${event.id}`}
                      >
                        {/* Date chip */}
                        <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 text-center border border-border/60" style={{ background: "hsl(var(--primary)/0.08)" }}>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary/80 leading-none">
                            {new Date(event.startDate).toLocaleString("default", { month: "short" })}
                          </span>
                          <span className="text-lg font-black text-primary leading-tight">
                            {new Date(event.startDate).getDate()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors leading-snug">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2.5 mt-1 text-xs text-muted-foreground">
                            {event.location && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[160px]">{event.location}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 shrink-0">
                              <Users className="w-3 h-3" />
                              {event.attendeeCount}{event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusColor[event.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {event.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
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
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !recentActivity?.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="relative space-y-4 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {recentActivity.map((activity) => {
                    const meta = activityIcon[activity.type] ?? { bg: "bg-muted text-muted-foreground", label: "•" };
                    return (
                      <div key={activity.id} className="flex items-start gap-3 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-black border-2 border-background ${meta.bg}`}>
                          {meta.label}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-xs leading-snug">
                            <span className="font-semibold text-foreground">{activity.eventTitle}</span>
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
