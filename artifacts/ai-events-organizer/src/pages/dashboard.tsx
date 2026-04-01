import { useGetDashboardSummary, useGetAnalytics, useGetUpcomingEvents, useGetRecentActivity } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Users, CheckCircle2, CircleDashed, Activity, ArrowRight, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetAnalytics();
  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useGetUpcomingEvents({ limit: 5 });
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity();

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your events and financial performance.</p>
          </div>
          <Link href="/events/new">
            <Button data-testid="button-create-event-dash" className="shadow-sm">Create Event</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Events" 
            value={summary?.totalEvents} 
            loading={isLoadingSummary} 
            icon={<CalendarDays className="w-4 h-4 text-muted-foreground" />} 
          />
          <StatCard 
            title="Total Attendees" 
            value={summary?.totalAttendees} 
            loading={isLoadingSummary} 
            icon={<Users className="w-4 h-4 text-primary" />} 
          />
          <StatCard 
            title="Total Budget" 
            value={summary?.totalBudget ? `$${summary.totalBudget.toLocaleString()}` : '$0'} 
            loading={isLoadingSummary} 
            icon={<DollarSign className="w-4 h-4 text-muted-foreground" />} 
          />
          <StatCard 
            title="Budget Used" 
            value={summary?.totalBudgetUsed ? `$${summary.totalBudgetUsed.toLocaleString()}` : '$0'} 
            loading={isLoadingSummary} 
            icon={<Activity className="w-4 h-4 text-muted-foreground" />} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>Monthly attendee numbers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.attendanceByMonth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAttendees" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="attendees" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendees)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Event Status</CardTitle>
              <CardDescription>Current breakdown of all events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.statusBreakdown || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      >
                        {analytics?.statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Top events by budget allocated</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.budgetVsActual || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="budget" name="Allocated Budget" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="actual" name="Used Budget" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Events grouped by category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={analytics?.categoryDistribution || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Bar dataKey="count" name="Total Events" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <Card className="lg:col-span-2 flex flex-col shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your next scheduled events</CardDescription>
              </div>
              <Link href="/events">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoadingUpcoming ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : upcomingEvents?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <CalendarDays className="w-8 h-8 mb-2 opacity-20" />
                  <p>No upcoming events.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {upcomingEvents?.map(event => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group shadow-sm" data-testid={`card-upcoming-${event.id}`}>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{event.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{formatDate(event.startDate)}</span>
                            <span>&bull;</span>
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-center">
                          <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="shadow-none">
                            {event.status}
                          </Badge>
                          <div className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {event.attendeeCount} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="flex flex-col shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoadingActivity ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                  <p>No recent activity.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {recentActivity?.map((activity) => (
                    <div key={activity.id} className="relative flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 z-10 text-muted-foreground text-xs font-bold">
                        {activity.type === 'created' ? '+' : 
                         activity.type === 'updated' ? '✎' : 
                         activity.type === 'rsvp' ? 'R' : 
                         activity.type === 'cancelled' ? '✕' : '✓'}
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-sm">
                          <span className="font-medium text-foreground">{activity.eventTitle}</span>
                          <span className="text-muted-foreground ml-1">{activity.description}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, loading, icon }: { title: string, value?: number | string, loading: boolean, icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-muted/50 rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold tracking-tight" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value || 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
